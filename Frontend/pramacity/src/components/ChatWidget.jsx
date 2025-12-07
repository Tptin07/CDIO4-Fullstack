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
  const messagesRef = useRef([]);
  const lastAutoReplyAtRef = useRef(null);
  const lastEmployeeReplyAtRef = useRef(null);

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

  // Tin nhắn tự động (widget sẽ hiển thị ngay khi user gửi)
  const autoReplyMessages = [
    "Xin chào! Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.",
    "Cảm ơn bạn đã gửi tin nhắn. Nhân viên của chúng tôi sẽ trả lời bạn trong thời gian sớm nhất.",
    "Xin chào! Chúng tôi đã nhận được tin nhắn của bạn. Vui lòng chờ trong giây lát, chúng tôi sẽ phản hồi ngay.",
  ];

  // Load hoặc tạo conversation khi mở chat
  const loadOrCreateConversation = async () => {
    console.log("🔵 [ChatWidget] loadOrCreateConversation - Bắt đầu");
    console.log("   User:", user ? { id: user.id, role: user.role } : "null");

    if (!user) {
      console.log("   ❌ Không có user, dừng lại");
      return;
    }

    // Ngăn admin hoặc employee mở chat khách hàng
    if (user.role === "admin" || user.role === "employee") {
      alert(
        "Tài khoản admin/employee không thể sử dụng chức năng chat khách hàng."
      );
      onClose && onClose();
      return;
    }

    try {
      setLoading(true);
      console.log("   📡 Gọi API getOrCreateCustomerConversation...");
      const conversation = await chatApi.getOrCreateCustomerConversation();
      console.log("   ✅ Nhận được conversation:", conversation);
      console.log("   - conversation_id:", conversation?.conversation_id);
      console.log("   - employee_id:", conversation?.employee_id);

      setConversationId(conversation.conversation_id);
      setReceiverId(conversation.employee_id);
      console.log("   ✅ Đã set conversationId và receiverId");

      // Load tin nhắn cũ
      console.log("   📥 Đang load messages...");
      await loadMessages(conversation.conversation_id);
      console.log("   ✅ Hoàn thành loadOrCreateConversation");
    } catch (error) {
      console.error("❌ [ChatWidget] Error loading conversation:", error);
      console.error("   Error code:", error.code);
      console.error("   Error message:", error.message);
      console.error("   Error response:", error.response?.data);
      console.error("   Error status:", error.response?.status);

      if (
        error.code === "ERR_NETWORK" ||
        error.message?.includes("CONNECTION_REFUSED")
      ) {
        alert(
          "Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng hoặc đảm bảo server đang chạy."
        );
      } else if (error.response?.status === 401) {
        alert("Vui lòng đăng nhập để sử dụng tính năng chat");
        onClose();
      } else if (error.response?.status === 404) {
        alert(
          error.response?.data?.message ||
            "Không tìm thấy nhân viên hỗ trợ. Vui lòng thử lại sau."
        );
      } else {
        alert(
          error.response?.data?.message ||
            "Không thể kết nối chat. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
      console.log("   🔵 [ChatWidget] loadOrCreateConversation - Kết thúc");
    }
  };

  // Load messages từ API
  const loadMessages = async (convId, isPolling = false) => {
    console.log(
      "🔵 [ChatWidget] loadMessages - Bắt đầu",
      isPolling ? "(polling)" : ""
    );
    console.log("   conversationId:", convId);

    if (!convId) {
      console.log("   ❌ Không có conversationId, dừng lại");
      return;
    }

    try {
      console.log("   📡 Gọi API getMessages...");
      const data = await chatApi.getMessages(convId);
      console.log("   ✅ Nhận được messages:", data?.length || 0, "tin nhắn");
      if (!isPolling) {
        console.log("   Messages data:", data);
      }

      // Transform messages từ API sang format UI
      const transformed = data.map((msg) => ({
        id: msg.id,
        type: msg.sender_role === "customer" ? "user" : "bot",
        text: msg.message,
        time: formatTimeShort(msg.created_at),
        created_at: msg.created_at,
        sender_avatar: msg.sender_avatar,
        sender_name: msg.sender_name,
      }));

      // Cập nhật timestamp tin nhắn gần nhất từ nhân viên (role !== customer)
      try {
        const employeeMsgs = data.filter((m) => m.sender_role !== "customer");
        if (employeeMsgs.length > 0) {
          const latestEmp = employeeMsgs[employeeMsgs.length - 1];
          lastEmployeeReplyAtRef.current = new Date(
            latestEmp.created_at
          ).getTime();
        }
      } catch (err) {
        // ignore
      }

      console.log("   ✅ Transformed messages:", transformed.length);

      // Tối ưu: Chỉ cập nhật nếu có thay đổi
      setMessages((prevMessages) => {
        // So sánh số lượng và ID của tin nhắn cuối cùng
        const prevLastId =
          prevMessages.length > 0
            ? prevMessages[prevMessages.length - 1]?.id
            : null;
        const newLastId =
          transformed.length > 0
            ? transformed[transformed.length - 1]?.id
            : null;

        // Nếu có tin nhắn mới, cập nhật
        if (
          prevLastId !== newLastId ||
          prevMessages.length !== transformed.length
        ) {
          console.log("   🔄 Có tin nhắn mới, cập nhật...");
          return transformed;
        }

        // Không có thay đổi, giữ nguyên
        return prevMessages;
      });

      // Sync messagesRef so closures can read latest messages
      messagesRef.current = transformed;

      // Đánh dấu đã đọc (chỉ khi không phải polling)
      if (!isPolling) {
        console.log("   📝 Đánh dấu đã đọc...");
        await chatApi.markAsRead(convId);
      }
      console.log("   ✅ Hoàn thành loadMessages");
    } catch (error) {
      // Không log error khi polling để tránh spam console
      if (!isPolling) {
        console.error("❌ [ChatWidget] Error loading messages:", error);
        console.error("   Error code:", error.code);
        console.error("   Error message:", error.message);
        console.error("   Error response:", error.response?.data);
        console.error("   Error status:", error.response?.status);
      }
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

    // Poll messages mỗi 2 giây để real-time hơn
    // Giảm xuống 1 giây để tin nhắn tự động hiện nhanh hơn trên widget
    pollingIntervalRef.current = setInterval(() => {
      loadMessages(conversationId, true); // true = isPolling
    }, 1000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, conversationId, user]);

  // Auto scroll to bottom khi có tin nhắn mới (chỉ khi đang ở cuối trang)
  useEffect(() => {
    // Chỉ scroll nếu user đang ở gần cuối trang
    const messagesContainer = messagesEndRef.current?.parentElement;
    if (messagesContainer) {
      const isNearBottom =
        messagesContainer.scrollHeight - messagesContainer.scrollTop <=
        messagesContainer.clientHeight + 100; // 100px threshold

      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, isTyping]);

  // Focus input khi mở chat
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // Keep messagesRef in sync with state so closures can read latest
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    console.log("🔵 [ChatWidget] handleSend - Bắt đầu");
    console.log("   inputValue:", inputValue);
    console.log("   conversationId:", conversationId);
    console.log("   receiverId:", receiverId);

    if (!inputValue.trim() || !conversationId || !receiverId) {
      console.log("   ❌ Thiếu thông tin cần thiết, dừng lại");
      return;
    }

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

    console.log("   📝 Thêm tin nhắn tạm vào UI");
    setMessages((prev) => [...prev, tempMessage]);

    // Thêm tin nhắn tự động hiển thị tức thì trên widget (không gửi lên server)
    try {
      const now = Date.now();
      const threeMin = 3 * 60 * 1000;

      // Quy tắc gửi auto-reply:
      // - Nếu chưa từng gửi auto-reply trước đó => gửi
      // - Nếu đã gửi trước đó, chỉ gửi lại khi:
      //    * nhân viên đã trả lời sau lần auto-reply trước đó AND đã quá 3 phút kể từ lần trả lời đó
      //    OR
      //    * nhân viên không trả lời kể từ lần auto-reply trước đó AND đã quá 3 phút kể từ lần auto-reply
      let shouldAdd = false;
      if (!lastAutoReplyAtRef.current) {
        shouldAdd = true;
      } else if (
        lastEmployeeReplyAtRef.current &&
        lastEmployeeReplyAtRef.current > lastAutoReplyAtRef.current
      ) {
        // Employee replied after last auto-reply
        if (now - lastEmployeeReplyAtRef.current > threeMin) shouldAdd = true;
      } else {
        // No employee reply after last auto-reply
        if (now - lastAutoReplyAtRef.current > threeMin) shouldAdd = true;
      }

      if (shouldAdd) {
        // Tránh thêm auto-reply nếu tin nhắn cuối đã là auto-reply
        const lastMsg = messagesRef.current[messagesRef.current.length - 1];
        if (!lastMsg || lastMsg.type !== "bot") {
          const autoText =
            autoReplyMessages[
              Math.floor(Math.random() * autoReplyMessages.length)
            ];
          const autoReplyTemp = {
            id: `auto-${Date.now()}`,
            type: "bot",
            text: autoText,
            time: new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            created_at: new Date().toISOString(),
            is_auto_reply: true,
            isOptimistic: true,
          };

          // Nhỏ delay để trông tự nhiên (150-350ms)
          setTimeout(() => {
            setMessages((prev) => {
              const result = [...prev, autoReplyTemp];
              messagesRef.current = result;
              lastAutoReplyAtRef.current = Date.now();
              return result;
            });
          }, 150 + Math.random() * 200);
        }
      }
    } catch (err) {
      console.error("⚠️ Lỗi khi thêm auto-reply tạm (widget):", err);
    }

    try {
      // Gửi tin nhắn qua API
      console.log("   📡 Gọi API sendMessage...");
      const newMessage = await chatApi.sendMessage({
        message: messageText,
        conversation_id: conversationId,
        receiver_id: receiverId,
        message_type: "text",
      });

      console.log("   ✅ Nhận được message từ server:", newMessage);

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
      console.log("   ✅ Hoàn thành handleSend");
    } catch (error) {
      console.error("❌ [ChatWidget] Error sending message:", error);
      console.error("   Error code:", error.code);
      console.error("   Error message:", error.message);
      console.error("   Error response:", error.response?.data);
      console.error("   Error status:", error.response?.status);

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
