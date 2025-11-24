// src/pages/EmployeeChat.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import * as chatApi from "../services/chatApi";
import "../assets/css/employee.css";

export default function EmployeeChat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Kiểm tra quyền nhân viên
  useEffect(() => {
    if (!user || (user.role !== "employee" && user.role !== "admin")) {
      navigate("/");
    }
  }, [user, navigate]);

  // Format thời gian
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days === 1) return "Hôm qua";
    if (days < 7) return `${days} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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

  // Load conversations từ API
  const loadConversations = async () => {
    try {
      const data = await chatApi.getConversations();

      // Transform data từ API sang format UI
      const transformed = data.map((conv) => ({
        id: conv.id,
        conversation_id: conv.conversation_id,
        customerId: conv.customer_id,
        customerName: conv.customer_name || "Khách hàng",
        customerAvatar: conv.customer_avatar,
        lastMessage: conv.last_message || "",
        time: formatTimeShort(conv.last_message_at || conv.created_at),
        unread: conv.unread_count_employee || 0,
        status: "online", // Có thể thêm logic check online status sau
        lastMessageAt: conv.last_message_at || conv.created_at,
      }));

      // Sắp xếp theo thời gian tin nhắn cuối
      transformed.sort((a, b) => {
        const timeA = new Date(a.lastMessageAt || 0);
        const timeB = new Date(b.lastMessageAt || 0);
        return timeB - timeA;
      });

      setConversations(transformed);
    } catch (error) {
      console.error("Error loading conversations:", error);
      if (error.response?.status === 403) {
        alert(
          "Bạn không có quyền truy cập trang này. Chỉ nhân viên mới có thể xem tin nhắn."
        );
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load messages từ API
  const loadMessages = async (conversationId) => {
    if (!conversationId) return;

    setLoadingMessages(true);
    try {
      const data = await chatApi.getMessages(conversationId);

      // Transform messages từ API sang format UI
      const transformed = data.map((msg) => ({
        id: msg.id,
        type: msg.sender_role === "customer" ? "customer" : "employee",
        text: msg.message,
        time: formatTimeShort(msg.created_at),
        created_at: msg.created_at,
        sender_name: msg.sender_name,
        sender_avatar: msg.sender_avatar,
        is_read: msg.is_read,
      }));

      setMessages(transformed);

      // Đánh dấu đã đọc
      await chatApi.markAsRead(conversationId);

      // Cập nhật unread count trong conversations
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversation_id === conversationId
            ? { ...conv, unread: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Load conversations khi component mount
  useEffect(() => {
    if (user && (user.role === "employee" || user.role === "admin")) {
      loadConversations();
    }
  }, [user]);

  // Polling để cập nhật conversations và messages mới
  useEffect(() => {
    if (!user || (user.role !== "employee" && user.role !== "admin")) return;

    // Poll conversations mỗi 3 giây
    pollingIntervalRef.current = setInterval(() => {
      loadConversations();

      // Nếu đang xem một conversation, cũng reload messages
      if (activeConversationId) {
        loadMessages(activeConversationId);
      }
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeConversationId]);

  const handleGoHome = () => {
    // Reset về trạng thái ban đầu (chưa chọn chat nào)
    setActiveChat(null);
    setActiveConversationId(null);
    setMessages([]);
    setInputValue("");
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Load messages khi chọn conversation
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close message menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMessageMenu && !e.target.closest(".message-menu-wrapper")) {
        setShowMessageMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showMessageMenu]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeConversationId) return;

    if (editingMessage) {
      // TODO: Implement edit message API nếu backend hỗ trợ
      // Tạm thời chỉ update UI
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === editingMessage.id
            ? { ...msg, text: inputValue.trim(), edited: true }
            : msg
        )
      );
      setEditingMessage(null);
      setInputValue("");
      return;
    }

    // Tìm customer_id từ conversation
    const activeConv = conversations.find(
      (c) => c.conversation_id === activeConversationId
    );
    if (!activeConv) return;

    try {
      // Gửi tin nhắn qua API
      const newMessage = await chatApi.sendMessage({
        message: inputValue.trim(),
        conversation_id: activeConversationId,
        receiver_id: activeConv.customerId,
        message_type: "text",
      });

      // Transform và thêm vào messages
      const transformedMessage = {
        id: newMessage.id,
        type: "employee",
        text: newMessage.message,
        time: formatTimeShort(newMessage.created_at),
        created_at: newMessage.created_at,
        sender_name: newMessage.sender_name,
        is_read: newMessage.is_read,
      };

      setMessages((prev) => [...prev, transformedMessage]);

      // Reload conversations để cập nhật last_message
      await loadConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
    }

    setInputValue("");
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Kích thước file không được vượt quá 10MB");
      return;
    }

    const newMessage = {
      id: Date.now(),
      type: "employee",
      text: `📎 ${file.name}`,
      file: {
        name: file.name,
        size: (file.size / 1024).toFixed(2) + " KB",
        type: file.type,
      },
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Update last message in conversation
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeChat
          ? { ...conv, lastMessage: `📎 ${file.name}`, unread: 0 }
          : conv
      )
    );

    // Reset file input
    e.target.value = "";
  };

  const handleEditMessage = (message) => {
    if (message.type !== "employee") return;
    setEditingMessage(message);
    setInputValue(message.text);
    setShowMessageMenu(null);
  };

  const handleRecallMessage = (messageId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, recalled: true, text: "Tin nhắn đã được thu hồi" }
          : msg
      )
    );
    setShowMessageMenu(null);
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm("Bạn có chắc muốn xóa tin nhắn này?")) {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      setShowMessageMenu(null);
    }
  };

  const handleDeleteConversation = (conversationId) => {
    if (window.confirm("Bạn có chắc muốn xóa cuộc trò chuyện này?")) {
      // TODO: Implement delete conversation API nếu backend hỗ trợ
      // Tạm thời chỉ xóa khỏi UI
      setConversations((prev) =>
        prev.filter((conv) => conv.conversation_id !== conversationId)
      );
      if (activeConversationId === conversationId) {
        setActiveChat(null);
        setActiveConversationId(null);
        setMessages([]);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setInputValue("");
  };

  const handleSelectChat = (conversationId) => {
    setActiveConversationId(conversationId);
    const conv = conversations.find(
      (c) => c.conversation_id === conversationId
    );
    setActiveChat(conv?.id || null);
  };

  const activeConversation = conversations.find(
    (c) => c.conversation_id === activeConversationId
  );

  // Filter conversations based on search
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Quick reply templates
  const quickReplies = [
    "Xin chào! Tôi có thể giúp gì cho bạn?",
    "Cảm ơn bạn đã liên hệ",
    "Vui lòng chờ trong giây lát",
    "Bạn có câu hỏi gì khác không?",
  ];

  const handleQuickReply = (text) => {
    setInputValue(text);
  };

  const handleEndChat = () => {
    setActiveChat(null);
    setMessages([]);
    setEditingMessage(null);
    setInputValue("");
  };

  return (
    <div className="employee-page">
      {/* Sidebar */}
      <aside className="employee-sidebar">
        <div className="employee-sidebar__header">
          <h2>
            <i className="ri-customer-service-2-line"></i> Tư vấn trực tuyến
          </h2>
          <div className="employee-status">
            <span className="status-dot"></span>
            <span>Đang trực tuyến</span>
          </div>
        </div>

        <div className="employee-search">
          <i className="ri-search-line"></i>
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="employee-conversations">
          {filteredConversations.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "var(--muted)",
              }}
            >
              {searchQuery
                ? "Không tìm thấy cuộc trò chuyện"
                : "Chưa có cuộc trò chuyện nào"}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.conversation_id}
                className={`conversation-item ${
                  activeConversationId === conv.conversation_id ? "active" : ""
                }`}
                onClick={() => handleSelectChat(conv.conversation_id)}
              >
                <div className="conversation-avatar">
                  <i className="ri-user-line"></i>
                  {conv.status === "online" && (
                    <span className="online-dot"></span>
                  )}
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <strong>{conv.customerName}</strong>
                    <span className="conversation-time">{conv.time}</span>
                  </div>
                  <p className="conversation-preview">{conv.lastMessage}</p>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  {conv.unread > 0 && (
                    <span className="conversation-badge">{conv.unread}</span>
                  )}
                  <button
                    className="conversation-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.conversation_id);
                    }}
                    title="Xóa cuộc trò chuyện"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="employee-sidebar__footer">
          <button className="employee-nav__item" onClick={handleGoHome}>
            <i className="ri-home-line"></i>
            <span>Về trang chủ</span>
          </button>
        </div>
      </aside>

      {/* Chat Area */}
      <main className="employee-chat">
        {loading ? (
          <div className="employee-chat__empty">
            <i
              className="ri-loader-4-line"
              style={{ animation: "spin 1s linear infinite" }}
            ></i>
            <h3>Đang tải...</h3>
          </div>
        ) : activeConversationId ? (
          <>
            {/* Chat Header */}
            <header className="employee-chat__header">
              <div className="employee-chat__info">
                <div className="employee-chat__avatar">
                  <i className="ri-user-line"></i>
                  {activeConversation?.status === "online" && (
                    <span className="online-dot"></span>
                  )}
                </div>
                <div>
                  <h3>{activeConversation?.customerName}</h3>
                  <span className="chat-status-text">
                    {activeConversation?.status === "online"
                      ? "Đang trực tuyến"
                      : "Ngoại tuyến"}
                  </span>
                </div>
              </div>
              <div className="employee-chat__actions">
                <button
                  className="btn btn--ghost btn-sm"
                  title="Kết thúc chat"
                  onClick={handleEndChat}
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            </header>

            {/* Messages */}
            <div className="employee-chat__messages">
              {loadingMessages ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <i
                    className="ri-loader-4-line"
                    style={{ animation: "spin 1s linear infinite" }}
                  ></i>
                  <p>Đang tải tin nhắn...</p>
                </div>
              ) : messages.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "var(--muted)",
                  }}
                >
                  <p>Chưa có tin nhắn nào</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message chat-message--${msg.type} ${
                      msg.recalled ? "recalled" : ""
                    }`}
                  >
                    {msg.type === "customer" && (
                      <div className="chat-avatar chat-avatar--sm">
                        <i className="ri-user-line"></i>
                      </div>
                    )}
                    <div className="chat-bubble">
                      {msg.file ? (
                        <div className="chat-file">
                          <div className="file-icon">
                            <i className="ri-file-line"></i>
                          </div>
                          <div className="file-info">
                            <strong>{msg.file.name}</strong>
                            <small>{msg.file.size}</small>
                          </div>
                          <button className="file-download" title="Tải xuống">
                            <i className="ri-download-line"></i>
                          </button>
                        </div>
                      ) : (
                        <p
                          style={{
                            fontStyle: msg.recalled ? "italic" : "normal",
                            opacity: msg.recalled ? 0.7 : 1,
                          }}
                        >
                          {msg.text}
                        </p>
                      )}
                      <div className="chat-time-wrapper">
                        <span className="chat-time">{msg.time}</span>
                        {msg.edited && !msg.recalled && (
                          <span className="edited-label">Đã chỉnh sửa</span>
                        )}
                      </div>
                    </div>
                    {msg.type === "employee" && !msg.recalled && (
                      <div className="message-menu-wrapper">
                        <button
                          className="message-menu-btn"
                          onClick={() =>
                            setShowMessageMenu(
                              showMessageMenu === msg.id ? null : msg.id
                            )
                          }
                          title="Tùy chọn"
                        >
                          <i className="ri-more-2-fill"></i>
                        </button>
                        {showMessageMenu === msg.id && (
                          <div className="message-menu">
                            <button onClick={() => handleEditMessage(msg)}>
                              <i className="ri-edit-line"></i> Chỉnh sửa
                            </button>
                            <button onClick={() => handleRecallMessage(msg.id)}>
                              <i className="ri-arrow-go-back-line"></i> Thu hồi
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="danger"
                            >
                              <i className="ri-delete-bin-line"></i> Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
              {isTyping && (
                <div className="chat-message chat-message--customer">
                  <div className="chat-avatar chat-avatar--sm">
                    <i className="ri-user-line"></i>
                  </div>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}></div>
            </div>

            {/* Quick Replies */}
            <div className="quick-replies">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  type="button"
                  className="quick-reply-btn"
                  onClick={() => handleQuickReply(reply)}
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Editing indicator */}
            {editingMessage && (
              <div className="editing-banner">
                <div className="editing-info">
                  <i className="ri-edit-line"></i>
                  <span>Đang chỉnh sửa tin nhắn</span>
                </div>
                <button className="editing-cancel" onClick={handleCancelEdit}>
                  <i className="ri-close-line"></i>
                </button>
              </div>
            )}

            {/* Input */}
            <form className="employee-chat__input" onSubmit={handleSend}>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept="*/*"
              />
              <button
                type="button"
                className="chat-attach"
                onClick={handleFileAttach}
                title="Đính kèm file"
              >
                <i className="ri-attachment-line"></i>
              </button>
              <input
                type="text"
                placeholder={
                  editingMessage ? "Chỉnh sửa tin nhắn..." : "Nhập tin nhắn..."
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="chat-input__field"
              />
              <button
                type="submit"
                className="chat-send"
                disabled={!inputValue.trim()}
                title={editingMessage ? "Cập nhật" : "Gửi tin nhắn"}
              >
                <i
                  className={
                    editingMessage ? "ri-check-line" : "ri-send-plane-fill"
                  }
                ></i>
              </button>
            </form>
          </>
        ) : (
          <div className="employee-chat__empty">
            <i className="ri-message-3-line"></i>
            <h3>Chọn cuộc trò chuyện để bắt đầu</h3>
            <p>Chọn một khách hàng từ danh sách bên trái để xem tin nhắn</p>
          </div>
        )}
      </main>
    </div>
  );
}
