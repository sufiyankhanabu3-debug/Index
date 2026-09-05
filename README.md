# Nova AI Chatbot Frontend

This project is a production-style frontend for a Python-powered AI chatbot.

## Files

- `index.html` — chat interface
- `style.css` — responsive futuristic UI
- `script.js` — chat logic, localStorage history, API communication

## Backend contract

The frontend sends:

POST /api/chat

```json
{
  "message": "user message",
  "conversation_id": "unique-id"
}
```

Expected response:

```json
{
  "reply": "AI response",
  "conversation_id": "unique-id"
}
```

## Security

Do NOT put these in the frontend:

- `brain.json`
- Python source code
- API keys
- database credentials
- private server files

Your Python backend should read `brain.json` privately and return only the answer to the frontend.

## Connecting your Python backend

The API URL is configured near the top of `script.js`:

```js
API_URL: "/api/chat"
```

If the frontend is hosted separately from the Python backend, replace it with your backend API URL and configure CORS on the server.

## Chat history

Conversation history is stored in the browser's localStorage. It includes chat messages and titles, but not API keys or the private JSON database.

## Important

The frontend's "streaming-style" experience is a loading/response animation. The API contract above returns one complete response. True token-by-token streaming requires an SSE/WebSocket streaming backend.
