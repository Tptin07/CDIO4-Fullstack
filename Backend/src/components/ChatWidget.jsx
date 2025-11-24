// src/components/ChatWidget.jsx
import { useState, useRef, useEffect } from "react";

// Mock data - trong thực tế sẽ lấy từ API
const MOCK_MESSAGES = [
  {
    id: 1,
    type: "system",
    text: "Xin chào! Chúng tôi có thể giúp gì cho bạn?",
    time: "09:00",
  },
];

export default function ChatWidget({ open, onClose }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input khi mở chat
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: inputValue.trim(),
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response sau 1-2 giây
    setTimeout(() => {
      const botMessages = [
        "Cảm ơn bạn đã liên hệ! Chúng tôi đang xử lý yêu cầu của bạn.",
        "Nhân viên tư vấn sẽ trả lời bạn trong giây lát.",
        "Bạn có thể mô tả chi tiết hơn về vấn đề bạn đang gặp phải không?",
      ];
      const randomResponse =
        botMessages[Math.floor(Math.random() * botMessages.length)];

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: randomResponse,
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, botMessage]);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="chat-backdrop" onClick={onClose}></div>

      {/* Chat Widget */}
      <div className="chat-widget">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header__info">
            <div className="chat-avatar chat-avatar--online">
              <i className="ri-customer-service-2-fill"></i>
            </div>
            <div>
              <h4>Tư vấn trực tuyến</h4>
              <span className="chat-status">
                <span className="status-dot"></span>
                Đang trực tuyến
              </span>
            </div>
          </div>
          <button
            className="chat-close"
            onClick={onClose}
            aria-label="Đóng chat"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message chat-message--${msg.type}`}
            >
              {msg.type === "bot" && (
                <div className="chat-avatar chat-avatar--sm">
                  <i className="ri-customer-service-2-fill"></i>
                </div>
              )}
              <div className="chat-bubble">
                <p>{msg.text}</p>
                <span className="chat-time">{msg.time}</span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="chat-message chat-message--bot">
              <div className="chat-avatar chat-avatar--sm">
                <i className="ri-customer-service-2-fill"></i>
              </div>
              <div className="chat-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <form className="chat-input" onSubmit={handleSend}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Nhập tin nhắn của bạn..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="chat-input__field"
          />
          <button
            type="submit"
            className="chat-send"
            disabled={!inputValue.trim()}
            aria-label="Gửi tin nhắn"
          >
            <i className="ri-send-plane-fill"></i>
          </button>
        </form>
      </div>
    </>
  );
}

