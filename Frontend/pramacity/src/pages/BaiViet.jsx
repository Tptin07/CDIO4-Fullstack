// src/pages/BaiViet.jsx
import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Frame from "../components/Frame";
import { getAllPosts, getPopularPosts } from "../services/posts";
import "../assets/css/bai-viet.css";

const INITIAL_DISPLAY_COUNT = 9;
const LOAD_MORE_COUNT = 9;

const CATEGORIES = [
  "Tất cả",
  "Dinh dưỡng",
  "Bệnh lý",
  "Thuốc",
  "Mẹo sống khỏe",
  "Tin tức",
];

export default function BaiViet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [cat, setCat] = useState(searchParams.get("cat") || "Tất cả");
  const [tag, setTag] = useState(searchParams.get("tag") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const [loading, setLoading] = useState(true);
  const [allPosts, setAllPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [total, setTotal] = useState(0);

  // Fetch posts when filters change - load many posts at once
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // Load many posts at once (200 should be enough for most cases)
        const result = await getAllPosts({
          q,
          cat,
          tag,
          sort,
          page: 1,
          limit: 200,
        });
        setAllPosts(result.posts || []);
        setTotal(result.pagination?.total || 0);
        // Reset display count when filters change
        setDisplayCount(INITIAL_DISPLAY_COUNT);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setAllPosts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [q, cat, tag, sort]);

  // Fetch popular posts for sidebar
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const result = await getPopularPosts(6);
        setPopularPosts(result);
      } catch (error) {
        console.error("Error fetching popular posts:", error);
        setPopularPosts([]);
      }
    };

    fetchPopular();
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat !== "Tất cả") params.set("cat", cat);
    if (tag) params.set("tag", tag);
    if (sort !== "newest") params.set("sort", sort);
    setSearchParams(params, { replace: true });
  }, [q, cat, tag, sort, setSearchParams]);

  // Check if tag param exists in URL
  useEffect(() => {
    const tagParam = searchParams.get("tag");
    if (tagParam && tagParam !== tag) {
      setTag(tagParam);
      setQ(tagParam); // Also set search query to tag
    }
  }, [searchParams, tag]);

  // Display only the first displayCount posts
  const displayedPosts = useMemo(() => {
    return allPosts.slice(0, displayCount);
  }, [allPosts, displayCount]);

  const hasMore = allPosts.length > displayCount;

  const handleShowMore = () => {
    setDisplayCount((prev) => Math.min(prev + LOAD_MORE_COUNT, allPosts.length));
  };

  const updateQ = (v) => {
    setQ(v);
    setDisplayCount(INITIAL_DISPLAY_COUNT);
  };
  const updateSort = (v) => {
    setSort(v);
    setDisplayCount(INITIAL_DISPLAY_COUNT);
  };

  return (
    <main className="lc blog blog-page">
      {/* Hero Header Section */}
      <div className="blog-hero">
        <div className="container">
          <div className="blog-hero__content">
            <h1 className="blog-hero__title">
              <span className="blog-hero__title-icon">📚</span>
              Kiến Thức Sức Khỏe
            </h1>
            <p className="blog-hero__subtitle">
              Khám phá những bài viết hữu ích về dinh dưỡng, bệnh lý, thuốc và
              mẹo sống khỏe từ các chuyên gia
            </p>
          </div>
        </div>
      </div>

      <div className="container blog__wrap">
        {/* Sidebar */}
        <aside className="blog__side">
          <Frame title="🔥 Bài nổi bật">
            <ul className="hotlist">
              {popularPosts.length > 0 ? (
                popularPosts.map((p, idx) => (
                  <li key={p.id} style={{ animationDelay: `${idx * 0.1}s` }}>
                    <Link to={`/bai-viet/${p.id}`}>
                      <span className="dot" />
                      <span className="hotlist__title">{p.title}</span>
                    </Link>
                    <em>
                      <i className="ri-eye-line"></i>
                      {(p.views || 0).toLocaleString()} lượt xem
                    </em>
                  </li>
                ))
              ) : (
                <li className="muted">Đang tải...</li>
              )}
            </ul>
          </Frame>
        </aside>

        {/* Main Content */}
        <section className="blog__main">
          {/* Search Bar */}
          <div className="blog-search">
            <div className="blog-search__box">
              <i className="ri-search-line"></i>
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={q}
                onChange={(e) => updateQ(e.target.value)}
              />
              {q && (
                <button
                  className="blog-search__clear"
                  onClick={() => updateQ("")}
                  title="Xóa tìm kiếm"
                >
                  <i className="ri-close-line"></i>
                </button>
              )}
            </div>
          </div>

          {/* Toolbar with Filters */}
          <div className="blog__toolbar">
            <div className="blog__toolbar-info">
              <span className="blog__toolbar-count">
                <i className="ri-file-list-3-line"></i>
                {total.toLocaleString()} kết quả
              </span>
              {q && (
                <span className="blog__toolbar-query">
                  cho "<strong>{q}</strong>"
                </span>
              )}
              {cat !== "Tất cả" && (
                <span className="blog__toolbar-category">
                  <i className="ri-folder-line"></i>
                  {cat}
                </span>
              )}
            </div>
            <div className="blog__actions">
              <div className="blog__filter-group">
                <label className="blog__filter-label">
                  <i className="ri-folder-line"></i>
                  Danh mục:
                </label>
                <select
                  value={cat}
                  onChange={(e) => {
                    setCat(e.target.value);
                    setDisplayCount(INITIAL_DISPLAY_COUNT);
                  }}
                  className="blog__category-select"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="blog__filter-group">
                <label className="blog__filter-label">
                  <i className="ri-sort-desc"></i>
                  Sắp xếp:
                </label>
                <select
                  value={sort}
                  onChange={(e) => updateSort(e.target.value)}
                  className="blog__sort-select"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="popular">Phổ biến</option>
                </select>
              </div>
            </div>
          </div>

          {/* Posts Grid */}
          <div className={"blog__masonry" + (loading ? " loading" : "")}>
            {(loading ? Array.from({ length: 6 }) : displayedPosts).map(
              (p, i) =>
                loading ? (
                  <div key={i} className="post post--sk">
                    <div className="sk sk-img" />
                    <div className="sk sk-line" />
                    <div className="sk sk-line w-70" />
                    <div className="sk sk-meta" />
                  </div>
                ) : (
                  <article className="post" key={p.id}>
                    <div className="post__media">
                      <img
                        src={p.cover}
                        alt={p.title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/img/placeholder.jpg";
                        }}
                      />
                      <span
                        className={"badge badge--cat " + toCatClass(p.cat)}
                      >
                        {p.cat}
                      </span>
                    </div>
                    <div className="post__body">
                      <h3 className="post__title">
                        <Link to={`/bai-viet/${p.id}`}>{p.title}</Link>
                      </h3>
                      <p className="post__excerpt">{p.excerpt}</p>
                      <div className="post__meta">
                        <div className="post__meta-item">
                          <i className="ri-calendar-line"></i>
                          {fmtDate(p.date)}
                        </div>
                        <div className="post__meta-item">
                          <i className="ri-time-line"></i>
                          {p.readMin} phút đọc
                        </div>
                        <div className="post__meta-item">
                          <i className="ri-user-line"></i>
                          {p.author}
                        </div>
                      </div>
                      <div className="post__tags">
                        {(p.tags || []).map((t) => (
                          <button
                            key={t}
                            className="tag"
                            onClick={() => updateQ(t)}
                            title={"Tìm theo: " + t}
                          >
                            <i className="ri-hashtag"></i>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </article>
                )
            )}
          </div>

          {/* Load More Button */}
          {!loading && hasMore && (
            <div className="show-more-products">
              <button
                className="btn-show-more-products"
                onClick={handleShowMore}
              >
                Xem thêm bài viết
                <i className="ri-arrow-down-s-line"></i>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && displayedPosts.length === 0 && (
            <div className="blog-empty">
              <div className="blog-empty__icon">📝</div>
              <h3 className="blog-empty__title">Không tìm thấy bài viết</h3>
              <p className="blog-empty__text">
                Thử thay đổi từ khóa tìm kiếm hoặc danh mục khác
              </p>
            </div>
          )}
        </section>
      </div>
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
