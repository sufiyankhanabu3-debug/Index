
The Complete JavaScript Examples Guide
From beginner to advanced — runnable code, exact output, and why it works
This guide covers every core JavaScript topic in a logical learning order. Every example is short, copyable, and shows exactly what it prints.
How to run these examples:
Browser: Open DevTools (F12, or long-press → Inspect on mobile Chrome) → Console tab → paste and press Enter
Online editors: StackBlitz or Replit work well and run fine on mobile
Node.js: Save as file.js and run node file.js (the DOM and Events examples need a browser — Node has no webpage to work with)
A note on output: Outputs below are simplified for readability. Your actual browser/Node console may show arrays and objects as expandable trees instead of plain text — the values will always match.
Table of Contents
Part 1 — Beginner
Variables
Data Types
Operators
Conditions
Loops
Functions
Strings
Arrays
Part 2 — Intermediate 9. Objects 10. Array Methods (map, filter, reduce, find, forEach) 11. ES6+ (Destructuring, Spread, Rest) 12. DOM Manipulation 13. Events 14. JSON 15. Error Handling
Part 3 — Advanced 16. OOP (Classes & Inheritance) 17. Promises 18. Async/Await 19. Working with APIs (fetch) 20. Modules (import/export) 21. Important Built-in Methods (Math, Date, Object, Timers)
Part 1 — Beginner
1. Variables (var, let, const)
let name = "Ali";
const age = 20;
var city = "Lahore"; // old style, avoid using

console.log(name, age, city);

name = "Sara"; // let CAN be reassigned
// age = 21;   // ❌ Error: const CANNOT be reassigned
console.log(name);
Output:
Ali 20 Lahore
Sara
Why it works: let and const are the modern way to declare variables — both are block-scoped, meaning they only exist inside the { } they're declared in. Use const by default, and switch to let only when the value needs to change. Avoid var — it's function-scoped instead of block-scoped, which causes hard-to-find bugs.
2. Data Types
let str = "Hello";        // String
let num = 42;              // Number
let isActive = true;       // Boolean
let empty = null;          // Null — intentional "nothing"
let notDefined;             // Undefined — declared, no value yet
let big = 123n;             // BigInt — for huge numbers
let sym = Symbol("id");     // Symbol — unique identifier

console.log(typeof str, typeof num, typeof isActive, typeof empty, typeof notDefined, typeof big, typeof sym);
Output:
string number boolean object undefined bigint symbol
Why it works: JavaScript has 7 primitive types plus object. Notice typeof null returns "object" — that's a well-known historical quirk in the language kept for backward compatibility, not a mistake in this code. undefined means "declared but never given a value."
3. Operators
// Arithmetic
console.log(10 + 3, 10 - 3, 10 * 3, 10 / 3, 10 % 3, 2 ** 3);

// Comparison: == checks value only, === checks value AND type
console.log(5 == "5", 5 === "5", 5 !== "5");

// Logical
console.log(true && false, true || false, !true);
Output:
13 7 30 3.3333333333333335 1 8
true false true
false true false
Why it works: % (modulo) returns the remainder of a division, ** raises to a power. Always prefer ===/!== over ==/!= — loose equality silently converts types (5 == "5" is true), which causes subtle bugs. && needs both sides true, || needs at least one, ! flips a boolean.
4. Conditions (if/else, switch)
let marks = 85;

if (marks >= 90) {
  console.log("A+");
} else if (marks >= 80) {
  console.log("A");
} else {
  console.log("B");
}

let day = 3;
switch (day) {
  case 1:
    console.log("Monday");
    break;
  case 3:
    console.log("Wednesday");
    break;
  default:
    console.log("Unknown day");
}
Output:
A
Wednesday
Why it works: if/else if/else checks conditions in order and runs the first block that's true — since marks is 85, it skips the first check and matches the second. switch compares one value against several cases; break stops it "falling through" into the next case below.
5. Loops
// for loop — best when you know how many times to repeat
for (let i = 1; i <= 3; i++) {
  console.log("for:", i);
}

// while loop — repeats as long as a condition is true
let i = 0;
while (i < 3) {
  console.log("while:", i);
  i++;
}

// for...of — loops over VALUES of an array/string
for (const fruit of ["apple", "mango"]) {
  console.log("for...of:", fruit);
}
Output:
for: 1
for: 2
for: 3
while: 0
while: 1
while: 2
for...of: apple
for...of: mango
Why it works: All three repeat code but fit different situations. for is ideal with a known count. while is ideal when you only know a stopping condition, not an exact count. for...of is the cleanest way to loop over array/string values directly, without manually tracking an index.
6. Functions
// Function declaration
function add(a, b) {
  return a + b;
}

// Arrow function (ES6+) — shorter syntax
const multiply = (a, b) => a * b;

// Default parameter — used if no argument is passed
function greet(name = "Guest") {
  return `Hello, ${name}!`;
}

console.log(add(2, 3));
console.log(multiply(2, 3));
console.log(greet());
console.log(greet("Sufiyan"));
Output:
5
6
Hello, Guest!
Hello, Sufiyan!
Why it works: A function packages reusable logic. return sends a value back to the caller. Arrow functions (=>) are the modern go-to for short functions — (a, b) => a * b behaves like function(a, b) { return a * b; }. Default parameters prevent undefined errors when an argument is skipped.
7. Strings
let name = "Abu Sufiyan";

console.log(name.length);
console.log(name.toUpperCase());
console.log(name.slice(0, 3));
console.log(name.includes("Sufiyan"));
console.log(name.replace("Abu", "Mr."));
console.log(`My name is ${name}, it has ${name.length} characters.`);
Output:
11
ABU SUFIYAN
Abu
true
Mr. Sufiyan
My name is Abu Sufiyan, it has 11 characters.
Why it works: Strings come with built-in methods for reading and transforming text — slice(start, end) extracts characters by position, includes() checks for a substring. Template literals (backticks with ${expression}) build strings with embedded variables — cleaner than "My name is " + name + "...".
8. Arrays
let fruits = ["apple", "banana", "mango"];

console.log(fruits[0]);       // access by index (0-based)
fruits.push("orange");        // add to the end
fruits.pop();                 // remove from the end
fruits.unshift("grape");      // add to the start
console.log(fruits);
console.log(fruits.length);

for (let i = 0; i < fruits.length; i++) {
  console.log(i, fruits[i]);
}
Output:
apple
['grape', 'apple', 'banana', 'mango']
4
0 grape
1 apple
2 banana
3 mango
Why it works: Arrays hold ordered lists, indexed starting at 0. push/pop work on the end (fast); unshift/shift work on the start (slower, since every item shifts position). Here orange is added then immediately popped off, so it never appears in the final array.
Part 2 — Intermediate
9. Objects
const student = {
  name: "Abu Sufiyan",
  age: 17,
  isEnrolled: true,
  greet() {
    return `Hi, I'm ${this.name}`;
  }
};

console.log(student.name);      // dot notation
console.log(student["age"]);    // bracket notation
console.log(student.greet());

student.grade = "11";           // add a new property anytime
console.log(student.grade);
Output:
Abu Sufiyan
17
Hi, I'm Abu Sufiyan
11
Why it works: Objects store related data as key-value pairs — perfect for modeling real things (a student, a product, a car). this inside a method refers back to the object it's called on. Bracket notation obj["key"] is useful when the key comes from a variable instead of being typed directly.
10. Array Methods (map, filter, reduce, find, forEach)
const numbers = [1, 2, 3, 4, 5];

console.log(numbers.map(n => n * 2));            // transform every item
console.log(numbers.filter(n => n % 2 === 0));   // keep only matching items
console.log(numbers.reduce((sum, n) => sum + n, 0)); // combine into ONE value
console.log(numbers.find(n => n > 3));           // first matching item
numbers.forEach(n => console.log("item:", n));   // just run code per item
Output:
[2, 4, 6, 8, 10]
[2, 4]
15
4
item: 1
item: 2
item: 3
item: 4
item: 5
Why it works: These five are the most-used array methods in real JavaScript. map and filter both return brand-new arrays (the original is untouched). reduce is the most flexible — it walks the array building a single result (here, a running total starting at 0). find stops at the first match; forEach returns nothing, it's just for side effects like logging.
11. ES6+ (Destructuring, Spread, Rest)
// Destructuring — unpack values into variables
const { name, age } = { name: "Sara", age: 22 };
const [first, second] = ["red", "blue"];
console.log(name, age, first, second);

// Spread (...) — expand an array/object out
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4];
console.log(arr2);

// Rest (...) — collect leftover arguments INTO an array
function sumAll(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
console.log(sumAll(1, 2, 3, 4));
Output:
Sara 22 red blue
[1, 2, 3, 4]
10
Why it works: Destructuring pulls values out of an object/array in one line instead of obj.name, obj.age separately. Spread and rest share the same ... syntax but do opposite jobs: spread expands a collection out (great for copying/merging arrays without mutating the original), while rest gathers multiple arguments into one array.
12. DOM Manipulation
// Assumes this exists in the HTML: <p id="msg">Hello</p>

const el = document.getElementById("msg");
console.log(el.textContent);       // reads current text

el.textContent = "Updated text";   // change the text
el.style.color = "blue";           // change a style
el.classList.add("highlight");     // add a CSS class

const newDiv = document.createElement("div");
newDiv.textContent = "I'm new!";
document.body.appendChild(newDiv); // insert it into the page
Output:
Hello
(the page itself now shows "Updated text" in blue, plus a new div reading "I'm new!" at the bottom)
Why it works: The DOM (Document Object Model) is the live, JS-editable version of your HTML page. getElementById/querySelector find an element; from there you read or overwrite its text, style, and classes, or build entirely new elements with createElement and attach them with appendChild. This only runs in a browser — Node.js has no page to manipulate.
13. Events
// Assumes this exists in the HTML: <button id="btn">Click me</button>

const btn = document.getElementById("btn");

btn.addEventListener("click", function () {
  console.log("Button was clicked!");
});

btn.addEventListener("mouseover", (event) => {
  console.log("Hovering over:", event.target.tagName);
});
Output:
Button was clicked!        (printed each time it's clicked)
Hovering over: BUTTON      (printed on hover)
Why it works: addEventListener(eventName, callback) runs callback whenever that event fires — clicks, hovers, key presses, form submits, and more. The event object describes what happened; event.target is the exact element the user interacted with, handy when one listener covers several elements.
14. JSON
const student = { name: "Ali", age: 20, subjects: ["Math", "CS"] };

const jsonString = JSON.stringify(student); // object → string
console.log(jsonString);
console.log(typeof jsonString);

const parsed = JSON.parse(jsonString);      // string → object
console.log(parsed.name);
console.log(typeof parsed);
Output:
{"name":"Ali","age":20,"subjects":["Math","CS"]}
string
Ali
object
Why it works: JSON is a lightweight text format for exchanging data, used almost everywhere in web APIs. JSON.stringify() turns a JS object into a plain string (needed to save to a file or send over a network); JSON.parse() converts that string back into a usable object.
15. Error Handling
function divide(a, b) {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
}

try {
  console.log(divide(10, 2));
  console.log(divide(10, 0));
} catch (error) {
  console.log("Caught an error:", error.message);
} finally {
  console.log("This always runs");
}
Output:
5
Caught an error: Cannot divide by zero
This always runs
Why it works: try runs risky code; if anything inside throws, execution jumps straight to catch instead of crashing the program. finally runs no matter what happened — success or error — making it the right place for cleanup code.
Part 3 — Advanced
16. OOP — Classes & Inheritance
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a sound.`;
  }
}

class Dog extends Animal {
  speak() {
    return `${this.name} barks.`;
  }
}

const generic = new Animal("Creature");
const rex = new Dog("Rex");

console.log(generic.speak());
console.log(rex.speak());
console.log(rex instanceof Animal);
Output:
Creature makes a sound.
Rex barks.
true
Why it works: A class is a blueprint for creating objects with new. constructor runs automatically on creation to set up initial properties. extends lets Dog inherit everything from Animal, then override speak() with its own version — this overriding is called polymorphism. instanceof confirms an object was built from a class or one of its parents.
17. Promises
function fakeApiCall(shouldSucceed) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldSucceed) {
        resolve("Data received!");
      } else {
        reject("Something went wrong.");
      }
    }, 1000);
  });
}

fakeApiCall(true)
  .then(result => console.log("Success:", result))
  .catch(error => console.log("Error:", error))
  .finally(() => console.log("Done."));
Output:
Success: Data received!
Done.
(after roughly a 1 second delay)
Why it works: A Promise represents a value that isn't ready yet — like the result of a network request. Inside it, resolve(value) marks success and reject(reason) marks failure. .then() runs on success, .catch() runs on failure, .finally() always runs — this is how JS handles things that take time without freezing the rest of the program.
18. Async/Await
function fakeApiCall() {
  return new Promise(resolve => setTimeout(() => resolve("User data"), 1000));
}

async function getUser() {
  console.log("Fetching...");
  const result = await fakeApiCall();
  console.log("Got:", result);
  return result;
}

getUser();
Output:
Fetching...
Got: User data
(the second line appears about 1 second after the first)
Why it works: async/await is newer, cleaner syntax built directly on top of Promises. Marking a function async lets you use await inside it, which pauses just that function until the Promise settles — without freezing the rest of the app. The result: asynchronous code that reads top-to-bottom like normal, synchronous code.
19. Working with APIs (fetch)
// GET — fetching data
async function getTodo() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log("Fetch failed:", error.message);
  }
}
getTodo();

// POST — sending data
async function createPost() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "My Post", userId: 1 })
  });
  const data = await response.json();
  console.log(data);
}
createPost();
Output:
{ userId: 1, id: 1, title: 'delectus aut autem', completed: false }
{ title: 'My Post', userId: 1, id: 101 }
Why it works: fetch(url) sends an HTTP request and returns a Promise, so it pairs naturally with await. response.json() converts the raw reply into a usable JS object. This example uses JSONPlaceholder, a free fake API made for practicing exactly this — GET reads data, POST sends new data (the fake server "creates" it and hands back an id, but doesn't actually save it anywhere). Real APIs — weather, payments, your own backend — all work the same way.
20. Modules (import/export)
// 📁 mathUtils.js
export function add(a, b) {
  return a + b;
}
export const PI = 3.14159;
export default function square(x) {
  return x * x;
}

// 📁 main.js
import square, { add, PI } from "./mathUtils.js";

console.log(add(2, 3));
console.log(PI);
console.log(square(4));
Output:
5
3.14159
16
Why it works: Modules let you split code across multiple files instead of one giant file. export makes something available to other files; import brings it in. Each file can have one default export (imported without { }) and unlimited named exports (imported with { }). To use modules in a browser, add type="module" to your <script> tag; in Node, use .mjs or set "type": "module" in package.json.
21. Important Built-in Methods (Math, Date, Object, Timers)
// Math
console.log(Math.round(4.7), Math.floor(4.7), Math.ceil(4.2));
console.log(Math.max(3, 7, 2), Math.min(3, 7, 2));

// Date
const now = new Date();
console.log(now.getFullYear());

// Object utilities
const car = { brand: "Toyota", year: 2022 };
console.log(Object.keys(car));
console.log(Object.values(car));
Output:
5 4 5
7 2
2026
['brand', 'year']
['Toyota', 2022]
// setTimeout — runs ONCE, after a delay
setTimeout(() => console.log("Runs once, after 2 seconds"), 2000);

// setInterval — runs REPEATEDLY until stopped
let count = 0;
const id = setInterval(() => {
  count++;
  console.log("Tick", count);
  if (count === 3) clearInterval(id); // always clear it, or it repeats forever
}, 1000);
Output (over ~3 seconds):
Tick 1
Tick 2
Runs once, after 2 seconds
Tick 3
(the order of "Tick 2" and "Runs once..." can vary slightly since both are scheduled around the 2-second mark)
Why it works: Math provides ready-made number utilities (rounding, min/max, and more). Date gives access to the current date/time. Object.keys()/Object.values() pull out an object's property names or values as arrays — handy for looping over objects. setTimeout runs code once after a delay; setInterval repeats it — always pair setInterval with clearInterval, or it runs until the page closes.
What to Learn Next
TypeScript — adds type-safety on top of everything here
Node.js + Express — use JS to build a backend/API instead of just frontend
React — pairs naturally with this guide, since components are just JS functions and objects under the hood
