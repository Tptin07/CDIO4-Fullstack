// src/pages/GioHang.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dispatchCartUpdated } from "../services/products";
import * as cartService from "../services/cart";
import * as couponService from "../services/coupon";
import * as orderApi from "../services/orderApi";
import {
  getProvinces,
  getDistrictsByProvince,
  getWardsByProvinceAndDistrict,
} from "../data/vietnam-locations";
import "../assets/css/styles.css";

export default function GioHang() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Checkout state
  const [checkingOut, setCheckingOut] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Shipping info state
  const [shippingInfo, setShippingInfo] = useState({
    full_name: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    street_address: "",
  });
  const [shippingErrors, setShippingErrors] = useState({
    full_name: "",
    phone: "",
  });
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  // Location dropdowns state
  const [availableProvinces] = useState(getProvinces());
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);

  // Load cart from API
  useEffect(() => {
    loadCart();
    loadUserInfo();

    // Listen for cart updates from other pages
    const handleCartUpdate = () => {
      loadCart();
    };
    document.addEventListener("CART_UPDATED", handleCartUpdate);

    return () => {
      document.removeEventListener("CART_UPDATED", handleCartUpdate);
    };
  }, []);

  // Load user info to fill shipping form
  async function loadUserInfo() {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      setLoadingUserInfo(true);
      const response = await fetch("http://localhost:3000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.user) {
          const user = data.data.user;
          // Lấy danh sách địa chỉ
          const addressResponse = await fetch(
            "http://localhost:3000/api/auth/addresses",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (addressResponse.ok) {
            const addressData = await addressResponse.json();
            if (addressData.success && addressData.data) {
              // Lọc và validate addresses - chỉ giữ lại những address có id là số nguyên hợp lệ
              // Loại bỏ hoàn toàn các ID tạm thời (dạng '0-xxx-yyy') và ID bắt đầu bằng 0
              const validAddresses = (addressData.data || [])
                .filter((addr) => {
                  const idString = addr.id?.toString() || "";

                  // Loại bỏ ID bắt đầu bằng "0-" (ID tạm thời)
                  if (idString.startsWith("0-")) {
                    console.warn(
                      "⚠️ Rejected temporary ID (starts with 0-):",
                      addr.id
                    );
                    return false;
                  }

                  // Kiểm tra nếu id là string, phải là số thuần túy (chỉ chứa chữ số)
                  if (typeof addr.id === "string") {
                    // Nếu có ký tự không phải số (như '-', chữ cái), loại bỏ
                    if (!/^\d+$/.test(addr.id)) {
                      console.warn(
                        "⚠️ Invalid address ID (contains non-numeric chars) filtered out:",
                        addr.id
                      );
                      return false;
                    }
                    // Loại bỏ ID bắt đầu bằng 0 (trừ số 0 đơn lẻ, nhưng số 0 cũng không hợp lệ)
                    if (addr.id.length > 1 && addr.id.startsWith("0")) {
                      console.warn("⚠️ Rejected ID starting with 0:", addr.id);
                      return false;
                    }
                  }

                  const addrId =
                    typeof addr.id === "string"
                      ? parseInt(addr.id.replace(/[^0-9]/g, ""))
                      : parseInt(addr.id);

                  // Đảm bảo ID là số nguyên dương (>= 1), không bắt đầu bằng 0
                  const isValid =
                    !isNaN(addrId) &&
                    addrId > 0 &&
                    addrId.toString().charAt(0) !== "0";
                  if (!isValid) {
                    console.warn(
                      "⚠️ Invalid address ID filtered out:",
                      addr.id,
                      typeof addr.id
                    );
                  }
                  return isValid;
                })
                .map((addr) => {
                  // Đảm bảo id là số nguyên hợp lệ, không bắt đầu bằng 0
                  const cleanId =
                    typeof addr.id === "string"
                      ? parseInt(addr.id.replace(/[^0-9]/g, ""))
                      : parseInt(addr.id);

                  // Kiểm tra lại không bắt đầu bằng 0
                  if (cleanId.toString().charAt(0) === "0" && cleanId !== 0) {
                    console.error("❌ Address ID starts with 0:", cleanId);
                    return null;
                  }

                  return {
                    ...addr,
                    id: cleanId, // Đảm bảo id là số nguyên, không bắt đầu bằng 0
                  };
                })
                .filter((addr) => addr !== null); // Loại bỏ null

              console.log(
                "✅ Validated addresses:",
                validAddresses.map((a) => ({ id: a.id, name: a.full_name }))
              );
              setSavedAddresses(validAddresses);

              if (validAddresses.length > 0) {
                const defaultAddress =
                  validAddresses.find((addr) => addr.is_default) ||
                  validAddresses[0];
                setShippingInfo({
                  full_name: defaultAddress.full_name || user.name || "",
                  phone: defaultAddress.phone || user.phone || "",
                  province: defaultAddress.province || "",
                  district: defaultAddress.district || "",
                  ward: defaultAddress.ward || "",
                  street_address: defaultAddress.street_address || "",
                });
                // Đảm bảo id là số nguyên hợp lệ
                const addressId = parseInt(defaultAddress.id);
                if (!isNaN(addressId) && addressId > 0) {
                  setSelectedAddressId(addressId.toString());
                } else {
                  console.error(
                    "❌ Invalid defaultAddress.id:",
                    defaultAddress.id
                  );
                  setSelectedAddressId("");
                }
              } else {
                // Nếu không có địa chỉ, dùng thông tin user
                setShippingInfo({
                  full_name: user.name || "",
                  phone: user.phone || "",
                  province: "",
                  district: "",
                  ward: "",
                  street_address: "",
                });
              }
            } else {
              // Nếu không lấy được địa chỉ, dùng thông tin user
              setShippingInfo({
                full_name: user.name || "",
                phone: user.phone || "",
                province: "",
                district: "",
                ward: "",
                street_address: "",
              });
            }
          } else {
            // Nếu không lấy được địa chỉ, dùng thông tin user
            setShippingInfo({
              full_name: user.name || "",
              phone: user.phone || "",
              province: "",
              district: "",
              ward: "",
              street_address: "",
            });
          }
        }
      }
    } catch (err) {
      console.error("Error loading user info:", err);
    } finally {
      setLoadingUserInfo(false);
    }
  }

  // Validation helpers for shipping inputs
  function validateFullName(name) {
    if (!name || !name.trim()) return "Họ và tên là bắt buộc";
    const trimmed = name.trim();
    if (trimmed.length < 2) return "Họ và tên phải có ít nhất 2 ký tự";
    // Allow Unicode letters and spaces only
    if (!/^[\p{L}\s]+$/u.test(trimmed))
      return "Họ và tên không được chứa số hoặc ký tự đặc biệt";
    return "";
  }

  function validatePhone(phone) {
    if (!phone || !phone.trim()) return "Số điện thoại là bắt buộc";
    // Remove non-digit chars
    const digits = phone.replace(/\D/g, "");
    if (!/^\d+$/.test(digits)) return "Số điện thoại chỉ được chứa chữ số";
    // Vietnamese mobile numbers usually 10 digits (starting with 0)
    if (digits.length !== 10) return "Số điện thoại phải đủ 10 chữ số";
    return "";
  }

  // Handle select address from saved addresses
  function handleSelectAddress(addressId) {
    // Đảm bảo addressId là số nguyên hợp lệ
    const parsedId = parseInt(addressId);
    if (isNaN(parsedId) || parsedId <= 0) {
      console.error("❌ Invalid addressId in handleSelectAddress:", addressId);
      return;
    }

    const address = savedAddresses.find((addr) => {
      const addrId = parseInt(addr.id);
      return !isNaN(addrId) && addrId === parsedId;
    });

    if (address) {
      setSelectedAddressId(parsedId.toString());
      const province = address.province || "";
      const district = address.district || "";
      const ward = address.ward || "";

      setShippingInfo({
        ...shippingInfo,
        province: province,
        district: district,
        ward: ward,
      });

      // Load districts and wards when selecting from saved address
      if (province) {
        const districts = getDistrictsByProvince(province);
        setAvailableDistricts(districts);

        if (district && districts.includes(district)) {
          const wards = getWardsByProvinceAndDistrict(province, district);
          setAvailableWards(wards);
        } else {
          setAvailableWards([]);
        }
      }
    }
  }

  // Handle province change
  function handleProvinceChange(province) {
    setShippingInfo({
      ...shippingInfo,
      province: province,
      district: "", // Reset district when province changes
      ward: "", // Reset ward when province changes
    });
    setSelectedAddressId(""); // Reset selection

    if (province) {
      const districts = getDistrictsByProvince(province);
      setAvailableDistricts(districts);
      setAvailableWards([]); // Reset wards
    } else {
      setAvailableDistricts([]);
      setAvailableWards([]);
    }
  }

  // Handle district change
  function handleDistrictChange(district) {
    setShippingInfo({
      ...shippingInfo,
      district: district,
      ward: "", // Reset ward when district changes
    });
    setSelectedAddressId(""); // Reset selection

    if (district && shippingInfo.province) {
      const wards = getWardsByProvinceAndDistrict(
        shippingInfo.province,
        district
      );
      setAvailableWards(wards);
    } else {
      setAvailableWards([]);
    }
  }

  // Handle ward change
  function handleWardChange(ward) {
    setShippingInfo({
      ...shippingInfo,
      ward: ward,
    });
    setSelectedAddressId(""); // Reset selection
  }

  // Load districts and wards when province or district is set from saved address
  useEffect(() => {
    if (shippingInfo.province) {
      const districts = getDistrictsByProvince(shippingInfo.province);
      setAvailableDistricts(districts);

      if (shippingInfo.district && districts.includes(shippingInfo.district)) {
        const wards = getWardsByProvinceAndDistrict(
          shippingInfo.province,
          shippingInfo.district
        );
        setAvailableWards(wards);
      }
    }
  }, [shippingInfo.province, shippingInfo.district]);

  // Re-validate coupon when cart changes
  useEffect(() => {
    if (appliedCoupon && cartItems.length > 0) {
      const subtotal = calculateSubtotal();
      validateAndApplyCoupon(appliedCoupon.code, subtotal, true);
    }
  }, [cartItems]);

  // Load cart from API
  async function loadCart() {
    try {
      setLoading(true);
      setError(null);
      const cartData = await cartService.getCart();

      // Transform data to match frontend format
      const enriched = cartData.items.map((item) => {
        // Đảm bảo id là số nguyên
        const itemId = parseInt(item.id);
        if (isNaN(itemId)) {
          console.error("❌ Invalid cart item id:", item.id, typeof item.id);
        }
        return {
          id: itemId || item.id, // Fallback nếu parse fail
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          old_price: item.old_price,
          image: item.image || "/img/placeholder.jpg",
          img: item.image || "/img/placeholder.jpg",
          cover: item.image || "/img/placeholder.jpg",
          qty: item.quantity,
          quantity: item.quantity,
          note: item.note || "",
          subtotal: item.subtotal,
          stock_quantity: item.stock_quantity,
          stock_status: item.stock_status,
        };
      });

      setCartItems(enriched);
    } catch (err) {
      console.error("Error loading cart:", err);
      setError(err.message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }

  // Format price
  function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  }

  // Calculate subtotal
  function calculateSubtotal() {
    return cartItems.reduce(
      (sum, item) =>
        sum + (item.subtotal || (item.price || 0) * (item.qty || 1)),
      0
    );
  }

  // Update quantity
  async function updateQty(cartItemId, newQty, note = null) {
    if (newQty < 1) return;
    try {
      // Đảm bảo cartItemId là số nguyên
      const itemId = parseInt(cartItemId);
      if (isNaN(itemId)) {
        console.error(
          "❌ Invalid cartItemId in updateQty:",
          cartItemId,
          typeof cartItemId
        );
        alert("Lỗi: ID sản phẩm không hợp lệ");
        return;
      }

      // Lấy note hiện tại nếu không được truyền vào
      if (note === null) {
        const currentItem = cartItems.find((item) => item.id === itemId);
        note = currentItem?.note || null;
      }
      await cartService.updateCartItem(itemId, newQty, note);
      dispatchCartUpdated();
      await loadCart();
    } catch (err) {
      console.error("Error updating cart:", err);
      alert(err.message || "Lỗi khi cập nhật số lượng");
    }
  }

  // Update note
  async function updateNote(cartItemId, note) {
    try {
      // Đảm bảo cartItemId là số nguyên
      const itemId = parseInt(cartItemId);
      if (isNaN(itemId)) {
        console.error(
          "❌ Invalid cartItemId in updateNote:",
          cartItemId,
          typeof cartItemId
        );
        return;
      }

      const currentItem = cartItems.find((item) => item.id === itemId);
      if (!currentItem) return;

      await cartService.updateCartItem(
        itemId,
        currentItem.qty || currentItem.quantity,
        note || null
      );
      dispatchCartUpdated();
      await loadCart();
    } catch (err) {
      console.error("Error updating note:", err);
      alert(err.message || "Lỗi khi cập nhật ghi chú");
    }
  }

  // Remove item from cart
  async function removeItem(cartItemId) {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      try {
        // Đảm bảo cartItemId là số nguyên
        const itemId = parseInt(cartItemId);
        if (isNaN(itemId)) {
          console.error(
            "❌ Invalid cartItemId in removeItem:",
            cartItemId,
            typeof cartItemId
          );
          alert("Lỗi: ID sản phẩm không hợp lệ");
          return;
        }

        await cartService.removeFromCart(itemId);
        dispatchCartUpdated();
        await loadCart();
        // Remove coupon if cart becomes empty
        if (cartItems.length === 1) {
          setAppliedCoupon(null);
          setCouponCode("");
        }
      } catch (err) {
        console.error("Error removing item:", err);
        alert(err.message || "Lỗi khi xóa sản phẩm");
      }
    }
  }

  // Clear entire cart
  async function clearCart() {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      try {
        await cartService.clearCart();
        dispatchCartUpdated();
        await loadCart();
        setAppliedCoupon(null);
        setCouponCode("");
      } catch (err) {
        console.error("Error clearing cart:", err);
        alert(err.message || "Lỗi khi xóa giỏ hàng");
      }
    }
  }

  // Apply coupon
  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      setCouponError("Vui lòng nhập mã coupon");
      return;
    }

    setApplyingCoupon(true);
    setCouponError("");

    try {
      const subtotal = calculateSubtotal();
      await validateAndApplyCoupon(couponCode.trim().toUpperCase(), subtotal);
    } catch (err) {
      setCouponError(err.message || "Mã coupon không hợp lệ");
    } finally {
      setApplyingCoupon(false);
    }
  }

  // Validate and apply coupon
  async function validateAndApplyCoupon(code, amount, silent = false) {
    try {
      const result = await couponService.validateCoupon(code, amount);
      setAppliedCoupon({
        code: code,
        discount_amount: result.discount_amount,
        discount_type: result.discount_type,
        discount_value: result.discount_value,
        name: result.name,
      });
      setCouponCode(code);
      setCouponError("");
      if (!silent) {
        // Show success message
      }
    } catch (err) {
      if (!silent) {
        setCouponError(err.message || "Mã coupon không hợp lệ");
      }
      setAppliedCoupon(null);
      throw err;
    }
  }

  // Remove coupon
  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  }

  // Calculate totals
  const subtotal = calculateSubtotal();
  const shipping = subtotal >= 300000 ? 0 : 30000;
  const discount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  // Payment methods
  const paymentMethods = [
    {
      id: "COD",
      name: "Thanh toán khi nhận hàng",
      icon: "💰",
      description: "Thanh toán bằng tiền mặt khi nhận hàng",
    },
    {
      id: "bank_transfer",
      name: "Chuyển khoản ngân hàng",
      icon: "🏦",
      description: "Chuyển khoản qua tài khoản ngân hàng",
    },
    {
      id: "credit_card",
      name: "Thẻ tín dụng/Ghi nợ",
      icon: "💳",
      description: "Thanh toán bằng thẻ Visa, Mastercard",
    },
    {
      id: "e_wallet",
      name: "Ví điện tử",
      icon: "📱",
      description: "MoMo, ZaloPay, VNPay",
    },
  ];

  // Handle checkout
  async function handleCheckout() {
    if (cartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("Vui lòng đăng nhập để thanh toán");
      navigate("/dang-nhap");
      return;
    }

    try {
      setCheckingOut(true);

      // Validation thông tin giao hàng (format + required fields)
      const nameErr = validateFullName(shippingInfo.full_name);
      const phoneErr = validatePhone(shippingInfo.phone);
      const missingFields = [];
      if (!shippingInfo.province) missingFields.push("Tỉnh/Thành phố");
      if (!shippingInfo.district) missingFields.push("Quận/Huyện");
      if (!shippingInfo.ward) missingFields.push("Phường/Xã");
      if (!shippingInfo.street_address) missingFields.push("Địa chỉ chi tiết");

      setShippingErrors({ full_name: nameErr, phone: phoneErr });

      if (nameErr || phoneErr || missingFields.length > 0) {
        let messages = [];
        if (nameErr) messages.push(nameErr);
        if (phoneErr) messages.push(phoneErr);
        if (missingFields.length > 0)
          messages.push("Vui lòng điền: " + missingFields.join(", "));
        alert(messages.join("\n"));
        return;
      }

      // Lưu hoặc tìm địa chỉ
      let addressId = null;
      try {
        // Nếu có selectedAddressId hợp lệ, dùng nó
        if (selectedAddressId && selectedAddressId.trim() !== "") {
          const idString = selectedAddressId.toString();

          // Loại bỏ ID bắt đầu bằng "0-" (ID tạm thời)
          if (idString.startsWith("0-")) {
            console.error(
              "❌ Rejected temporary ID (starts with 0-):",
              selectedAddressId
            );
            setSelectedAddressId("");
          } else {
            // Loại bỏ bất kỳ ký tự nào không phải số
            const cleanId = idString.replace(/[^0-9]/g, "");

            // Loại bỏ ID bắt đầu bằng 0
            if (cleanId.length > 1 && cleanId.startsWith("0")) {
              console.error(
                "❌ Rejected ID starting with 0:",
                selectedAddressId,
                "cleaned:",
                cleanId
              );
              setSelectedAddressId("");
            } else {
              const parsedSelectedId = parseInt(cleanId);
              if (
                !isNaN(parsedSelectedId) &&
                parsedSelectedId > 0 &&
                !parsedSelectedId.toString().startsWith("0")
              ) {
                console.log("✅ Using selectedAddressId:", parsedSelectedId);
                addressId = parsedSelectedId;
              } else {
                console.warn(
                  "⚠️ Invalid selectedAddressId, will search for matching address:",
                  selectedAddressId
                );
                // Reset selectedAddressId nếu không hợp lệ
                setSelectedAddressId("");
              }
            }
          }
        }

        // Nếu chưa có addressId, thử tìm địa chỉ trùng khớp
        if (!addressId) {
          const response = await fetch(
            "http://localhost:3000/api/auth/addresses",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data && data.data.length > 0) {
              // Tìm địa chỉ trùng khớp
              const matchingAddress = data.data.find(
                (addr) =>
                  addr.full_name === shippingInfo.full_name &&
                  addr.phone === shippingInfo.phone &&
                  addr.province === shippingInfo.province &&
                  addr.district === shippingInfo.district &&
                  addr.ward === shippingInfo.ward &&
                  addr.street_address === shippingInfo.street_address
              );

              if (matchingAddress) {
                // Đảm bảo id là số nguyên
                const addrId = matchingAddress.id;
                const parsedId =
                  typeof addrId === "string"
                    ? parseInt(addrId.replace(/[^0-9]/g, ""))
                    : parseInt(addrId);
                if (isNaN(parsedId) || parsedId <= 0) {
                  console.error(
                    "❌ Invalid matchingAddress.id:",
                    matchingAddress.id,
                    typeof matchingAddress.id
                  );
                  throw new Error("Địa chỉ không hợp lệ");
                }
                addressId = parsedId;
                console.log("✅ Found matching address:", addressId);
              } else {
                // Tạo địa chỉ mới
                const saveResponse = await fetch(
                  "http://localhost:3000/api/auth/addresses",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      ...shippingInfo,
                      is_default: true,
                    }),
                  }
                );

                if (saveResponse.ok) {
                  const saveData = await saveResponse.json();
                  // Đảm bảo id là số nguyên, không bắt đầu bằng 0
                  const responseId = saveData.data?.id;
                  const idString = responseId?.toString() || "";

                  // Loại bỏ ID bắt đầu bằng "0-"
                  if (idString.startsWith("0-")) {
                    console.error(
                      "❌ Rejected temporary ID from API (starts with 0-):",
                      responseId
                    );
                    throw new Error(
                      "Lỗi khi lưu địa chỉ: ID tạm thời không được phép"
                    );
                  }

                  const cleanId =
                    typeof responseId === "string"
                      ? responseId.replace(/[^0-9]/g, "")
                      : responseId.toString();

                  // Loại bỏ ID bắt đầu bằng 0
                  if (cleanId.length > 1 && cleanId.startsWith("0")) {
                    console.error(
                      "❌ Rejected ID starting with 0 from API:",
                      responseId,
                      "cleaned:",
                      cleanId
                    );
                    throw new Error(
                      "Lỗi khi lưu địa chỉ: ID bắt đầu bằng 0 không hợp lệ"
                    );
                  }

                  const parsedId = parseInt(cleanId);
                  if (
                    isNaN(parsedId) ||
                    parsedId <= 0 ||
                    parsedId.toString().charAt(0) === "0"
                  ) {
                    console.error(
                      "❌ Invalid saveData.data.id:",
                      saveData.data?.id,
                      typeof saveData.data?.id
                    );
                    throw new Error("Lỗi khi lưu địa chỉ: ID không hợp lệ");
                  }
                  addressId = parsedId;
                  console.log("✅ Created new address:", addressId);
                }
              }
            } else {
              // Tạo địa chỉ mới
              const saveResponse = await fetch(
                "http://localhost:3000/api/auth/addresses",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    ...shippingInfo,
                    is_default: true,
                  }),
                }
              );

              if (saveResponse.ok) {
                const saveData = await saveResponse.json();
                const parsedId = parseInt(saveData.data.id);
                if (isNaN(parsedId)) {
                  console.error(
                    "❌ Invalid saveData.data.id:",
                    saveData.data.id,
                    typeof saveData.data.id
                  );
                  throw new Error("Lỗi khi lưu địa chỉ");
                }
                addressId = parsedId;
                console.log("✅ Created new address:", addressId);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error saving/fetching addresses:", err);
        alert("Lỗi khi lưu thông tin giao hàng. Vui lòng thử lại.");
        return;
      }

      if (!addressId || isNaN(addressId)) {
        alert("Lỗi khi lưu thông tin giao hàng. Vui lòng thử lại.");
        return;
      }

      // Đảm bảo address_id là số nguyên - loại bỏ mọi ký tự không phải số
      const cleanAddressId = addressId.toString().replace(/[^0-9]/g, "");
      const addressIdInt = parseInt(cleanAddressId);
      if (isNaN(addressIdInt) || addressIdInt <= 0) {
        console.error(
          "❌ Invalid addressId before sending:",
          addressId,
          typeof addressId,
          "cleaned:",
          cleanAddressId
        );
        alert("Lỗi: Địa chỉ giao hàng không hợp lệ. Vui lòng thử lại.");
        return;
      }

      // Thu thập ghi chú từ tất cả các item trong giỏ hàng
      const notes = cartItems
        .map((item, index) => {
          const itemNote = item.note?.trim();
          if (itemNote) {
            const productName =
              item.name || item.product_name || `Sản phẩm ${index + 1}`;
            return `${productName}: ${itemNote}`;
          }
          return null;
        })
        .filter((note) => note !== null);

      // Gộp tất cả note thành một chuỗi
      const combinedNote = notes.length > 0 ? notes.join("\n\n") : null;

      console.log("📤 Sending order data:", {
        address_id: addressIdInt,
        address_id_type: typeof addressIdInt,
        payment_method: paymentMethod,
        note: combinedNote,
        notes_count: notes.length,
      });

      const orderData = {
        address_id: addressIdInt,
        payment_method: paymentMethod,
        shipping_method: "Giao hàng tiêu chuẩn",
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        note: combinedNote || null,
      };

      const order = await orderApi.createOrder(orderData);

      // Hiển thị thông báo thành công với thông điệp "chờ xác nhận"
      alert(
        `✅ Thanh toán thành công, chờ xác nhận!\n\nMã đơn hàng: ${
          order.order_code || order.orderCode
        }\nTổng tiền: ${formatPrice(
          order.final_amount || order.finalAmount
        )}\n\nĐơn hàng của bạn đã được gửi và đang chờ xác nhận. Bạn có thể theo dõi đơn hàng trong trang "Đơn hàng của tôi".`
      );

      // Clear cart and coupon
      await cartService.clearCart();
      dispatchCartUpdated();
      setAppliedCoupon(null);
      setCouponCode("");

      // Navigate to order detail page or account orders page
      navigate(`/tai-khoan`, {
        state: {
          activeTab: "orders",
          orderId: order.id || order.order_id,
          orderCode: order.order_code || order.orderCode,
        },
      });
    } catch (err) {
      console.error("Error creating order:", err);
      alert(err.message || "Lỗi khi tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setCheckingOut(false);
      setShowAddressModal(false);
    }
  }

  return (
    <main className="lc cart-page">
      <div className="container">
        {loading ? (
          <div className="cart-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải giỏ hàng...</p>
          </div>
        ) : error ? (
          <div className="cart-error">
            <i className="ri-error-warning-line"></i>
            <p>Lỗi: {error}</p>
            <button className="btn" onClick={loadCart}>
              Thử lại
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          // Empty cart
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm!</p>
            <Link to="/ban-chay" className="btn btn--primary">
              <i className="ri-shopping-bag-line"></i> Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="cart-layout-modern">
            {/* Cart Items List */}
            <section className="cart-items-section-modern">
              <div className="cart-section-header">
                <h3>Sản phẩm ({cartItems.length})</h3>
              </div>

              <div className="cart-items-modern">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item-modern">
                    <div className="cart-item-image-modern">
                      <Link to={`/san-pham/${item.product_id}`}>
                        <img
                          src={
                            item.img ||
                            item.cover ||
                            item.image ||
                            "/img/vitc.png"
                          }
                          alt={item.name}
                        />
                      </Link>
                    </div>

                    <div className="cart-item-info-modern">
                      <h3 className="cart-item-name-modern">
                        <Link to={`/san-pham/${item.product_id}`}>
                          {item.name}
                        </Link>
                      </h3>

                      <div className="cart-item-price-row-modern">
                        {item.old_price && item.old_price > item.price && (
                          <span className="price--old-modern">
                            {formatPrice(item.old_price)}
                          </span>
                        )}
                        <span className="price-modern">
                          {formatPrice(item.price || 0)}
                        </span>
                      </div>

                      <div className="cart-item-controls-modern">
                        <div className="qty-wrapper-modern">
                          <button
                            className="qty-btn-modern qty-minus"
                            onClick={() =>
                              updateQty(item.id, (item.qty || 1) - 1)
                            }
                            disabled={item.qty <= 1}
                          >
                            <i className="ri-subtract-line"></i>
                          </button>
                          <input
                            type="number"
                            className="qty-input-modern"
                            value={item.qty || 1}
                            min="1"
                            onChange={(e) =>
                              updateQty(item.id, parseInt(e.target.value) || 1)
                            }
                          />
                          <button
                            className="qty-btn-modern qty-plus"
                            onClick={() =>
                              updateQty(item.id, (item.qty || 1) + 1)
                            }
                          >
                            <i className="ri-add-line"></i>
                          </button>
                        </div>

                        <div className="cart-item-total-modern">
                          <span className="label">Thành tiền:</span>
                          <span className="value">
                            {formatPrice((item.price || 0) * (item.qty || 1))}
                          </span>
                        </div>

                        <button
                          className="cart-item-delete-modern"
                          onClick={() => removeItem(item.id)}
                          title="Xóa sản phẩm"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>

                      {/* Ghi chú cho sản phẩm */}
                      <div className="cart-item-note-modern">
                        <label className="cart-note-label">
                          <i className="ri-file-text-line"></i> Ghi chú:
                        </label>
                        <textarea
                          className="cart-note-input"
                          placeholder="Nhập ghi chú cho sản phẩm này (tùy chọn)..."
                          value={item.note || ""}
                          onChange={(e) => {
                            // Cập nhật local state ngay lập tức để UX tốt hơn
                            setCartItems((prevItems) =>
                              prevItems.map((prevItem) =>
                                prevItem.id === item.id
                                  ? { ...prevItem, note: e.target.value }
                                  : prevItem
                              )
                            );
                          }}
                          onBlur={(e) => {
                            // Lưu vào database khi blur (rời khỏi input)
                            updateNote(item.id, e.target.value);
                          }}
                          rows="2"
                          maxLength="500"
                        />
                        <span className="cart-note-hint">
                          {item.note ? item.note.length : 0}/500 ký tự
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Cart Summary Sidebar */}
            <aside className="cart-summary-modern">
              {/* Shipping Info Section */}
              <div className="cart-shipping-section">
                <h4>
                  <i className="ri-truck-line"></i> Thông tin giao hàng
                </h4>
                <div className="shipping-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Họ và tên *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={shippingInfo.full_name}
                        onChange={(e) => {
                          setShippingInfo({
                            ...shippingInfo,
                            full_name: e.target.value,
                          });
                          // clear error while typing
                          if (shippingErrors.full_name) {
                            setShippingErrors({
                              ...shippingErrors,
                              full_name: "",
                            });
                          }
                        }}
                        onBlur={() => {
                          const err = validateFullName(shippingInfo.full_name);
                          setShippingErrors({
                            ...shippingErrors,
                            full_name: err,
                          });
                        }}
                        placeholder="Nhập họ và tên"
                        required
                      />
                      {shippingErrors.full_name && (
                        <div className="input-error">
                          {shippingErrors.full_name}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Số điện thoại *</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={shippingInfo.phone}
                        onChange={(e) => {
                          // Allow only digits while typing
                          const digits = (e.target.value || "")
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          setShippingInfo({ ...shippingInfo, phone: digits });
                          if (shippingErrors.phone) {
                            setShippingErrors({ ...shippingErrors, phone: "" });
                          }
                        }}
                        onKeyDown={(e) => {
                          // Allow control keys: backspace, delete, arrows, tab
                          const allowed = [
                            "Backspace",
                            "Delete",
                            "ArrowLeft",
                            "ArrowRight",
                            "Tab",
                          ];
                          if (allowed.includes(e.key)) return;
                          // Allow copy/paste/select all shortcuts
                          if (e.ctrlKey || e.metaKey) return;
                          // Block non-digit keys
                          if (!/^[0-9]$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const paste =
                            (e.clipboardData || window.clipboardData).getData(
                              "text"
                            ) || "";
                          const digits = paste.replace(/\D/g, "");
                          const combined = (shippingInfo.phone + digits)
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          setShippingInfo({ ...shippingInfo, phone: combined });
                          if (shippingErrors.phone)
                            setShippingErrors({ ...shippingErrors, phone: "" });
                        }}
                        onBlur={() => {
                          const err = validatePhone(shippingInfo.phone);
                          setShippingErrors({ ...shippingErrors, phone: err });
                        }}
                        maxLength={10}
                        placeholder="Nhập số điện thoại"
                        required
                      />
                      {shippingErrors.phone && (
                        <div className="input-error">
                          {shippingErrors.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Chọn từ địa chỉ đã lưu */}
                  {savedAddresses.length > 0 && (
                    <div className="form-group">
                      <label>
                        <i className="ri-map-pin-line"></i> Chọn từ địa chỉ đã
                        lưu
                      </label>
                      <select
                        className="form-input"
                        value={selectedAddressId}
                        onChange={(e) => {
                          const selectedValue = e.target.value;
                          if (selectedValue) {
                            const idString = selectedValue.toString();

                            // Loại bỏ ID bắt đầu bằng "0-"
                            if (idString.startsWith("0-")) {
                              console.error(
                                "❌ Rejected temporary ID from dropdown (starts with 0-):",
                                selectedValue
                              );
                              setSelectedAddressId("");
                              alert("Địa chỉ không hợp lệ. Vui lòng chọn lại.");
                              return;
                            }

                            // Validate: chỉ chấp nhận số nguyên hợp lệ, không bắt đầu bằng 0
                            const cleanId = idString.replace(/[^0-9]/g, "");

                            // Loại bỏ ID bắt đầu bằng 0
                            if (cleanId.length > 1 && cleanId.startsWith("0")) {
                              console.error(
                                "❌ Rejected ID starting with 0 from dropdown:",
                                selectedValue,
                                "cleaned:",
                                cleanId
                              );
                              setSelectedAddressId("");
                              alert("Địa chỉ không hợp lệ. Vui lòng chọn lại.");
                              return;
                            }

                            const parsedId = parseInt(cleanId);
                            if (
                              !isNaN(parsedId) &&
                              parsedId > 0 &&
                              !parsedId.toString().startsWith("0")
                            ) {
                              handleSelectAddress(parsedId.toString());
                            } else {
                              console.error(
                                "❌ Invalid address ID selected:",
                                selectedValue
                              );
                              setSelectedAddressId("");
                              alert("Địa chỉ không hợp lệ. Vui lòng chọn lại.");
                            }
                          } else {
                            setSelectedAddressId("");
                          }
                        }}
                      >
                        <option value="">
                          -- Chọn địa chỉ để điền Tỉnh/Quận/Phường --
                        </option>
                        {savedAddresses
                          .filter((addr) => {
                            // Chỉ hiển thị addresses có ID là số nguyên hợp lệ
                            const addrId = parseInt(addr.id);
                            return !isNaN(addrId) && addrId > 0;
                          })
                          .map((addr) => {
                            const addrId = parseInt(addr.id);
                            return (
                              <option key={addrId} value={addrId}>
                                {addr.full_name} - {addr.province},{" "}
                                {addr.district}, {addr.ward}
                                {addr.is_default ? " (Mặc định)" : ""}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Tỉnh/Thành phố *</label>
                      <select
                        className="form-input"
                        value={shippingInfo.province}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        required
                      >
                        <option value="">-- Chọn Tỉnh/Thành phố --</option>
                        {availableProvinces.map((province) => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Quận/Huyện *</label>
                      <select
                        className="form-input"
                        value={shippingInfo.district}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        disabled={
                          !shippingInfo.province ||
                          availableDistricts.length === 0
                        }
                        required
                      >
                        <option value="">
                          {!shippingInfo.province
                            ? "-- Chọn Tỉnh/Thành phố trước --"
                            : "-- Chọn Quận/Huyện --"}
                        </option>
                        {availableDistricts.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Phường/Xã *</label>
                    <select
                      className="form-input"
                      value={shippingInfo.ward}
                      onChange={(e) => handleWardChange(e.target.value)}
                      disabled={
                        !shippingInfo.district || availableWards.length === 0
                      }
                      required
                    >
                      <option value="">
                        {!shippingInfo.district
                          ? "-- Chọn Quận/Huyện trước --"
                          : "-- Chọn Phường/Xã --"}
                      </option>
                      {availableWards.map((ward) => (
                        <option key={ward} value={ward}>
                          {ward}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ chi tiết *</label>
                    <textarea
                      className="form-textarea"
                      value={shippingInfo.street_address}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          street_address: e.target.value,
                        })
                      }
                      placeholder="Số nhà, tên đường..."
                      rows="2"
                      required
                    />
                  </div>
                  <button
                    className="btn btn--ghost btn--block"
                    onClick={async () => {
                      // Validate before saving address
                      const nameErr = validateFullName(shippingInfo.full_name);
                      const phoneErr = validatePhone(shippingInfo.phone);
                      setShippingErrors({
                        full_name: nameErr,
                        phone: phoneErr,
                      });
                      if (nameErr || phoneErr) {
                        alert(
                          "Vui lòng sửa lỗi thông tin giao hàng trước khi lưu."
                        );
                        return;
                      }

                      // Lưu địa chỉ trước khi thanh toán
                      const token = localStorage.getItem("auth_token");
                      if (!token) return;

                      try {
                        const response = await fetch(
                          "http://localhost:3000/api/auth/addresses",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              ...shippingInfo,
                              is_default: true,
                            }),
                          }
                        );

                        if (response.ok) {
                          alert("Đã lưu thông tin giao hàng!");
                        }
                      } catch (err) {
                        console.error("Error saving address:", err);
                      }
                    }}
                  >
                    <i className="ri-save-line"></i> Lưu thông tin giao hàng
                  </button>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="cart-coupon-section">
                <h4>
                  <i className="ri-coupon-line"></i> Mã giảm giá
                </h4>
                {appliedCoupon ? (
                  <div className="coupon-applied">
                    <div className="coupon-applied-info">
                      <span className="coupon-code-badge">
                        {appliedCoupon.code}
                      </span>
                      <span className="coupon-discount">
                        -{formatPrice(appliedCoupon.discount_amount)}
                      </span>
                    </div>
                    <button
                      className="btn-remove-coupon"
                      onClick={handleRemoveCoupon}
                      title="Xóa mã"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                ) : (
                  <div className="coupon-input-group">
                    <input
                      type="text"
                      placeholder="Nhập mã giảm giá"
                      className="coupon-input"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleApplyCoupon();
                        }
                      }}
                    />
                    <button
                      className="btn-apply-coupon"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                    >
                      {applyingCoupon ? (
                        <i className="ri-loader-4-line"></i>
                      ) : (
                        "Áp dụng"
                      )}
                    </button>
                  </div>
                )}
                {couponError && (
                  <div className="coupon-error">{couponError}</div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="cart-payment-section">
                <h4>
                  <i className="ri-bank-card-line"></i> Phương thức thanh toán
                </h4>
                <div className="payment-methods-list">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`payment-method-item ${
                        paymentMethod === method.id ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-method-content">
                        <div className="payment-method-header">
                          <span className="payment-icon">{method.icon}</span>
                          <span className="payment-name">{method.name}</span>
                        </div>
                        <span className="payment-description">
                          {method.description}
                        </span>
                      </div>
                      <div className="payment-radio-indicator"></div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="cart-summary-box-modern">
                <h3>Tóm tắt đơn hàng</h3>

                <div className="summary-row">
                  <span>Tạm tính ({cartItems.length} sản phẩm):</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="summary-row">
                  <span>Phí vận chuyển:</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="free-shipping-badge">
                        <i className="ri-truck-line"></i> Miễn phí
                      </span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="summary-row discount-row">
                    <span>
                      <i className="ri-coupon-line"></i> Giảm giá (
                      {appliedCoupon.code}):
                    </span>
                    <span className="discount-amount">
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}

                {subtotal < 300000 && (
                  <div className="shipping-notice-modern">
                    <i className="ri-information-line"></i>
                    Mua thêm {formatPrice(300000 - subtotal)} để được miễn phí
                    ship!
                  </div>
                )}

                <div className="summary-row total-row">
                  <span>Tổng cộng:</span>
                  <span className="total-price-modern">
                    {formatPrice(total)}
                  </span>
                </div>

                <button
                  className="btn btn--block btn-checkout-modern"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? (
                    <>
                      <i className="ri-loader-4-line"></i> Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="ri-shopping-cart-2-line"></i> Thanh toán
                    </>
                  )}
                </button>

                <Link
                  to="/ban-chay"
                  className="btn btn--ghost btn--block continue-shopping"
                >
                  <i className="ri-arrow-left-line"></i> Tiếp tục mua sắm
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
