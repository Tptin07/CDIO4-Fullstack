// src/services/products.js
import { NEW_PRODUCTS } from "../data/newProducts";

export const CART_KEY = "demo_cart";

// Thuoc products (from Thuoc.jsx) - normalized format
const THUOC_PRODUCTS = [
  {
    id: "t1",
    name: "Panadol Extra 500mg",
    img: "/thuoc/paradol.png",
    cover: "/thuoc/paradol.png",
    price: 39000,
    old: 55000,
    sale: "-29%",
    cat: "Đau – hạ sốt",
    brand: "Panadol",
    rating: 4.8,
    sold: 3200,
    desc: "Thuốc giảm đau, hạ sốt dạng viên nén. Dạng bào chế: Viên nén.",
  },
  {
    id: "t2",
    name: "Efferalgan 500mg (viên sủi)",
    img: "/thuoc/viensui.png",
    cover: "/thuoc/viensui.png",
    price: 45000,
    old: 59000,
    sale: "-24%",
    cat: "Đau – hạ sốt",
    brand: "Efferalgan",
    rating: 4.7,
    sold: 2100,
    desc: "Thuốc giảm đau, hạ sốt dạng viên sủi. Dạng bào chế: Viên sủi.",
  },
  {
    id: "t3",
    name: "Decolgen ND",
    img: "/thuoc/DecolgenND.png",
    cover: "/thuoc/DecolgenND.png",
    price: 29000,
    old: 36000,
    sale: "-19%",
    cat: "Cảm cúm (OTC)",
    brand: "Decolgen",
    rating: 4.6,
    sold: 1800,
    desc: "Thuốc trị cảm cúm không kê đơn. Dạng bào chế: Viên nén.",
  },
  {
    id: "t4",
    name: "Enterogermina 5 tỉ",
    img: "/thuoc/Enterogermina.png",
    cover: "/thuoc/Enterogermina.png",
    price: 92000,
    old: 120000,
    sale: "-23%",
    cat: "Tiêu hóa",
    brand: "Enterogermina",
    rating: 4.9,
    sold: 950,
    desc: "Men vi sinh hỗ trợ tiêu hóa. Dạng bào chế: Dung dịch.",
  },
  {
    id: "t5",
    name: "Vitamin C UPSA 1000mg sủi",
    img: "/thuoc/vitaminC.png",
    cover: "/thuoc/vitaminC.png",
    price: 69000,
    old: 99000,
    sale: "-30%",
    cat: "Vitamin/ khoáng",
    brand: "UPSA",
    rating: 4.8,
    sold: 4100,
    desc: "Bổ sung Vitamin C 1000mg dạng viên sủi. Dạng bào chế: Viên sủi.",
  },
  {
    id: "t6",
    name: "Xịt mũi nước biển sâu",
    img: "/thuoc/xitmui.png",
    cover: "/thuoc/xitmui.png",
    price: 59000,
    old: 79000,
    sale: "-25%",
    cat: "Cảm cúm (OTC)",
    brand: "—",
    rating: 4.5,
    sold: 760,
    desc: "Xịt mũi làm sạch, thông mũi. Dạng bào chế: Xịt mũi.",
  },
  {
    id: "t7",
    name: "Panadol Cold & Flu",
    img: "/thuoc/PanadolCold&Flu.png",
    cover: "/thuoc/PanadolCold&Flu.png",
    price: 52000,
    old: 68000,
    sale: "-24%",
    cat: "Cảm cúm (OTC)",
    brand: "Panadol",
    rating: 4.7,
    sold: 1320,
    desc: "Thuốc trị cảm cúm và cảm lạnh. Dạng bào chế: Viên nén.",
  },
  {
    id: "t8",
    name: "Probiotic hỗ trợ tiêu hoá",
    img: "/thuoc/Probiotic.png",
    cover: "/thuoc/Probiotic.png",
    price: 115000,
    old: 145000,
    sale: "-21%",
    cat: "Tiêu hóa",
    brand: "Enterogermina",
    rating: 4.9,
    sold: 640,
    desc: "Men vi sinh hỗ trợ tiêu hóa. Dạng bào chế: Gói bột.",
  },
  {
    id: "t9",
    name: "Vitamin tổng hợp cho người lớn",
    img: "/thuoc/Vitamintonghop.png",
    cover: "/thuoc/Vitamintonghop.png",
    price: 135000,
    old: 169000,
    sale: "-20%",
    cat: "Vitamin/ khoáng",
    brand: "UPSA",
    rating: 4.8,
    sold: 980,
    desc: "Bổ sung vitamin và khoáng chất cho người lớn. Dạng bào chế: Viên nén.",
  },
  {
    id: "t10",
    name: "Si rô ho thảo dược",
    img: "/thuoc/siro.png",
    cover: "/thuoc/siro.png",
    price: 72000,
    old: 89000,
    sale: "-19%",
    cat: "Cảm cúm (OTC)",
    brand: "—",
    rating: 4.6,
    sold: 530,
    desc: "Si rô ho thảo dược tự nhiên. Dạng bào chế: Dung dịch.",
  },
];

export const PRODUCTS = [
  {
    id: 1,
    name: "Khẩu trang 4D (10 cái)",
    img: "/img/mask.png", // thumb cũ (vẫn giữ)
    cover: "/banchay/khautrangmau.png", // ảnh banner lớn trong public/banchay
    price: 30000,
    old: 40000,
    sale: "-25%",
    cat: "Khẩu trang",
    brand: "MedPro",
    rating: 4.6,
    sold: 5100,
    desc: "Khẩu trang 4D lọc bụi mịn, thoáng khí, phù hợp da nhạy cảm.",
  },
  {
    id: 2,
    name: "Khẩu trang 4D (10 cái)",
    img: "/img/mask.png",
    cover: "/banchay/khautrangbth.png",
    price: 30000,
    old: 40000,
    sale: "-25%",
    cat: "Khẩu trang",
    brand: "MedPro",
    rating: 4.6,
    sold: 5100,
    desc: "Khẩu trang 4D lọc bụi mịn, thoáng khí, phù hợp da nhạy cảm.",
  },
  {
    id: 3,
    name: "Nhiệt kế điện tử",
    img: "/img/thermo.png",
    price: 120000,
    old: 150000,
    sale: "-20%",
    cat: "Thiết bị y tế",
    brand: "MedPro",
    rating: 4.7,
    sold: 2100,
    desc: "Nhiệt kế đo trán/miệng, cho kết quả nhanh và chính xác.",
  },
  {
    id: 4,
    name: "Kem chống nắng SPF50",
    img: "/img/sunscreen.png",
    price: 160000,
    old: null,
    sale: "NEW",
    cat: "Chăm sóc da",
    brand: "SunCare",
    rating: 4.5,
    sold: 980,
    desc: "Chống nắng quang phổ rộng, cấp ẩm nhẹ, không bết dính.",
  },
  {
    id: 5,
    name: "Vitamin D3 K2",
    img: "/img/vitc.png",
    cover: "/banchay/vitaminC-D3.png", // ảnh mới
    price: 89000,
    old: 109000,
    sale: "-18%",
    cat: "Vitamin",
    brand: "VitaPlus",
    rating: 4.9,
    sold: 1750,
    desc: "Bổ sung D3K2 hỗ trợ hấp thu canxi, khoẻ xương răng.",
  },
  {
    id: 6,
    name: "Khẩu trang y tế màu",
    img: "/img/mask.png",
    price: 35000,
    old: 45000,
    sale: "-22%",
    cat: "Khẩu trang",
    brand: "PharmaCity",
    rating: 4.4,
    sold: 2670,
    desc: "Khẩu trang y tế 3 lớp, nhiều màu, dễ thở cả ngày.",
  },
  {
    id: 7,
    name: "Máy đo huyết áp cổ tay",
    img: "/img/thermo.png",
    price: 549000,
    old: 599000,
    sale: "-8%",
    cat: "Thiết bị y tế",
    brand: "MedPro",
    rating: 4.3,
    sold: 620,
    desc: "Máy đo tự động, ghi nhớ kết quả, cảnh báo nhịp tim.",
  },
  {
    id: 8,
    name: "Gel rửa mặt dịu nhẹ",
    img: "/img/sunscreen.png",
    cover: "/banchay/suaruamat.png",
    price: 99000,
    old: 129000,
    sale: "-23%",
    cat: "Chăm sóc da",
    brand: "SunCare",
    rating: 4.6,
    sold: 1340,
    desc: "Làm sạch êm dịu, không khô căng, phù hợp da nhạy cảm.",
  },
  {
    id: 9,
    name: "Vitamin C 1000mg",
    img: "/img/vitc.png",
    price: 125000,
    old: 159000,
    sale: "-21%",
    cat: "Vitamin",
    brand: "VitaPlus",
    rating: 4.8,
    sold: 3200,
    desc: "Bổ sung Vitamin C tăng cường miễn dịch, chống oxy hóa.",
  },
  {
    id: 10,
    name: "Khẩu trang N95 (5 cái)",
    img: "/img/mask.png",
    price: 85000,
    old: 110000,
    sale: "-23%",
    cat: "Khẩu trang",
    brand: "MedPro",
    rating: 4.7,
    sold: 2800,
    desc: "Khẩu trang N95 lọc 95% bụi mịn, vi khuẩn, virus.",
  },
  {
    id: 11,
    name: "Serum Vitamin C 20%",
    img: "/img/sunscreen.png",
    price: 245000,
    old: 320000,
    sale: "-23%",
    cat: "Chăm sóc da",
    brand: "SunCare",
    rating: 4.9,
    sold: 1850,
    desc: "Serum Vitamin C nồng độ cao, làm sáng da, giảm thâm nám.",
  },
  {
    id: 12,
    name: "Máy đo SpO2 cầm tay",
    img: "/img/thermo.png",
    price: 189000,
    old: 229000,
    sale: "-17%",
    cat: "Thiết bị y tế",
    brand: "MedPro",
    rating: 4.6,
    sold: 1450,
    desc: "Đo nồng độ oxy trong máu và nhịp tim, kết quả nhanh.",
  },
  {
    id: 13,
    name: "Vitamin B Complex",
    img: "/img/vitc.png",
    price: 110000,
    old: 140000,
    sale: "-21%",
    cat: "Vitamin",
    brand: "VitaPlus",
    rating: 4.7,
    sold: 2100,
    desc: "Bổ sung vitamin nhóm B, hỗ trợ chuyển hóa năng lượng.",
  },
  {
    id: 14,
    name: "Khẩu trang vải kháng khuẩn (3 cái)",
    img: "/img/mask.png",
    price: 45000,
    old: 60000,
    sale: "-25%",
    cat: "Khẩu trang",
    brand: "PharmaCity",
    rating: 4.5,
    sold: 1950,
    desc: "Khẩu trang vải có thể giặt tái sử dụng, kháng khuẩn.",
  },
  {
    id: 15,
    name: "Kem dưỡng ẩm HA",
    img: "/img/sunscreen.png",
    price: 175000,
    old: 220000,
    sale: "-20%",
    cat: "Chăm sóc da",
    brand: "SunCare",
    rating: 4.8,
    sold: 1680,
    desc: "Kem dưỡng ẩm chứa Hyaluronic Acid, cấp ẩm sâu, không nhờn.",
  },
  {
    id: 16,
    name: "Máy xông mũi họng",
    img: "/img/thermo.png",
    price: 329000,
    old: 399000,
    sale: "-18%",
    cat: "Thiết bị y tế",
    brand: "MedPro",
    rating: 4.5,
    sold: 890,
    desc: "Máy xông khí dung điều trị viêm mũi họng, hen suyễn.",
  },
  {
    id: 17,
    name: "Omega-3 1000mg",
    img: "/img/vitc.png",
    price: 195000,
    old: 245000,
    sale: "-20%",
    cat: "Vitamin",
    brand: "VitaPlus",
    rating: 4.8,
    sold: 2250,
    desc: "Dầu cá Omega-3 hỗ trợ tim mạch, não bộ, mắt.",
  },
  {
    id: 18,
    name: "Khẩu trang y tế đen (50 cái)",
    img: "/img/mask.png",
    price: 120000,
    old: 150000,
    sale: "-20%",
    cat: "Khẩu trang",
    brand: "PharmaCity",
    rating: 4.6,
    sold: 3400,
    desc: "Khẩu trang y tế 3 lớp màu đen, gói 50 cái, giá tốt.",
  },
  {
    id: 19,
    name: "Toner cân bằng pH",
    img: "/img/sunscreen.png",
    price: 135000,
    old: 175000,
    sale: "-23%",
    cat: "Chăm sóc da",
    brand: "SunCare",
    rating: 4.7,
    sold: 1520,
    desc: "Toner cân bằng độ pH da, se khít lỗ chân lông.",
  },
  {
    id: 20,
    name: "Cân sức khỏe điện tử",
    img: "/img/thermo.png",
    price: 249000,
    old: 299000,
    sale: "-17%",
    cat: "Thiết bị y tế",
    brand: "MedPro",
    rating: 4.4,
    sold: 1100,
    desc: "Cân điện tử đo trọng lượng, mỡ, cơ, nước trong cơ thể.",
  },
  {
    id: 21,
    name: "Vitamin E 400IU",
    img: "/img/vitc.png",
    price: 95000,
    old: 125000,
    sale: "-24%",
    cat: "Vitamin",
    brand: "VitaPlus",
    rating: 4.6,
    sold: 1780,
    desc: "Vitamin E chống oxy hóa, đẹp da, tóc, móng.",
  },
  {
    id: 22,
    name: "Khẩu trang than hoạt tính (10 cái)",
    img: "/img/mask.png",
    price: 55000,
    old: 75000,
    sale: "-27%",
    cat: "Khẩu trang",
    brand: "MedPro",
    rating: 4.5,
    sold: 2100,
    desc: "Khẩu trang có lớp than hoạt tính lọc khí độc, bụi mịn.",
  },
  {
    id: 23,
    name: "Mặt nạ dưỡng ẩm",
    img: "/img/sunscreen.png",
    price: 89000,
    old: 119000,
    sale: "-25%",
    cat: "Chăm sóc da",
    brand: "SunCare",
    rating: 4.8,
    sold: 1920,
    desc: "Mặt nạ dưỡng ẩm tức thì, làm mềm mịn da sau 15 phút.",
  },
  {
    id: 24,
    name: "Máy massage cầm tay",
    img: "/img/thermo.png",
    price: 189000,
    old: 239000,
    sale: "-21%",
    cat: "Thiết bị y tế",
    brand: "MedPro",
    rating: 4.3,
    sold: 750,
    desc: "Máy massage giảm đau cơ, thư giãn, nhiều chế độ rung.",
  },
  {
    id: 25,
    name: "Kẽm + Vitamin C",
    img: "/img/vitc.png",
    price: 145000,
    old: 185000,
    sale: "-22%",
    cat: "Vitamin",
    brand: "VitaPlus",
    rating: 4.9,
    sold: 2650,
    desc: "Kết hợp Kẽm và Vitamin C tăng cường miễn dịch.",
  },
  {
    id: 26,
    name: "Khẩu trang trẻ em (20 cái)",
    img: "/img/mask.png",
    price: 65000,
    old: 85000,
    sale: "-24%",
    cat: "Khẩu trang",
    brand: "PharmaCity",
    rating: 4.6,
    sold: 1680,
    desc: "Khẩu trang dành cho trẻ em, nhiều màu sắc, dễ thở.",
  },
  {
    id: 27,
    name: "Sữa tắm dưỡng ẩm",
    img: "/img/sunscreen.png",
    price: 115000,
    old: 155000,
    sale: "-26%",
    cat: "Chăm sóc da",
    brand: "SunCare",
    rating: 4.7,
    sold: 1420,
    desc: "Sữa tắm dưỡng ẩm, không làm khô da, mùi hương dịu nhẹ.",
  },
  {
    id: 28,
    name: "Máy đo đường huyết",
    img: "/img/thermo.png",
    price: 425000,
    old: 520000,
    sale: "-18%",
    cat: "Thiết bị y tế",
    brand: "MedPro",
    rating: 4.6,
    sold: 580,
    desc: "Máy đo đường huyết tại nhà, kết quả trong 5 giây.",
  },
  {
    id: 29,
    name: "Canxi + D3",
    img: "/img/vitc.png",
    price: 165000,
    old: 210000,
    sale: "-21%",
    cat: "Vitamin",
    brand: "VitaPlus",
    rating: 4.8,
    sold: 1980,
    desc: "Bổ sung Canxi và Vitamin D3 cho xương chắc khỏe.",
  },
  {
    id: 30,
    name: "Khẩu trang KN95 (10 cái)",
    img: "/img/mask.png",
    price: 95000,
    old: 130000,
    sale: "-27%",
    cat: "Khẩu trang",
    brand: "MedPro",
    rating: 4.7,
    sold: 2400,
    desc: "Khẩu trang KN95 tiêu chuẩn cao, lọc bụi mịn hiệu quả.",
  },
];

// Promo products (from KhuyenMai.jsx)
const PROMO_PRODUCTS = [
  {
    id: "p1",
    name: "Serum Vitamin C 10%",
    img: "/khuyenmai/serumC.png",
    cover: "/khuyenmai/serumC.png",
    price: 159000,
    old: 259000,
    oldPrice: 259000,
    sale: "-39%",
    discount: 39,
    rating: 4.7,
    sold: 320,
    tag: "Chăm sóc da",
    cat: "Chăm sóc da",
    brand: "La Roche-Posay",
    desc: "Serum Vitamin C 10% giúp làm sáng da, giảm thâm nám, chống oxy hóa. Phù hợp cho da thường đến da dầu. Sử dụng buổi sáng sau bước làm sạch.",
  },
  {
    id: "p2",
    name: "Vitamin Tổng hợp A–Z (120v)",
    img: "/khuyenmai/vitaminA-Z.png",
    cover: "/khuyenmai/vitaminA-Z.png",
    price: 199000,
    old: 329000,
    oldPrice: 329000,
    sale: "-40%",
    discount: 40,
    rating: 4.8,
    sold: 812,
    tag: "Dinh dưỡng",
    cat: "Dinh dưỡng",
    brand: "Nature Made",
    desc: "Vitamin tổng hợp A-Z cung cấp đầy đủ các vitamin và khoáng chất thiết yếu cho cơ thể. Hỗ trợ tăng cường sức đề kháng, cải thiện sức khỏe tổng thể. Dùng 1 viên mỗi ngày sau bữa ăn.",
  },
  {
    id: "p3",
    name: "Nhiệt kế điện tử",
    img: "/khuyenmai/nhietketdientu.png",
    cover: "/khuyenmai/nhietketdientu.png",
    price: 49000,
    old: 129000,
    oldPrice: 129000,
    sale: "-62%",
    discount: 62,
    rating: 4.5,
    sold: 1060,
    tag: "Thiết bị y tế",
    cat: "Thiết bị y tế",
    brand: "SIKA",
    desc: "Nhiệt kế điện tử đo nhiệt độ nhanh chóng và chính xác trong 10 giây. Màn hình LCD dễ đọc, có cảnh báo sốt. An toàn cho trẻ em và người lớn.",
  },
  {
    id: "p4",
    name: "Viên kẽm 15mg (60v)",
    img: "/khuyenmai/kem.png",
    cover: "/khuyenmai/kem.png",
    price: 89000,
    old: 149000,
    oldPrice: 149000,
    sale: "-40%",
    discount: 40,
    rating: 4.6,
    sold: 540,
    tag: "Dinh dưỡng",
    cat: "Dinh dưỡng",
    brand: "OstroVit",
    desc: "Viên kẽm 15mg hỗ trợ tăng cường miễn dịch, cải thiện sức khỏe da và tóc. Phù hợp cho người thiếu kẽm, người hay ốm vặt. Uống 1 viên mỗi ngày.",
  },
  {
    id: "p5",
    name: "Sữa rửa mặt dịu nhẹ",
    img: "/khuyenmai/suaruamat.png",
    cover: "/khuyenmai/suaruamat.png",
    price: 119000,
    old: 189000,
    oldPrice: 189000,
    sale: "-37%",
    discount: 37,
    rating: 4.9,
    sold: 980,
    tag: "Chăm sóc da",
    cat: "Chăm sóc da",
    brand: "Cetaphil",
    desc: "Sữa rửa mặt dịu nhẹ không chứa xà phòng, phù hợp cho da nhạy cảm. Làm sạch sâu mà không gây khô da. Sử dụng sáng và tối.",
  },
  {
    id: "p6",
    name: "Máy đo huyết áp cổ tay",
    img: "/khuyenmai/maydohuyetapcotay.png",
    cover: "/khuyenmai/maydohuyetapcotay.png",
    price: 399000,
    old: 590000,
    oldPrice: 590000,
    sale: "-32%",
    discount: 32,
    rating: 4.4,
    sold: 265,
    tag: "Thiết bị y tế",
    cat: "Thiết bị y tế",
    brand: "OMRON",
    desc: "Máy đo huyết áp cổ tay tự động, dễ sử dụng. Màn hình LCD lớn, bộ nhớ lưu 60 kết quả. Phù hợp cho gia đình, người cao tuổi.",
  },
  {
    id: "p7",
    name: "Omega-3 Fish Oil 1000mg",
    img: "/khuyenmai/VitaminC.png",
    cover: "/khuyenmai/VitaminC.png",
    price: 210000,
    old: 280000,
    oldPrice: 280000,
    sale: "-25%",
    discount: 25,
    rating: 4.7,
    sold: 450,
    tag: "Dinh dưỡng",
    cat: "Dinh dưỡng",
    brand: "Nature's Bounty",
    desc: "Omega-3 Fish Oil 1000mg hỗ trợ sức khỏe tim mạch, não bộ và mắt. Chiết xuất từ cá biển sâu, không mùi tanh. Uống 1-2 viên mỗi ngày.",
  },
  {
    id: "p8",
    name: "Kem dưỡng ẩm ban đêm",
    img: "/khuyenmai/chamsoda.png",
    cover: "/khuyenmai/chamsoda.png",
    price: 185000,
    old: 245000,
    oldPrice: 245000,
    sale: "-24%",
    discount: 24,
    rating: 4.8,
    sold: 620,
    tag: "Chăm sóc da",
    cat: "Chăm sóc da",
    brand: "Neutrogena",
    desc: "Kem dưỡng ẩm ban đêm phục hồi và nuôi dưỡng da trong khi ngủ. Công thức không gây mụn, phù hợp mọi loại da. Thoa đều lên mặt trước khi ngủ.",
  },
  {
    id: "p9",
    name: "Máy đo đường huyết",
    img: "/khuyenmai/maydohuyetam.png",
    cover: "/khuyenmai/maydohuyetam.png",
    price: 450000,
    old: 650000,
    oldPrice: 650000,
    sale: "-31%",
    discount: 31,
    rating: 4.6,
    sold: 180,
    tag: "Thiết bị y tế",
    cat: "Thiết bị y tế",
    brand: "Accu-Chek",
    desc: "Máy đo đường huyết cá nhân, kết quả trong 5 giây. Màn hình lớn dễ đọc, lưu 500 kết quả. Kèm theo que thử và kim lấy máu.",
  },
  {
    id: "p10",
    name: "Collagen Peptide 5000mg",
    img: "/khuyenmai/vitaminA-Z.png",
    cover: "/khuyenmai/vitaminA-Z.png",
    price: 320000,
    old: 450000,
    oldPrice: 450000,
    sale: "-29%",
    discount: 29,
    rating: 4.9,
    sold: 890,
    tag: "Dinh dưỡng",
    cat: "Dinh dưỡng",
    brand: "Vital Proteins",
    desc: "Collagen Peptide 5000mg hỗ trợ làm đẹp da, tóc, móng. Giúp da đàn hồi, giảm nếp nhăn. Hòa tan trong nước, không mùi vị. Uống 1-2 muỗng mỗi ngày.",
  },
  {
    id: "p11",
    name: "Dầu gội dược liệu",
    img: "/khuyenmai/daugoi.png",
    cover: "/khuyenmai/daugoi.png",
    price: 95000,
    old: 135000,
    oldPrice: 135000,
    sale: "-30%",
    discount: 30,
    rating: 4.5,
    sold: 340,
    tag: "Chăm sóc da",
    cat: "Chăm sóc da",
    brand: "Herbal Essences",
    desc: "Dầu gội dược liệu thảo mộc tự nhiên, làm sạch và nuôi dưỡng tóc. Phù hợp cho tóc khô, xơ rối. Không chứa paraben, sulfate.",
  },
  {
    id: "p12",
    name: "Thuốc cảm cúm Panadol",
    img: "/khuyenmai/panadol.png",
    cover: "/khuyenmai/panadol.png",
    price: 35000,
    old: 50000,
    oldPrice: 50000,
    sale: "-30%",
    discount: 30,
    rating: 4.7,
    sold: 1520,
    tag: "Thuốc không kê đơn",
    cat: "Thuốc không kê đơn",
    brand: "Panadol",
    desc: "Thuốc cảm cúm Panadol giảm đau, hạ sốt, trị các triệu chứng cảm cúm. Dạng viên nén, dễ uống. Uống 1-2 viên mỗi 4-6 giờ khi cần.",
  },
];

// Merge all products from different sources
const ALL_PRODUCTS = [...PRODUCTS, ...NEW_PRODUCTS, ...THUOC_PRODUCTS, ...PROMO_PRODUCTS];

export const getProductById = (id) =>
  ALL_PRODUCTS.find((p) => String(p.id) === String(id));
export const getRelatedProducts = (p, limit = 3) => {
  if (!p) return [];

  // Ưu tiên cùng danh mục / thương hiệu
  let list = ALL_PRODUCTS.filter(
    (x) => x.id !== p.id && (x.cat === p.cat || x.brand === p.brand)
  );

  const seen = new Set(list.map((x) => x.id));

  // Nếu chưa đủ thì lấy thêm SP bất kỳ (khác chính nó) cho đủ limit
  if (list.length < limit) {
    for (const x of ALL_PRODUCTS) {
      if (x.id === p.id || seen.has(x.id)) continue;
      list.push(x);
      seen.add(x.id);
      if (list.length >= limit) break;
    }
  }

  return list.slice(0, limit);
};

export function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}
export function writeCart(c) {
  localStorage.setItem(CART_KEY, JSON.stringify(c));
}
export function cartTotalQty(c = readCart()) {
  return c.reduce((s, it) => s + (it.qty || 0), 0);
}
export async function dispatchCartUpdated() {
  try {
    // Lấy số lượng từ API nếu user đã đăng nhập
    const token = localStorage.getItem("auth_token");
    if (token) {
      const { getCartCount } = await import('./cart.js');
      const count = await getCartCount();
      document.dispatchEvent(new CustomEvent("CART_UPDATED", { detail: { qty: count.totalQuantity || 0 } }));
      return;
    }
  } catch (err) {
    // Nếu lỗi, fallback về localStorage
    console.error("Error getting cart count:", err);
  }
  
  // Fallback: lấy từ localStorage nếu chưa đăng nhập hoặc lỗi
  const qty = cartTotalQty();
  document.dispatchEvent(new CustomEvent("CART_UPDATED", { detail: { qty } }));
}
// Helper function to check if user is logged in
function checkUserLoggedIn() {
  try {
    const token = localStorage.getItem("auth_token");
    const user = localStorage.getItem("user_profile");
    return !!(token && user);
  } catch {
    return false;
  }
}

// Toast helper
function showToast(msg, type = "info") {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const t = document.createElement("div");
  t.className = `toast-item toast-item--${type}`;
  t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 250);
  }, 3000);
}

export async function addToCart(p, qty = 1) {
  // Kiểm tra user đã đăng nhập chưa
  if (!checkUserLoggedIn()) {
    showToast("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng", "warning");
    // Trigger event để mở modal đăng nhập
    document.dispatchEvent(new CustomEvent("OPEN_AUTH"));
    throw new Error("Chưa đăng nhập");
  }

  try {
    // Import động để tránh circular dependency
    const { addToCart: addToCartAPI } = await import('./cart.js');
    await addToCartAPI(p.id, qty);
    dispatchCartUpdated();
    showToast("Đã thêm sản phẩm vào giỏ hàng", "info");
  } catch (error) {
    showToast(error.message || "Lỗi khi thêm sản phẩm vào giỏ hàng", "error");
    throw error;
  }
}

// ===== PRODUCT MANAGEMENT (Admin) =====
const PRODUCTS_KEY = "demo_products";

function loadProducts() {
  try {
    const stored = JSON.parse(localStorage.getItem(PRODUCTS_KEY));
    if (stored && stored.length > 0) {
      return stored;
    }
    // Nếu chưa có trong localStorage, khởi tạo từ PRODUCTS array
    saveProducts(PRODUCTS);
    return PRODUCTS;
  } catch {
    // Nếu lỗi, khởi tạo từ PRODUCTS array
    saveProducts(PRODUCTS);
    return PRODUCTS;
  }
}

function saveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function getAllProducts() {
  return loadProducts();
}

export function getProductByIdAdmin(id) {
  const products = loadProducts();
  return products.find((p) => String(p.id) === String(id)) || null;
}

export function createProduct(productData) {
  const products = loadProducts();
  
  // Validate required fields
  if (!productData.name || !productData.price || !productData.cat) {
    throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Giá, Danh mục)");
  }

  // Tìm ID mới (max ID + 1)
  const maxId = products.reduce((max, p) => Math.max(max, p.id || 0), 0);
  const newId = maxId + 1;

  // Tính sale nếu có old price
  let sale = null;
  if (productData.old && productData.old > productData.price) {
    const discount = Math.round(((productData.old - productData.price) / productData.old) * 100);
    sale = `-${discount}%`;
  } else if (!productData.old && productData.sale) {
    sale = productData.sale;
  }

  const newProduct = {
    id: newId,
    name: productData.name.trim(),
    img: productData.img || "/img/placeholder.jpg",
    cover: productData.cover || null,
    price: Number(productData.price),
    old: productData.old ? Number(productData.old) : null,
    sale: sale || null,
    cat: productData.cat.trim(),
    brand: productData.brand?.trim() || "",
    rating: productData.rating || 0,
    sold: productData.sold || 0,
    desc: productData.desc?.trim() || "",
    createdAt: Date.now(),
  };
  
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id, updates) {
  const products = loadProducts();
  const idx = products.findIndex((p) => String(p.id) === String(id));
  
  if (idx === -1) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  // Validate required fields nếu đang cập nhật
  if (updates.name !== undefined && !updates.name.trim()) {
    throw new Error("Tên sản phẩm không được để trống");
  }
  if (updates.price !== undefined && (!updates.price || updates.price <= 0)) {
    throw new Error("Giá sản phẩm phải lớn hơn 0");
  }
  if (updates.cat !== undefined && !updates.cat.trim()) {
    throw new Error("Danh mục không được để trống");
  }

  // Tính sale nếu có old price
  let sale = updates.sale || products[idx].sale;
  if (updates.old !== undefined || updates.price !== undefined) {
    const oldPrice = updates.old !== undefined ? Number(updates.old) : products[idx].old;
    const newPrice = updates.price !== undefined ? Number(updates.price) : products[idx].price;
    
    if (oldPrice && oldPrice > newPrice) {
      const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
      sale = `-${discount}%`;
    } else if (!oldPrice) {
      sale = updates.sale || null;
    }
  }

  products[idx] = {
    ...products[idx],
    ...updates,
    name: updates.name !== undefined ? updates.name.trim() : products[idx].name,
    price: updates.price !== undefined ? Number(updates.price) : products[idx].price,
    old: updates.old !== undefined ? (updates.old ? Number(updates.old) : null) : products[idx].old,
    cat: updates.cat !== undefined ? updates.cat.trim() : products[idx].cat,
    brand: updates.brand !== undefined ? updates.brand.trim() : products[idx].brand,
    desc: updates.desc !== undefined ? updates.desc.trim() : products[idx].desc,
    sale: sale,
    updatedAt: Date.now(),
  };
  
  saveProducts(products);
  return products[idx];
}

export function deleteProduct(id) {
  const products = loadProducts();
  const filtered = products.filter((p) => String(p.id) !== String(id));
  
  if (filtered.length === products.length) {
    throw new Error("Không tìm thấy sản phẩm");
  }
  
  saveProducts(filtered);
  return true;
}

// Initialize products on first load
loadProducts();