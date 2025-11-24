// src/data/posts.js
export const POSTS = [
  {
    id: "bv-6",
    title: "Cập nhật dịch cúm mùa: Những điều nên biết",
    cat: "Tin tức",
    cover: "/blog/news-flu.jpg",
    excerpt:
      "Tổng hợp tình hình cúm mùa và khuyến cáo phòng bệnh từ cơ quan y tế trong tuần qua.",
    date: "2025-01-09",
    readMin: 3,
    author: "Biên tập",
    views: 421,
    tags: ["Tin tức", "Cúm"],
    content: `
<p><b>Cúm mùa</b> đang có dấu hiệu tăng tại một số khu vực. Người dân nên chủ động tiêm vắc xin, đeo khẩu trang nơi đông người và vệ sinh tay thường xuyên.</p>
<ul>
  <li>Triệu chứng thường gặp: sốt, ho, đau họng, mệt mỏi.</li>
  <li>Khi nào cần khám: sốt cao kéo dài, khó thở, đau ngực, người có bệnh nền.</li>
</ul>
<p><i>Lưu ý:</i> Không tự ý dùng kháng sinh khi chưa có chỉ định bác sĩ.</p>
`,
  },
  {
    id: "bv-5",
    title: "Probiotic là gì? Lợi khuẩn có thật sự cần thiết?",
    cat: "Dinh dưỡng",
    cover: "/blog/probiotic.png",
    excerpt:
      "Probiotic hỗ trợ tiêu hóa, cân bằng hệ vi sinh. Khi nào nên dùng và chọn loại nào phù hợp?",
    date: "2025-01-08",
    readMin: 8,
    author: "DS. Bảo Trâm",
    views: 612,
    tags: ["Tiêu hóa", "Probiotic"],
    content: `
<p>Probiotic là các <b>vi khuẩn có lợi</b> giúp cân bằng hệ vi sinh đường ruột, hỗ trợ tiêu hóa và miễn dịch.</p>
<p><b>Cách dùng:</b> Nên dùng sau ăn, kiên trì ít nhất 2-4 tuần.</p>
`,
  },
  {
    id: "bv-3",
    title: "Paracetamol: Liều dùng an toàn cho người lớn",
    cat: "Thuốc",
    cover: "/blog/para.jpg",
    excerpt:
      "Paracetamol giảm đau, hạ sốt phổ biến. Lạm dụng có thể gây hại gan. Đây là liều an toàn bạn cần biết.",
    date: "2025-01-04",
    readMin: 6,
    author: "DS. Thanh Tâm",
    views: 1405,
    tags: ["Paracetamol", "Giảm đau"],
    content: `
<p>Liều dùng thông thường: <b>10–15 mg/kg/lần</b>, tối đa 60 mg/kg/ngày; người lớn tối đa <b>4g/ngày</b>.</p>
<p>Tránh phối hợp nhiều chế phẩm chứa paracetamol cùng lúc.</p>
`,
  },
  {
    id: "bv-1",
    title: "Vitamin C: Uống thế nào cho đúng?",
    cat: "Dinh dưỡng",
    cover: "/blog/vitc.png",
    excerpt:
      "Vitamin C giúp tăng đề kháng, nhưng liều dùng bao nhiêu mỗi ngày là phù hợp và có cần uống sau ăn?",
    date: "2025-01-02",
    readMin: 5,
    author: "DS. Lan Anh",
    views: 1203,
    tags: ["Vitamin", "Miễn dịch"],
    content: `
<p>Người trưởng thành nên bổ sung khoảng <b>65–90mg/ngày</b>, tối đa <b>2000mg/ngày</b>.</p>
<p>Nên dùng <i>sau ăn</i> để giảm kích ứng dạ dày.</p>
`,
  },
  {
    id: "bv-4",
    title: "5 mẹo ngủ ngon không cần thuốc",
    cat: "Mẹo sống khỏe",
    cover: "/blog/sleep.png",
    excerpt:
      "Giấc ngủ chất lượng giúp phục hồi cơ thể. Thử ngay 5 mẹo đơn giản này trong một tuần.",
    date: "2024-12-29",
    readMin: 4,
    author: "DS. Quang Huy",
    views: 1623,
    tags: ["Giấc ngủ", "Thói quen"],
    content: `
<ol>
  <li>Đi ngủ và thức dậy đúng giờ.</li>
  <li>Hạn chế màn hình 1 giờ trước khi ngủ.</li>
  <li>Vận động nhẹ nhàng ban ngày.</li>
</ol>
`,
  },
  {
    id: "bv-2",
    title: "Phân biệt cảm lạnh và cúm: Khi nào cần đi khám?",
    cat: "Bệnh lý",
    cover: "/blog/flu.png",
    excerpt:
      "Triệu chứng cảm lạnh và cúm khá giống nhau. Bài viết này giúp bạn nhận biết và xử trí ban đầu.",
    date: "2025-01-06",
    readMin: 7,
    author: "BS. Minh Đức",
    views: 987,
    tags: ["Cúm", "Sốt", "Hô hấp"],
    content: `
<p><b>Cảm lạnh</b> thường nhẹ hơn cúm và hiếm khi gây sốt cao. <b>Cúm</b> thường khởi phát đột ngột, đau nhức nhiều.</p>
`,
  },
];

export const getPostById = (id) => POSTS.find((p) => p.id === id);
export const getRelatedPosts = (post, n = 6) =>
  POSTS.filter(
    (p) =>
      p.id !== post.id &&
      (p.cat === post.cat || p.tags.some((t) => post.tags.includes(t)))
  ).slice(0, n);
