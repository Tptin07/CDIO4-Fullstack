// src/components/FloatingButtons.jsx
import { useState, useEffect } from "react";
import ChatWidget from "./ChatWidget";

export default function FloatingButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleConsult = () => {
    setChatOpen(true);
  };

  return (
    <>
      <div className="floating-buttons">
        {/* Nút Tư vấn trực tuyến */}
        <button
          className="floating-btn floating-btn--consult"
          onClick={handleConsult}
          aria-label="Tư vấn trực tuyến"
          title="Tư vấn trực tuyến"
        >
          <i className="ri-customer-service-2-line"></i>
          <span className="floating-btn__label">Tư vấn</span>
        </button>

        {/* Nút Scroll to Top */}
        {showScrollTop && (
          <button
            className="floating-btn floating-btn--scroll"
            onClick={scrollToTop}
            aria-label="Lên đầu trang"
            title="Lên đầu trang"
          >
            <i className="ri-arrow-up-line"></i>
          </button>
        )}
      </div>

      {/* Chat Widget */}
      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

