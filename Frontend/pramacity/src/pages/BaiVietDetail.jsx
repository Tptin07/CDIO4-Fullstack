// src/pages/BaiVietDetail.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Frame from "../components/Frame";
import { getPostById, getRelatedPosts } from "../services/posts";
import "../assets/css/blog-detail.css";

export default function BaiVietDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const postData = await getPostById(id);
        setPost(postData);
        
        if (postData) {
          // Fetch related posts
          const relatedData = await getRelatedPosts(postData, 8);
          setRelated(relatedData);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="lc container">
      </main>
    );
  }

  if (!post) {
    return (
      <main className="lc container">
      </main>
    );
  }

  return (
    <main className="lc blog-detail">
      <div className="container bd-wrap">
        {/* Nội dung chính */}
        <article className="bd-article">
          <div className="bd-cover">
            <img
              src={post.cover}
              alt={post.title}
              onError={(e) => {
                e.currentTarget.src = "/img/placeholder.jpg";
              }}
            />
            <span className={"badge badge--cat " + toCatClass(post.cat)}>
              {post.cat}
            </span>
          </div>

          <div
            className="bd-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="bd-tags">
            {(post.tags || []).map((t) => (
              <Link
                key={t}
                className="tag"
                to={`/bai-viet?tag=${encodeURIComponent(t)}`}
              >
                #{t}
              </Link>
            ))}
          </div>
        </article>

        {/* Khung phụ */}
        <aside className="bd-side">
          <Frame title="Tóm tắt">
            <p className="muted">{post.excerpt}</p>
            
            <div className="bd-meta">
              <span className="chip chip--soft">{fmtDate(post.date)}</span>
              <span className="chip chip--soft">{post.readMin} phút đọc</span>
              <span className="chip chip--soft">{post.author}</span>
              <span className="chip chip--soft">
                {(post.views || 0).toLocaleString()} lượt xem
              </span>
            </div>

            <ul className="bd-quick">
              <li>
                <i className="ri-check-line" /> Nội dung biên tập có kiểm duyệt
              </li>
              <li>
                <i className="ri-shield-check-line" /> Tham khảo ý kiến chuyên
                gia khi cần
              </li>
            </ul>
          </Frame>
        </aside>
      </div>

      {/* Liên quan */}
      {related.length > 0 && (
        <section className="bd-related container">
          <h3 className="bd-related__title">Bài viết liên quan</h3>
          <div className="bd-slider">
            {related.slice(0, 4).map((p) => (
              <article className="bd-card" key={p.id}>
                <Link to={`/bai-viet/${p.id}`} className="bd-card__media">
                  <img src={p.cover} alt={p.title} loading="lazy" />
                  <span className={"badge badge--cat " + toCatClass(p.cat)}>
                    {p.cat}
                  </span>
                </Link>
                <div className="bd-card__body">
                  <h4 className="bd-card__title">
                    <Link to={`/bai-viet/${p.id}`}>{p.title}</Link>
                  </h4>
                  <div className="bd-card__meta">
                    <span>{fmtDate(p.date)}</span>
                    <span>• {p.readMin}'</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function fmtDate(s) {
  return new Date(s).toLocaleDateString("vi-VN");
}
function toCatClass(c) {
  return (
    {
      "Dinh dưỡng": "is-green",
      "Bệnh lý": "is-red",
      Thuốc: "is-blue",
      "Mẹo sống khỏe": "is-purple",
      "Tin tức": "is-gray",
    }[c] || "is-blue"
  );
}
