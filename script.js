/* Nova AI frontend. Private brain.json and Python code stay on the server. */
"use strict";

const CONFIG = {
  API_URL: "/api/chat",
  STORAGE_KEY: "nova_ai_conversations_v1",
  THEME_KEY: "nova_ai_theme_v1",
  MAX_MESSAGE_LENGTH: 12000,
  REQUEST_TIMEOUT: 45000,
  MAX_HISTORY: 100
};

const $ = s => document.querySelector(s);
const chatArea=$("#chatArea"), messagesEl=$("#messages"), welcomeScreen=$("#welcomeScreen");
const chatForm=$("#chatForm"), messageInput=$("#messageInput"), sendBtn=$("#sendBtn"), stopBtn=$("#stopBtn");
const charCounter=$("#charCounter"), conversationList=$("#conversationList"), searchInput=$("#searchInput");
const newChatBtn=$("#newChatBtn"), newChatTop=$("#newChatTop"), clearHistoryBtn=$("#clearHistoryBtn");
const sidebar=$("#sidebar"), sidebarOverlay=$("#sidebarOverlay"), openSidebarBtn=$("#openSidebar"), closeSidebarBtn=$("#closeSidebar");
const themeBtn=$("#themeBtn"), themeIcon=$("#themeIcon"), statusDot=$("#statusDot"), statusText=$("#statusText");
const errorBanner=$("#errorBanner"), errorText=$("#errorText"), retryBtn=$("#retryBtn"), dismissError=$("#dismissError");
const toastContainer=$("#toastContainer"), contextMenu=$("#contextMenu");

let conversations=loadConversations(), currentConversationId=null, activeController=null;
let lastFailedMessage=null, contextMenuConversationId=null, isGenerating=false;

document.addEventListener("DOMContentLoaded",()=>{
  initializeTheme(); initializeConversation(); bindEvents();
  renderConversationList(); updateCharacterCounter(); checkServerStatus();
});

function bindEvents(){
  chatForm.addEventListener("submit",e=>{e.preventDefault();handleSend()});
  messageInput.addEventListener("input",()=>{autoResizeTextarea();updateCharacterCounter()});
  messageInput.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSend()}});
  newChatBtn.addEventListener("click",createNewConversation);
  newChatTop.addEventListener("click",createNewConversation);
  searchInput.addEventListener("input",debounce(renderConversationList,180));
  clearHistoryBtn.addEventListener("click",clearAllConversations);
  stopBtn.addEventListener("click",stopGeneration);
  retryBtn.addEventListener("click",retryLastMessage);
  dismissError.addEventListener("click",hideError);
  themeBtn.addEventListener("click",toggleTheme);
  openSidebarBtn.addEventListener("click",openSidebar);
  closeSidebarBtn.addEventListener("click",closeSidebar);
  sidebarOverlay.addEventListener("click",closeSidebar);
  document.querySelectorAll(".suggestion").forEach(b=>b.addEventListener("click",()=>{
    messageInput.value=b.dataset.prompt; updateCharacterCounter(); autoResizeTextarea(); handleSend();
  }));
  document.addEventListener("click",e=>{if(!contextMenu.hidden&&!contextMenu.contains(e.target))hideContextMenu()});
  contextMenu.addEventListener("click",handleContextMenu);
  window.addEventListener("online",()=>updateConnectionStatus(true));
  window.addEventListener("offline",()=>updateConnectionStatus(false));
}

function loadConversations(){
  try{
    const raw=localStorage.getItem(CONFIG.STORAGE_KEY); if(!raw)return [];
    const parsed=JSON.parse(raw); return Array.isArray(parsed)?parsed.filter(isValidConversation).slice(0,CONFIG.MAX_HISTORY):[];
  }catch(e){console.error(e);return []}
}
function saveConversations(){try{localStorage.setItem(CONFIG.STORAGE_KEY,JSON.stringify(conversations))}catch(e){showToast("Chat history could not be saved.")}}
function isValidConversation(c){return !!(c&&typeof c.id==="string"&&typeof c.title==="string"&&Array.isArray(c.messages))}
function createConversation(){const now=Date.now();return{id:crypto.randomUUID?crypto.randomUUID():generateId(),title:"New conversation",createdAt:now,updatedAt:now,messages:[]}}
function createNewConversation(){const c=createConversation();conversations.unshift(c);currentConversationId=c.id;saveConversations();renderConversationList();renderMessages();closeSidebar();messageInput.focus();hideError()}
function initializeConversation(){if(!conversations.length){createNewConversation();return}currentConversationId=conversations[0].id;renderMessages()}
function getCurrentConversation(){return conversations.find(c=>c.id===currentConversationId)}

async function handleSend(){
  if(isGenerating)return;
  const message=messageInput.value.trim();
  if(!message)return;
  if(message.length>CONFIG.MAX_MESSAGE_LENGTH){showError("Your message is too long.");return}
  if(!navigator.onLine){showError("You appear to be offline.");return}
  let conversation=getCurrentConversation();
  if(!conversation){createNewConversation();conversation=getCurrentConversation()}
  hideError();
  conversation.messages.push({id:generateId(),role:"user",content:message,createdAt:Date.now()});
  if(conversation.messages.length===1||conversation.title==="New conversation")conversation.title=generateConversationTitle(message);
  conversation.updatedAt=Date.now(); saveConversations();
  messageInput.value="";autoResizeTextarea();updateCharacterCounter();renderMessages();renderConversationList();closeSidebar();
  await requestAIResponse(message,conversation.id);
}

async function requestAIResponse(message,conversationId){
  isGenerating=true; activeController=new AbortController(); setGeneratingUI(true); showTypingIndicator();
  const timeout=setTimeout(()=>activeController?.abort(),CONFIG.REQUEST_TIMEOUT);
  try{
    const response=await fetch(CONFIG.API_URL,{
      method:"POST",
      headers:{"Content-Type":"application/json","Accept":"application/json"},
      body:JSON.stringify({message,conversation_id:conversationId}),
      signal:activeController.signal
    });
    clearTimeout(timeout);removeTypingIndicator();
    if(!response.ok)throw new Error(`Server returned HTTP ${response.status}`);
    let data;try{data=await response.json()}catch{throw new Error("The server returned invalid JSON.")}
    if(!data||typeof data.reply!=="string")throw new Error("The AI server returned an invalid response.");
    const conversation=conversations.find(c=>c.id===conversationId);if(!conversation)return;
    conversation.messages.push({id:generateId(),role:"assistant",content:data.reply,createdAt:Date.now()});
    if(typeof data.conversation_id==="string"&&data.conversation_id)conversation.serverConversationId=data.conversation_id;
    conversation.updatedAt=Date.now();saveConversations();await renderMessagesWithAnimation();renderConversationList();updateConnectionStatus(true);
  }catch(error){
    clearTimeout(timeout);removeTypingIndicator();
    if(error.name==="AbortError"){if(isGenerating)showError("The request timed out or was cancelled.");return}
    console.error(error);lastFailedMessage={message,conversationId};showError(getFriendlyError(error));updateConnectionStatus(false);
  }finally{isGenerating=false;activeController=null;setGeneratingUI(false)}
}
function stopGeneration(){if(!activeController)return;isGenerating=false;activeController.abort();activeController=null;removeTypingIndicator();setGeneratingUI(false);showToast("Generation stopped.")}
async function retryLastMessage(){if(!lastFailedMessage)return;hideError();await requestAIResponse(lastFailedMessage.message,lastFailedMessage.conversationId)}
function setGeneratingUI(g){sendBtn.disabled=g;stopBtn.hidden=!g;messageInput.disabled=g;if(!g){messageInput.disabled=false;messageInput.focus()}}

function showTypingIndicator(){
  removeTypingIndicator();const wrapper=document.createElement("div");wrapper.id="typingIndicator";wrapper.className="message ai";
  const avatar=document.createElement("div");avatar.className="avatar ai";avatar.textContent="✦";
  const content=document.createElement("div");content.className="message-content";
  const bubble=document.createElement("div");bubble.className="message-bubble";
  const typing=document.createElement("div");typing.className="typing";
  for(let i=0;i<3;i++)typing.appendChild(document.createElement("span"));
  bubble.appendChild(typing);content.appendChild(bubble);wrapper.appendChild(avatar);wrapper.appendChild(content);messagesEl.appendChild(wrapper);scrollToBottom();
}
function removeTypingIndicator(){document.getElementById("typingIndicator")?.remove()}

function renderMessages(){
  const conversation=getCurrentConversation();messagesEl.replaceChildren();
  if(!conversation||!conversation.messages.length){welcomeScreen.hidden=false;return}
  welcomeScreen.hidden=true;
  conversation.messages.forEach(m=>messagesEl.appendChild(createMessageElement(m)));scrollToBottom();
}
async function renderMessagesWithAnimation(){renderMessages();await new Promise(r=>setTimeout(r,80));scrollToBottom()}

function createMessageElement(message){
  const wrapper=document.createElement("article");wrapper.className=`message ${message.role==="user"?"user":"ai"}`;
  const avatar=document.createElement("div");avatar.className=`avatar ${message.role==="user"?"user":"ai"}`;avatar.textContent=message.role==="user"?"You":"✦";
  const content=document.createElement("div");content.className="message-content";const bubble=document.createElement("div");bubble.className="message-bubble";
  if(message.role==="assistant")renderSafeMarkdown(bubble,message.content);else{const p=document.createElement("p");p.textContent=message.content;bubble.appendChild(p)}
  const meta=document.createElement("div");meta.className="message-meta";const time=document.createElement("span");time.textContent=formatTime(message.createdAt);meta.appendChild(time);
  if(message.role==="assistant"){meta.appendChild(createActionButton("Copy",()=>copyText(message.content)));meta.appendChild(createActionButton("Regenerate",()=>regenerateResponse(message)))}else meta.appendChild(createActionButton("Edit",()=>editUserMessage(message)));
  content.appendChild(bubble);content.appendChild(meta);wrapper.appendChild(avatar);wrapper.appendChild(content);return wrapper;
}

function renderSafeMarkdown(container,markdown){
  const lines=String(markdown).replace(/\r\n/g,"\n").split("\n");let inCode=false,codeLanguage="",codeLines=[],paragraphLines=[];
  function flushParagraph(){if(!paragraphLines.length)return;const p=document.createElement("p");renderInlineMarkdown(p,paragraphLines.join("\n"));container.appendChild(p);paragraphLines=[]}
  function flushCode(){const block=document.createElement("div");block.className="code-block";const header=document.createElement("div");header.className="code-header";const lang=document.createElement("span");lang.textContent=codeLanguage||"code";const copy=document.createElement("button");copy.className="copy-code";copy.type="button";copy.textContent="Copy";const code=codeLines.join("\n");copy.onclick=async()=>{await copyText(code);copy.textContent="Copied";setTimeout(()=>copy.textContent="Copy",1200)};header.append(lang,copy);const pre=document.createElement("pre"),ce=document.createElement("code");ce.textContent=code;pre.appendChild(ce);block.append(header,pre);container.appendChild(block);codeLines=[];codeLanguage=""}
  for(const line of lines){
    if(line.startsWith("```")){if(inCode){flushCode();inCode=false}else{flushParagraph();inCode=true;codeLanguage=line.slice(3).trim()}continue}
    if(inCode){codeLines.push(line);continue}
    if(!line.trim()){flushParagraph();continue}
    const heading=line.match(/^(#{1,3})\s+(.+)$/);if(heading){flushParagraph();const h=document.createElement(`h${Math.min(heading[1].length,3)}`);renderInlineMarkdown(h,heading[2]);container.appendChild(h);continue}
    paragraphLines.push(line)
  }
  if(inCode)flushCode();flushParagraph();
}
function renderInlineMarkdown(container,text){
  const regex=/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`|https?:\/\/[^\s]+)/g;let lastIndex=0,match;
  while((match=regex.exec(text))!==null){
    if(match.index>lastIndex)appendText(container,text.slice(lastIndex,match.index));const token=match[0];
    if(token.startsWith("**")||token.startsWith("__")){const e=document.createElement("strong");e.textContent=token.slice(2,-2);container.appendChild(e)}
    else if(token.startsWith("*")||token.startsWith("_")){const e=document.createElement("em");e.textContent=token.slice(1,-1);container.appendChild(e)}
    else if(token.startsWith("`")){const e=document.createElement("code");e.className="inline-code";e.textContent=token.slice(1,-1);container.appendChild(e)}
    else{const e=document.createElement("a");e.className="link";e.href=safeURL(token);e.target="_blank";e.rel="noopener noreferrer nofollow";e.textContent=token;container.appendChild(e)}
    lastIndex=regex.lastIndex;
  }
  if(lastIndex<text.length)appendText(container,text.slice(lastIndex));
}
function appendText(container,text){text.split("\n").forEach((p,i)=>{container.appendChild(document.createTextNode(p));if(i<text.split("\n").length-1)container.appendChild(document.createElement("br"))})}

async function regenerateResponse(message){
  if(isGenerating)return;const conversation=getCurrentConversation();if(!conversation)return;
  const index=conversation.messages.findIndex(m=>m.id===message.id);if(index===-1)return;
  conversation.messages.splice(index,1);saveConversations();renderMessages();const previous=conversation.messages[index-1];
  if(!previous||previous.role!=="user")return;await requestAIResponse(previous.content,conversation.id);
}
function editUserMessage(message){
  const conversation=getCurrentConversation();if(!conversation)return;const index=conversation.messages.findIndex(m=>m.id===message.id);if(index===-1)return;
  const originalText=message.content;conversation.messages=conversation.messages.slice(0,index);saveConversations();renderMessages();messageInput.value=originalText;updateCharacterCounter();autoResizeTextarea();messageInput.focus();showToast("Edit the message and press Enter.");
}

function renderConversationList(){
  conversationList.replaceChildren();const query=searchInput.value.trim().toLowerCase();
  const filtered=conversations.filter(c=>!query||c.title.toLowerCase().includes(query));
  if(!filtered.length){const e=document.createElement("div");e.style.cssText="padding:20px 8px;color:var(--muted);font-size:11px;text-align:center";e.textContent="No conversations found.";conversationList.appendChild(e);return}
  filtered.forEach(c=>{
    const item=document.createElement("div");item.className="conversation-item"+(c.id===currentConversationId?" active":"");
    const icon=document.createElement("span");icon.className="conversation-icon";icon.textContent="◌";
    const title=document.createElement("span");title.className="conversation-title";title.textContent=c.title;
    const menu=document.createElement("button");menu.className="conversation-menu-btn";menu.type="button";menu.textContent="⋯";menu.setAttribute("aria-label","Conversation options");
    menu.addEventListener("click",e=>{e.stopPropagation();showContextMenu(e,c.id)});item.append(icon,title,menu);
    item.addEventListener("click",()=>{currentConversationId=c.id;renderConversationList();renderMessages();closeSidebar()});conversationList.appendChild(item);
  });
}
function showContextMenu(event,id){contextMenuConversationId=id;contextMenu.hidden=false;const rect=event.currentTarget.getBoundingClientRect();const w=130;contextMenu.style.left=`${Math.min(rect.right-w,window.innerWidth-w-8)}px`;contextMenu.style.top=`${rect.bottom+5}px`}
function hideContextMenu(){contextMenu.hidden=true;contextMenuConversationId=null}
function handleContextMenu(event){
  const button=event.target.closest("button");if(!button)return;const action=button.dataset.action;const c=conversations.find(x=>x.id===contextMenuConversationId);if(!c)return;
  if(action==="rename"){const title=prompt("Enter a new conversation name:",c.title);if(title&&title.trim()){c.title=title.trim().slice(0,100);c.updatedAt=Date.now();saveConversations();renderConversationList();showToast("Conversation renamed.")}}
  if(action==="delete"){if(!confirm("Delete this conversation?")){hideContextMenu();return}conversations=conversations.filter(x=>x.id!==contextMenuConversationId);
    if(currentConversationId===contextMenuConversationId){if(conversations.length)currentConversationId=conversations[0].id;else{const n=createConversation();conversations=[n];currentConversationId=n.id}}
    saveConversations();renderConversationList();renderMessages();showToast("Conversation deleted.")}
  hideContextMenu();
}
function clearAllConversations(){if(!conversations.length)return;if(!confirm("Delete all conversation history?"))return;const n=createConversation();conversations=[n];currentConversationId=n.id;saveConversations();renderConversationList();renderMessages();showToast("Conversation history cleared.")}

function initializeTheme(){const saved=localStorage.getItem(CONFIG.THEME_KEY);document.documentElement.dataset.theme=saved==="light"||saved==="dark"?saved:(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");updateThemeIcon()}
function toggleTheme(){const next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;localStorage.setItem(CONFIG.THEME_KEY,next);updateThemeIcon()}
function updateThemeIcon(){themeIcon.textContent=document.documentElement.dataset.theme==="dark"?"☀":"☾"}

async function checkServerStatus(){updateConnectionStatus(navigator.onLine)}
function updateConnectionStatus(online){statusDot.classList.toggle("online",online);statusDot.classList.toggle("offline",!online);statusText.textContent=online?"Service ready":"Service unavailable"}

function openSidebar(){sidebar.classList.add("open");sidebarOverlay.classList.add("visible")}
function closeSidebar(){sidebar.classList.remove("open");sidebarOverlay.classList.remove("visible")}
function autoResizeTextarea(){messageInput.style.height="auto";messageInput.style.height=`${Math.min(messageInput.scrollHeight,190)}px`}
function updateCharacterCounter(){const n=messageInput.value.length;charCounter.textContent=`${n.toLocaleString()} / ${CONFIG.MAX_MESSAGE_LENGTH.toLocaleString()}`;charCounter.style.color=n>CONFIG.MAX_MESSAGE_LENGTH*.9?"var(--danger)":"var(--muted)"}
function showError(message){errorText.textContent=message;errorBanner.hidden=false}
function hideError(){errorBanner.hidden=true}
function getFriendlyError(error){if(!navigator.onLine)return"You are offline. Check your internet connection.";if(error.message.includes("Failed to fetch"))return"Could not connect to the Python AI server.";return error.message||"Something went wrong while contacting the AI."}
function showToast(message){const t=document.createElement("div");t.className="toast";t.textContent=message;toastContainer.appendChild(t);setTimeout(()=>t.remove(),2500)}
function generateId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,10)}
function generateConversationTitle(message){const c=message.replace(/\s+/g," ").trim();return c?c.length>42?c.slice(0,42)+"...":c:"New conversation"}
function formatTime(timestamp){return new Intl.DateTimeFormat(undefined,{hour:"numeric",minute:"2-digit"}).format(new Date(timestamp))}
function scrollToBottom(){requestAnimationFrame(()=>chatArea.scrollTop=chatArea.scrollHeight)}
function safeURL(value){try{const u=new URL(value);return u.protocol==="http:"||u.protocol==="https:"?u.href:"#"}catch{return"#"}}
async function copyText(text){try{await navigator.clipboard.writeText(text);showToast("Copied to clipboard.")}catch{showToast("Clipboard access was unavailable.")}}
function createActionButton(label,handler){const b=document.createElement("button");b.className="message-action";b.type="button";b.textContent=label;b.addEventListener("click",handler);return b}
function debounce(callback,delay){let timer;return(...args)=>{clearTimeout(timer);timer=setTimeout(()=>callback(...args),delay)}}
