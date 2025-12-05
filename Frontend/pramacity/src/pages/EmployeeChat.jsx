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
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const conversationsPollingIntervalRef = useRef(null);
  const autoRepliedMessagesRef = useRef(new Set()); // Track các tin nhắn đã phản hồi tự động
  const previousMessagesRef = useRef([]); // Lưu previous messages để so sánh
  const lastMessageIdRef = useRef(null); // Lưu ID tin nhắn cuối cùng để tối ưu polling
  const conversationsCacheRef = useRef(null); // Cache conversations để tránh reload không cần thiết
  const loadConversationsTimeoutRef = useRef(null); // Debounce loadConversations
  const isPollingRef = useRef(false); // Tránh nhiều polling cùng lúc

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

  // Load conversations từ API (với cache và debounce)
  const loadConversations = async (force = false) => {
    // Debounce: Nếu đang có timeout chờ, hủy nó và tạo timeout mới
    if (loadConversationsTimeoutRef.current && !force) {
      clearTimeout(loadConversationsTimeoutRef.current);
    }

    // Nếu không force và có cache gần đây (< 2 giây), bỏ qua
    if (!force && conversationsCacheRef.current) {
      const cacheAge = Date.now() - conversationsCacheRef.current.timestamp;
      if (cacheAge < 2000) {
        console.log("   ⏭️ Sử dụng cache conversations (age:", cacheAge, "ms)");
        return;
      }
    }

    // Debounce: Đợi 300ms trước khi gọi API (trừ khi force)
    if (!force) {
      loadConversationsTimeoutRef.current = setTimeout(() => {
        loadConversations(true);
      }, 300);
      return;
    }

    console.log("🟢 [EmployeeChat] loadConversations - Bắt đầu");
    console.log("   User:", user ? { id: user.id, role: user.role } : "null");

    try {
      setError(null);
      console.log("   📡 Gọi API getConversations...");
      const data = await chatApi.getConversations();
      console.log("   ✅ Nhận được data:", data);
      console.log("   Data type:", Array.isArray(data) ? "array" : typeof data);
      console.log("   Data length:", Array.isArray(data) ? data.length : "N/A");

      // Kiểm tra nếu data là array
      if (!Array.isArray(data)) {
        console.warn("   ⚠️ API returned non-array data:", data);
        setConversations([]);
        return;
      }

      console.log("   🔄 Đang transform data...");
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

      console.log("   ✅ Transformed conversations:", transformed.length);

      // Sắp xếp theo thời gian tin nhắn cuối
      transformed.sort((a, b) => {
        const timeA = new Date(a.lastMessageAt || 0);
        const timeB = new Date(b.lastMessageAt || 0);
        return timeB - timeA;
      });

      console.log("   ✅ Đã sắp xếp conversations");

      // Cập nhật cache
      conversationsCacheRef.current = {
        data: transformed,
        timestamp: Date.now(),
      };

      setConversations(transformed);
      console.log("   ✅ Hoàn thành loadConversations");
    } catch (error) {
      console.error("❌ [EmployeeChat] Error loading conversations:", error);
      console.error("   Error code:", error.code);
      console.error("   Error message:", error.message);
      console.error("   Error response:", error.response?.data);
      console.error("   Error status:", error.response?.status);
      console.error("   Error stack:", error.stack);

      setError(error.message || "Không thể tải danh sách cuộc trò chuyện");

      if (error.response?.status === 403) {
        alert(
          "Bạn không có quyền truy cập trang này. Chỉ nhân viên mới có thể xem tin nhắn."
        );
        navigate("/");
      } else if (error.response?.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
      }
    } finally {
      setLoading(false);
      console.log("   🟢 [EmployeeChat] loadConversations - Kết thúc");
    }
  };

  // Tin nhắn tự động phản hồi
  const autoReplyMessages = [
    "Xin chào! Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.",
    "Cảm ơn bạn đã gửi tin nhắn. Nhân viên của chúng tôi sẽ trả lời bạn trong thời gian sớm nhất.",
    "Xin chào! Chúng tôi đã nhận được tin nhắn của bạn. Vui lòng chờ trong giây lát, chúng tôi sẽ phản hồi ngay.",
  ];

  // Gửi tin nhắn tự động
  const sendAutoReply = async (
    conversationId,
    customerId,
    customerMessageId
  ) => {
    // Tránh gửi lại nếu đã phản hồi tin nhắn này
    if (autoRepliedMessagesRef.current.has(customerMessageId)) {
      console.log("   ⏭️ Đã phản hồi tin nhắn này rồi, bỏ qua");
      return;
    }

    try {
      console.log("   🤖 Gửi tin nhắn tự động...");

      // Chọn tin nhắn tự động ngẫu nhiên
      const autoReplyText =
        autoReplyMessages[Math.floor(Math.random() * autoReplyMessages.length)];

      // Giảm delay cho phản hồi tự động để user nhận nhanh hơn (150-350ms)
      const delay = 150 + Math.random() * 200;
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Gửi tin nhắn tự động
      const newMessage = await chatApi.sendMessage({
        message: autoReplyText,
        conversation_id: conversationId,
        receiver_id: customerId,
        message_type: "text",
      });

      console.log("   ✅ Đã gửi tin nhắn tự động:", newMessage.id);

      // Đánh dấu đã phản hồi tin nhắn này
      autoRepliedMessagesRef.current.add(customerMessageId);

      // Transform và thêm vào messages
      const transformedMessage = {
        id: newMessage.id,
        type: "employee",
        text: newMessage.message,
        time: formatTimeShort(newMessage.created_at),
        created_at: newMessage.created_at,
        sender_name: newMessage.sender_name,
        is_read: newMessage.is_read,
        is_auto_reply: true, // Đánh dấu là tin nhắn tự động
      };

      setMessages((prev) => [...prev, transformedMessage]);

      // Cập nhật conversations ngay lập tức để giúp widget khách hàng nhận thấy thay đổi nhanh hơn
      loadConversations(true);
    } catch (error) {
      console.error("   ❌ Lỗi khi gửi tin nhắn tự động:", error);
      // Không throw error để không ảnh hưởng đến flow chính
    }
  };

  // Load messages từ API (tối ưu với cache và chỉ load khi cần)
  const loadMessages = async (conversationId, isPolling = false) => {
    // Tránh nhiều polling cùng lúc
    if (isPolling && isPollingRef.current) {
      return;
    }

    console.log(
      "🟢 [EmployeeChat] loadMessages - Bắt đầu",
      isPolling ? "(polling)" : ""
    );
    console.log("   conversationId:", conversationId);

    if (!conversationId) {
      console.log("   ❌ Không có conversationId, dừng lại");
      return;
    }

    // Khi polling, kiểm tra xem có tin nhắn mới không dựa trên last message ID
    if (isPolling) {
      isPollingRef.current = true;

      // Nếu không có last message ID, load toàn bộ
      if (!lastMessageIdRef.current) {
        isPollingRef.current = false;
        await loadMessages(conversationId, false);
        return;
      }
    }

    // Không set loading khi polling để tránh flicker
    if (!isPolling) {
      setLoadingMessages(true);
    }
    setError(null);
    try {
      console.log("   📡 Gọi API getMessages...");
      const data = await chatApi.getMessages(conversationId);
      console.log("   ✅ Nhận được data:", data);
      console.log("   Data type:", Array.isArray(data) ? "array" : typeof data);
      console.log("   Data length:", Array.isArray(data) ? data.length : "N/A");

      // Kiểm tra nếu data là array
      if (!Array.isArray(data)) {
        console.warn("   ⚠️ API returned non-array data for messages:", data);
        if (!isPolling) {
          setMessages([]);
        }
        isPollingRef.current = false;
        return;
      }

      // Khi polling, chỉ xử lý nếu có tin nhắn mới
      if (isPolling && data.length > 0) {
        const latestMessageId = data[data.length - 1].id;
        if (latestMessageId === lastMessageIdRef.current) {
          console.log("   ⏭️ Không có tin nhắn mới, bỏ qua");
          isPollingRef.current = false;
          return;
        }
      }

      console.log("   🔄 Đang transform messages...");
      // Transform messages từ API sang format UI (chỉ transform những tin nhắn chưa có)
      const previousMessageIds = new Set(
        previousMessagesRef.current.map((msg) => msg.id)
      );

      const transformed = data.map((msg) => {
        // Nếu đã có trong cache, sử dụng lại để tránh transform lại
        const cached = previousMessagesRef.current.find((m) => m.id === msg.id);
        if (cached) {
          return cached;
        }

        // Transform mới
        return {
          id: msg.id,
          type: msg.sender_role === "customer" ? "customer" : "employee",
          text: msg.message || "",
          time: formatTimeShort(msg.created_at),
          created_at: msg.created_at,
          sender_name:
            msg.sender_name ||
            (msg.sender_role === "customer" ? "Khách hàng" : "Nhân viên"),
          sender_avatar: msg.sender_avatar,
          is_read: msg.is_read || false,
        };
      });

      console.log("   ✅ Transformed messages:", transformed.length);

      // Lưu previous messages để so sánh
      const previousMessages = previousMessagesRef.current;
      let hasNewMessages = false;

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
          hasNewMessages = true;
          // Cập nhật ref
          previousMessagesRef.current = transformed;
          lastMessageIdRef.current = newLastId;
          return transformed;
        }

        // Không có thay đổi, giữ nguyên
        return prevMessages;
      });

      // Kiểm tra tin nhắn mới từ khách hàng và gửi phản hồi tự động
      if (hasNewMessages && transformed.length > 0) {
        // Tìm các tin nhắn mới từ khách hàng (chưa được phản hồi)
        const previousMessageIdsSet = new Set(
          previousMessages.map((msg) => msg.id)
        );
        const newCustomerMessages = transformed.filter(
          (msg) =>
            msg.type === "customer" &&
            !previousMessageIdsSet.has(msg.id) &&
            !autoRepliedMessagesRef.current.has(msg.id)
        );

        if (newCustomerMessages.length > 0) {
          // Lấy tin nhắn mới nhất từ khách hàng
          const latestCustomerMessage =
            newCustomerMessages[newCustomerMessages.length - 1];
          console.log(
            "   🔔 Phát hiện tin nhắn mới từ khách hàng:",
            latestCustomerMessage.id
          );

          // Tìm customer_id từ conversation
          const activeConv = conversations.find(
            (c) => c.conversation_id === conversationId
          );

          if (activeConv && activeConv.customerId) {
            // Gửi phản hồi tự động (không await để không block)
            sendAutoReply(
              conversationId,
              activeConv.customerId,
              latestCustomerMessage.id
            ).catch((err) => {
              console.error("   ⚠️ Lỗi khi gửi phản hồi tự động:", err);
            });
          }
        }
      } else {
        // Cập nhật ref ngay cả khi không có tin nhắn mới
        previousMessagesRef.current = transformed;
        if (transformed.length > 0) {
          lastMessageIdRef.current = transformed[transformed.length - 1].id;
        }
      }

      // Đánh dấu đã đọc (không block nếu lỗi, chỉ khi không phải polling)
      if (!isPolling) {
        try {
          console.log("   📝 Đánh dấu đã đọc...");
          await chatApi.markAsRead(conversationId);
          console.log("   ✅ Đã đánh dấu đã đọc");
        } catch (readError) {
          console.error(
            "   ⚠️ Error marking as read (non-blocking):",
            readError
          );
          // Không throw error, chỉ log
        }
      }

      // Cập nhật unread count trong conversations (chỉ khi không phải polling)
      if (!isPolling) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.conversation_id === conversationId
              ? { ...conv, unread: 0 }
              : conv
          )
        );
      }
      console.log("   ✅ Hoàn thành loadMessages");
    } catch (error) {
      // Không log error khi polling để tránh spam console
      if (!isPolling) {
        console.error("❌ [EmployeeChat] Error loading messages:", error);
        console.error("   Error code:", error.code);
        console.error("   Error message:", error.message);
        console.error("   Error response:", error.response?.data);
        console.error("   Error status:", error.response?.status);
        console.error("   Error stack:", error.stack);

        setError(error.message || "Không thể tải tin nhắn");

        if (error.response?.status === 404) {
          setError("Không tìm thấy cuộc trò chuyện");
        } else if (error.response?.status === 403) {
          setError("Bạn không có quyền xem cuộc trò chuyện này");
        }
      }
    } finally {
      if (!isPolling) {
        setLoadingMessages(false);
      }
      isPollingRef.current = false;
      console.log("   🟢 [EmployeeChat] loadMessages - Kết thúc");
    }
  };

  // Load conversations khi component mount
  useEffect(() => {
    if (user && (user.role === "employee" || user.role === "admin")) {
      loadConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
      // Reset danh sách tin nhắn đã phản hồi khi đổi conversation
      autoRepliedMessagesRef.current.clear();
      previousMessagesRef.current = [];
      lastMessageIdRef.current = null;
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
      previousMessagesRef.current = [];
      lastMessageIdRef.current = null;
    }

    // Clear polling khi đổi conversation
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  // Polling để cập nhật tin nhắn mới (mỗi 3 giây - tăng từ 2 giây để giảm tải)
  useEffect(() => {
    if (!activeConversationId) return;

    // Poll messages mỗi 3 giây (tối ưu hơn 2 giây)
    pollingIntervalRef.current = setInterval(() => {
      loadMessages(activeConversationId, true); // true = isPolling
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  // Polling để cập nhật danh sách conversations (mỗi 10 giây - tăng từ 5 giây để giảm tải)
  useEffect(() => {
    if (!user || (user.role !== "employee" && user.role !== "admin")) return;

    // Poll conversations mỗi 10 giây để cập nhật unread count và last message
    // Sử dụng debounce trong loadConversations để tránh gọi quá nhiều
    conversationsPollingIntervalRef.current = setInterval(() => {
      loadConversations(false); // Không force, sẽ sử dụng debounce
    }, 10000);

    return () => {
      if (conversationsPollingIntervalRef.current) {
        clearInterval(conversationsPollingIntervalRef.current);
        conversationsPollingIntervalRef.current = null;
      }
      // Clear timeout khi unmount
      if (loadConversationsTimeoutRef.current) {
        clearTimeout(loadConversationsTimeoutRef.current);
        loadConversationsTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

    const messageText = inputValue.trim();
    const tempId = `temp-${Date.now()}`;

    // Optimistic update: Hiển thị tin nhắn ngay lập tức
    const optimisticMessage = {
      id: tempId,
      type: "employee",
      text: messageText,
      time: formatTimeShort(new Date().toISOString()),
      created_at: new Date().toISOString(),
      sender_name: user?.name || "Nhân viên",
      is_read: false,
      isOptimistic: true, // Đánh dấu là tin nhắn tạm
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputValue("");

    // Cập nhật conversation ngay lập tức (optimistic)
    setConversations((prev) =>
      prev.map((conv) =>
        conv.conversation_id === activeConversationId
          ? {
              ...conv,
              lastMessage: messageText,
              lastMessageAt: new Date().toISOString(),
              time: "Vừa xong",
            }
          : conv
      )
    );

    try {
      console.log("🟢 [EmployeeChat] Gửi tin nhắn...");
      console.log("   message:", messageText);
      console.log("   conversation_id:", activeConversationId);
      console.log("   receiver_id:", activeConv.customerId);

      // Gửi tin nhắn qua API
      const newMessage = await chatApi.sendMessage({
        message: messageText,
        conversation_id: activeConversationId,
        receiver_id: activeConv.customerId,
        message_type: "text",
      });

      console.log("   ✅ Nhận được message từ server:", newMessage);

      // Thay thế tin nhắn tạm bằng tin nhắn thật từ server
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== tempId);
        const transformedMessage = {
          id: newMessage.id,
          type: "employee",
          text: newMessage.message,
          time: formatTimeShort(newMessage.created_at),
          created_at: newMessage.created_at,
          sender_name: newMessage.sender_name,
          is_read: newMessage.is_read,
        };
        return [...filtered, transformedMessage];
      });

      // Cập nhật last message ID
      lastMessageIdRef.current = newMessage.id;

      // Cập nhật conversations (không force để sử dụng debounce)
      loadConversations(false);
      console.log("   ✅ Hoàn thành gửi tin nhắn");
    } catch (error) {
      console.error("❌ [EmployeeChat] Error sending message:", error);
      console.error("   Error code:", error.code);
      console.error("   Error message:", error.message);
      console.error("   Error response:", error.response?.data);
      console.error("   Error status:", error.response?.status);

      // Xóa tin nhắn tạm nếu lỗi
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));

      // Khôi phục conversation
      loadConversations(true);

      alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
    }
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

  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm("Bạn có chắc muốn xóa cuộc trò chuyện này?")) {
      return;
    }

    try {
      console.log("🟢 [EmployeeChat] Xóa conversation:", conversationId);

      // Gọi API để xóa conversation
      await chatApi.deleteConversation(conversationId);

      console.log("   ✅ Đã xóa conversation thành công");

      // Xóa khỏi UI
      setConversations((prev) =>
        prev.filter((conv) => conv.conversation_id !== conversationId)
      );

      // Nếu đang xem conversation này, reset về trạng thái ban đầu
      if (activeConversationId === conversationId) {
        setActiveChat(null);
        setActiveConversationId(null);
        setMessages([]);
        setInputValue("");
      }
    } catch (error) {
      console.error("❌ [EmployeeChat] Error deleting conversation:", error);
      console.error("   Error code:", error.code);
      console.error("   Error message:", error.message);
      console.error("   Error response:", error.response?.data);
      console.error("   Error status:", error.response?.status);

      alert(
        error.response?.data?.message ||
          "Không thể xóa cuộc trò chuyện. Vui lòng thử lại."
      );
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
          {error && !loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "var(--danger, #dc3545)",
              }}
            >
              <i
                className="ri-error-warning-line"
                style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
              ></i>
              <p>{error}</p>
              <button
                onClick={loadConversations}
                style={{
                  marginTop: "1rem",
                  padding: "0.5rem 1rem",
                  background: "var(--primary, #007bff)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Thử lại
              </button>
            </div>
          ) : filteredConversations.length === 0 ? (
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
                  {conv.customerAvatar ? (
                    <img
                      src={conv.customerAvatar}
                      alt={conv.customerName || "Khách hàng"}
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "block";
                      }}
                    />
                  ) : null}
                  <i
                    className="ri-user-line"
                    style={{ display: conv.customerAvatar ? "none" : "block" }}
                  ></i>
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
              style={{
                animation: "spin 1s linear infinite",
                fontSize: "48px",
                color: "var(--primary)",
                opacity: 0.6,
              }}
            ></i>
            <h3>Đang tải...</h3>
            <p>Vui lòng chờ trong giây lát</p>
          </div>
        ) : activeConversationId ? (
          <>
            {/* Chat Header */}
            <header className="employee-chat__header">
              <div className="employee-chat__info">
                <div className="employee-chat__avatar">
                  {activeConversation?.customerAvatar ? (
                    <img
                      src={activeConversation.customerAvatar}
                      alt={activeConversation.customerName || "Khách hàng"}
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "block";
                      }}
                    />
                  ) : null}
                  <i
                    className="ri-user-line"
                    style={{
                      display: activeConversation?.customerAvatar
                        ? "none"
                        : "block",
                    }}
                  ></i>
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
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "var(--space-md)",
                  }}
                >
                  <i
                    className="ri-loader-4-line"
                    style={{
                      animation: "spin 1s linear infinite",
                      fontSize: "32px",
                      color: "var(--primary)",
                      opacity: 0.6,
                    }}
                  ></i>
                  <p
                    style={{
                      color: "var(--muted)",
                      fontSize: "var(--font-size-sm)",
                      margin: 0,
                    }}
                  >
                    Đang tải tin nhắn...
                  </p>
                </div>
              ) : error ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "var(--danger, #dc3545)",
                  }}
                >
                  <i
                    className="ri-error-warning-line"
                    style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
                  ></i>
                  <p>{error}</p>
                  <button
                    onClick={() => loadMessages(activeConversationId)}
                    style={{
                      marginTop: "1rem",
                      padding: "0.5rem 1rem",
                      background: "var(--primary, #007bff)",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Thử lại
                  </button>
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
                        {msg.sender_avatar ? (
                          <img
                            src={msg.sender_avatar}
                            alt={msg.sender_name || "Khách hàng"}
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display =
                                "block";
                            }}
                          />
                        ) : null}
                        <i
                          className="ri-user-line"
                          style={{
                            display: msg.sender_avatar ? "none" : "block",
                          }}
                        ></i>
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
                          {msg.is_auto_reply && (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                opacity: 0.7,
                                marginLeft: "0.5rem",
                                fontStyle: "italic",
                              }}
                              title="Tin nhắn tự động"
                            >
                              🤖
                            </span>
                          )}
                        </p>
                      )}
                      <div className="chat-time-wrapper">
                        <span className="chat-time">{msg.time}</span>
                        {msg.edited && !msg.recalled && (
                          <span className="edited-label">Đã chỉnh sửa</span>
                        )}
                        {msg.is_auto_reply && !msg.recalled && (
                          <span
                            className="edited-label"
                            style={{ fontSize: "0.7rem" }}
                          >
                            Tự động
                          </span>
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
