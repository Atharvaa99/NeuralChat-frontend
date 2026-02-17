# 🤖 NeuralChat - AI Chatbot Frontend

A modern, responsive React frontend for the NeuralChat AI chat application. Clean dark UI with multi-model support, persistent sessions, and real-time chat experience.

## 🚀 Features

- **Multi-Model Selector**: Switch between Llama 3.3, Mistral, and Gemma 2 from the top bar
- **Persistent Sessions**: Stay logged in across page refreshes via cookie-based auth
- **Real-time Thinking Indicator**: Animated dots while waiting for AI response
- **Markdown Rendering**: Renders code blocks, inline code, bold, and italic in AI responses
- **Collapsible Sidebar**: Toggle sidebar to maximize chat space
- **Chat Management**: Create, switch between, and delete conversations
- **Auto-titled Chats**: Chat titles generated from your first message
- **Welcome Chips**: Quick-start prompt suggestions on new chat screen
- **Auto-resizing Input**: Textarea grows as you type, up to 180px
- **Optimistic UI**: Your message appears instantly before the API responds

## 🛠️ Tech Stack

- **Framework**: React 19
- **Bundler**: Vite
- **HTTP Client**: Axios (with `withCredentials` for cookies)
- **Styling**: Custom CSS (no component library)
- **Fonts**: Syne + JetBrains Mono (Google Fonts)

## 📋 Prerequisites

- Node.js (v18 or higher)
- NeuralChat backend running (local or deployed)

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Atharvaa99/NueralChat-Frontend.git
   cd neuralchat-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. **Start the dev server**
   ```bash
   npm run dev
   ```

   App runs on `http://localhost:5173`

## 🔐 How Auth Works

```
User visits app
  → App calls GET /api/chat/all to verify cookie session
  → Cookie valid   → Show ChatPage directly (no login needed)
  → Cookie invalid → Show LoginPage

User logs in / registers
  → Backend sets HTTP-only cookie
  → App switches to ChatPage

User logs out
  → Backend clears cookie
  → App switches back to LoginPage
```

No tokens are stored in localStorage — all auth is handled via HTTP-only cookies set by the backend.

## 📁 Project Structure

```
neuralchat-frontend/
├── public/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx       # Login & register form
│   │   ├── LoginPage.css       # Login page styles
│   │   ├── ChatPage.jsx        # Main chat interface
│   │   └── ChatPage.css        # Chat page styles
│   ├── api.js                  # Axios instance (baseURL + credentials)
│   ├── App.jsx                 # Root component + session check
│   ├── main.jsx                # React entry point
│   └── index.css               # Global reset
├── index.html
├── vite.config.js
├── package.json
└── .env
```

## 🎨 UI Overview

### Login Page
- Animated slide-up card
- Purple grid background with radial glow
- Toggle between Login and Register modes
- Inline validation error display

### Chat Page

| Element | Description |
|---------|-------------|
| Sidebar | Chat history list with delete buttons, collapsible |
| Top Bar | Active chat title + model selector (Llama / Mistral / Gemma) |
| Messages | User bubbles (right) and AI bubbles (left) with timestamps |
| Input | Auto-resize textarea, Enter to send, Shift+Enter for newline |
| Welcome Screen | Shown on new chat with 4 quick-start prompt chips |

## 🤖 Supported Models

| Display Name | Model Key | Backend Model |
|-------------|-----------|---------------|
| Llama 3.3 70B | `llama3` | llama-3.3-70b-versatile |
| Mistral Saba 24B | `mixtral` | mistral-saba-24b |
| Gemma 2 9B | `gemma` | gemma2-9b-it |

## 🚀 Deployment (Vercel)

1. Push code to GitHub
2. Import repository on [vercel.com](https://vercel.com)
3. Add environment variable:
   - `VITE_API_URL` = `https://nueralchat-backend.onrender.com`
4. Deploy!

> ⚠️ After deploying, copy your Vercel URL and add it as `FRONTEND_URL` in your Render backend environment variables to fix CORS.

**Live App:** `https://your-app.vercel.app`

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend base URL | ✅ |

> All Vite env variables must be prefixed with `VITE_` to be accessible in the browser.

## 🔗 Related

- **Backend Repo**: [NueralChat-Backend](https://github.com/Atharvaa99/NueralChat-Backend)
- **Live API**: `https://nueralchat-backend.onrender.com`

## 📄 License

This project is open source and available under the [MIT License](LICENSE).