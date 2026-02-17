import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../api";
import "./ChatPage.css";

const MODELS = [
  { key: "llama3", label: "Llama 3.3", sub: "70B Versatile" },
  { key: "llama3fast", label: "Llama 3.1", sub: "8B Instant" },
  { key: "qwen", label: "Qwen 3", sub: "32B" },
];

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function renderMarkdown(text) {
  if (!text) return "";
  text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) =>
    `<pre class="code-block"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim()}</code></pre>`
  );
  text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
  text = text.replace(/\n/g, "<br/>");
  return text;
}

export default function ChatPage({ onLogout }) {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("llama3");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const fetchChats = useCallback(async () => {
    try {
      const res = await api.get("/api/chat/all");
      setChats(res.data.chats || []);
    } catch {
      // session expired
    } finally {
      setLoadingChats(false);
    }
  }, []);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    if (!activeChatId) { setMessages([]); return; }
    setLoadingMessages(true);
    api.get(`/api/chat/${activeChatId}/messages`)
      .then((res) => setMessages(res.data.prompts || []))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [activeChatId]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + "px";
    }
  }, [prompt]);

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setPrompt("");
  };

  const handleSelectChat = (id) => {
    if (id === activeChatId) return;
    setActiveChatId(id);
    setPrompt("");
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    setDeletingId(chatId);
    try {
      await api.delete(`/api/chat/${chatId}`);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const handleSend = async () => {
    if (!prompt.trim() || sending) return;
    const userPrompt = prompt.trim();
    setPrompt("");
    setSending(true);

    const tempUserMsg = {
      _id: "temp-u",
      prompt: userPrompt,
      response: null,
      model,
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    const endpoint = activeChatId
      ? `/api/chat/${activeChatId}/message`
      : `/api/chat/new/message`;

    try {
      const res = await api.post(endpoint, { prompt: userPrompt, model });
      const { chatId: newChatId, response, title } = res.data;

      if (!activeChatId) {
        setActiveChatId(newChatId);
        setChats((prev) => [
          { _id: newChatId, title, createdAt: new Date().toISOString() },
          ...prev,
        ]);
      }

      setMessages((prev) =>
        prev.map((m) =>
          m._id === "temp-u"
            ? {
                _id: Date.now(),
                prompt: userPrompt,
                response,
                model,
                createdAt: new Date().toISOString(),
              }
            : m
        )
      );
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== "temp-u"));
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = async () => {
    await api.post("/api/auth/logout").catch(() => {});
    onLogout();
  };

  const activeChat = chats.find((c) => c._id === activeChatId);

  return (
    <div className="chat-layout">
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">✦</div>
            {sidebarOpen && <span className="sidebar-logo-text">NeuralChat</span>}
          </div>
          <button
            className="icon-btn sidebar-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            title="Toggle sidebar"
          >
            {sidebarOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
          </button>
        </div>

        <button className="new-chat-btn" onClick={handleNewChat}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {sidebarOpen && <span>New Chat</span>}
        </button>

        <div className="chats-list">
          {sidebarOpen && <p className="chats-label">Recent</p>}

          {loadingChats ? (
            <div className="chats-loading">
              {[1, 2, 3].map((i) => <div key={i} className="chat-skeleton" />)}
            </div>
          ) : chats.length === 0 ? (
            sidebarOpen && (
              <div className="chats-empty">
                <p>No chats yet</p>
                <p>Start a new conversation</p>
              </div>
            )
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                className={`chat-item ${activeChatId === chat._id ? "active" : ""}`}
                onClick={() => handleSelectChat(chat._id)}
              >
                <div className="chat-item-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                {sidebarOpen && (
                  <>
                    <div className="chat-item-info">
                      <span className="chat-item-title">{chat.title}</span>
                      <span className="chat-item-date">{formatDate(chat.createdAt)}</span>
                    </div>
                    <button
                      className={`chat-delete-btn ${deletingId === chat._id ? "deleting" : ""}`}
                      onClick={(e) => handleDeleteChat(e, chat._id)}
                      title="Delete chat"
                    >
                      {deletingId === chat._id ? (
                        <span className="mini-spinner" />
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      )}
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="chat-main">
        {/* TOP BAR */}
        <header className="chat-topbar">
          <div className="topbar-left">
            <h2 className="topbar-title">
              {activeChat ? activeChat.title : "New Conversation"}
            </h2>
          </div>
          <div className="model-selector">
            {MODELS.map((m) => (
              <button
                key={m.key}
                className={`model-btn ${model === m.key ? "active" : ""}`}
                onClick={() => setModel(m.key)}
              >
                <span className="model-label">{m.label}</span>
                <span className="model-sub">{m.sub}</span>
              </button>
            ))}
          </div>
        </header>

        {/* MESSAGES */}
        <div className="messages-area">
          {!activeChatId && messages.length === 0 && !sending ? (
            <div className="welcome-screen">
              <div className="welcome-icon">✦</div>
              <h2 className="welcome-title">What can I help you with?</h2>
              <p className="welcome-sub">Choose a model above and start typing below</p>
              <div className="welcome-chips">
                {[
                  "Explain quantum entanglement",
                  "Write a Python script",
                  "Summarize an article",
                  "Debug my code",
                ].map((q) => (
                  <button key={q} className="welcome-chip" onClick={() => setPrompt(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {loadingMessages ? (
                <div className="messages-loading">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`msg-skeleton ${i % 2 === 0 ? "right" : "left"}`} />
                  ))}
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg._id} className="message-pair">
                    {/* User bubble */}
                    <div className="msg-row user-row">
                      <div className="msg-bubble user-bubble">
                        <p className="msg-text">{msg.prompt}</p>
                        {msg.createdAt && (
                          <span className="msg-time">{formatTime(msg.createdAt)}</span>
                        )}
                      </div>
                      <div className="msg-avatar user-avatar">U</div>
                    </div>
                    {/* Assistant bubble */}
                    {msg.response && (
                      <div className="msg-row ai-row">
                        <div className="msg-avatar ai-avatar">✦</div>
                        <div className="msg-bubble ai-bubble">
                          <div
                            className="msg-text"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.response) }}
                          />
                          <div className="msg-footer">
                            <span className="msg-model">{msg.model}</span>
                            {msg.createdAt && (
                              <span className="msg-time">{formatTime(msg.createdAt)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Thinking indicator */}
              {sending && (
                <div className="msg-row ai-row">
                  <div className="msg-avatar ai-avatar">✦</div>
                  <div className="msg-bubble ai-bubble thinking">
                    <div className="thinking-dots">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="input-area">
          <div className="input-box">
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder="Message NeuralChat... (Enter to send, Shift+Enter for newline)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={sending}
            />
            <button
              className={`send-btn ${(!prompt.trim() || sending) ? "disabled" : ""}`}
              onClick={handleSend}
              disabled={!prompt.trim() || sending}
            >
              {sending ? (
                <span className="mini-spinner" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
          <p className="input-hint">NeuralChat can make mistakes. Verify important info.</p>
        </div>
      </main>
    </div>
  );
}