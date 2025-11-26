// src/components/ChatWidget.jsx
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import * as chatApi from "../services/chatApi";

export default function ChatWidget({ open, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [receiverId, setReceiverId] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Format thời gian
  const formatTimeShort = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / 86400000);

    if (days === 0) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (days === 1) return "Hôm qua";
    if (days < 7) return `${days} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Load hoặc tạo conversation khi mở chat
  const loadOrCreateConversation = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const conversation = await chatApi.getOrCreateCustomerConversation();
      setConversationId(conversation.conversation_id);
      setReceiverId(conversation.employee_id);

      // Load tin nhắn cũ
      await loadMessages(conversation.conversation_id);
    } catch (error) {
      console.error("Error loading conversation:", error);
      if (error.code === "ERR_NETWORK" || error.message?.includes("CONNECTION_REFUSED")) {
        alert("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng hoặc đảm bảo server đang chạy.");
      } else if (error.response?.status === 401) {
        alert("Vui lòng đăng nhập để sử dụng tính năng chat");
        onClose();
      } else if (error.response?.status === 404) {
        alert(error.response?.data?.message || "Không tìm thấy nhân viên hỗ trợ. Vui lòng thử lại sau.");
      } else {
        alert(error.response?.data?.message || "Không thể kết nối chat. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load messages từ API
  const loadMessages = async (convId) => {
    if (!convId) return;

    try {
      const data = await chatApi.getMessages(convId);

      // Transform messages từ API sang format UI
      const transformed = data.map((msg) => ({
        id: msg.id,
        type: msg.sender_role === "customer" ? "user" : "bot",
        text: msg.message,
        time: formatTimeShort(msg.created_at),
        created_at: msg.created_at,
      }));

      setMessages(transformed);

      // Đánh dấu đã đọc
      await chatApi.markAsRead(convId);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Load conversation khi mở chat
  useEffect(() => {
    if (open && user) {
      loadOrCreateConversation();
    } else if (!open) {
      // Reset khi đóng chat
      setMessages([]);
      setConversationId(null);
      setReceiverId(null);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  // Polling để cập nhật tin nhắn mới
  useEffect(() => {
    if (!open || !conversationId || !user) return;

    // Poll messages mỗi 3 giây
    pollingIntervalRef.current = setInterval(() => {
      loadMessages(conversationId);
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, conversationId, user]);

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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversationId || !receiverId) return;

    const messageText = inputValue.trim();
    setInputValue("");

    // Thêm tin nhắn vào UI ngay lập tức (optimistic update)
    const tempMessage = {
      id: Date.now(),
      type: "user",
      text: messageText,
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      // Gửi tin nhắn qua API
      const newMessage = await chatApi.sendMessage({
        message: messageText,
        conversation_id: conversationId,
        receiver_id: receiverId,
        message_type: "text",
      });

      // Thay thế tin nhắn tạm bằng tin nhắn thật từ server
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id
            ? {
                id: newMessage.id,
                type: "user",
                text: newMessage.message,
                time: formatTimeShort(newMessage.created_at),
                created_at: newMessage.created_at,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // Xóa tin nhắn tạm nếu gửi thất bại
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (!open) return null;

  // Nếu chưa đăng nhập, hiển thị thông báo
  if (!user) {
    return (
      <>
        <div className="chat-backdrop" onClick={onClose}></div>
        <div className="chat-widget">
          <div className="chat-header">
            <div className="chat-header__info">
              <div className="chat-avatar chat-avatar--online">
                <i className="ri-customer-service-2-fill"></i>
              </div>
              <div>
                <h4>Tư vấn trực tuyến</h4>
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
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            <p>Vui lòng đăng nhập để sử dụng tính năng chat</p>
          </div>
        </div>
      </>
    );
  }

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
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <i
                className="ri-loader-4-line"
                style={{ animation: "spin 1s linear infinite" }}
              ></i>
              <p>Đang tải...</p>
            </div>
          ) : messages.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "var(--muted)",
              }}
            >
              <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
            </div>
          ) : (
            messages.map((msg) => (
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
            ))
          )}

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

