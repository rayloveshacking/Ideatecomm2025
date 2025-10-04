# Ideatecom

## Running the backend server

1. Change into this repository folder:
	```powershell
	cd Ideatecom
	```
2. Start the Express server:
	```powershell
	node backend/server.js
	```

This entry point forwards to the real implementation at `volunteer-mgmt-mvp/backend/server.js`, so you can still run it directly if you prefer:

```powershell
cd Ideatecom/volunteer-mgmt-mvp
node backend/server.js
```

## Anchor Assistant chatbot

The volunteer landing page now includes an "Anchor Assistant" chat widget that routes questions through Google Gemini.

- 📡 **Backend endpoint:** `POST /api/chatbot` expects a JSON payload with a `message` string and an optional `history` array of previous exchanges (`{ role: 'user' | 'model', text: string }`).
- 🔐 **API key configuration:** Set the Gemini key via the `GEMINI_API_KEY` environment variable before starting the server. If the variable is omitted the server will fall back to the bundled demo key from this repo, but you should override it for production or wider demos.
- 💬 **Using the chat:** Start the server, open `frontend/src/pages/index.html` through the Express static host (or hit `http://localhost:3000/`), and click the "Ask Anchor" button in the lower-right corner to begin a conversation.
- ⚠️ **Rate limits & errors:** When Gemini rate-limits or returns a client error, the widget surfaces a helpful message instead of failing silently, so volunteers stay informed.