import { query } from "../config/database.js";

/**
 * Lấy danh sách sản phẩm với filter, sort, pagination
 */
export async function getProducts(filters = {}) {
  const {
    search = "",
    category = null,
    brand = null,
    form = null, // Dạng bào chế - sẽ map từ short_description hoặc tạo field mới
    sort = "pho-bien", // pho-bien, gia-tang, gia-giam, giam-gia
    page = 1,
    limit = 10,
  } = filters;

  let sql = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.description,
      p.short_description,
      p.brand,
      p.sku,
      p.price,
      p.old_price,
      p.sale_percent,
      p.rating,
      p.sold_count,
      p.image,
      p.cover_image,
      p.status,
      c.name AS category_name,
      c.slug AS category_slug,
      (SELECT image_url FROM product_images 
       WHERE product_id = p.id AND is_primary = TRUE 
       LIMIT 1) AS primary_image
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'active'
  `;

  const params = [];

  // Filter by search
  if (search) {
    sql += ` AND (
      p.name LIKE ? OR 
      p.description LIKE ? OR 
      p.short_description LIKE ? OR
      p.brand LIKE ?
    )`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  // Filter by category (using category name for Thuoc page)
  if (category && category !== "Tất cả") {
    sql += ` AND c.name = ?`;
    params.push(category);
  }

  // Filter by brand
  if (brand && brand !== "Tất cả") {
    sql += ` AND p.brand = ?`;
    params.push(brand);
  }

  // Filter by form (dạng bào chế) - tạm thời dùng short_description hoặc có thể thêm field riêng
  // Nếu có field form trong DB thì dùng, không thì dùng short_description
  if (form && form !== "Tất cả") {
    sql += ` AND (p.short_description LIKE ? OR p.description LIKE ?)`;
    const formTerm = `%${form}%`;
    params.push(formTerm, formTerm);
  }

  // Sort
  switch (sort) {
    case "gia-tang":
      sql += ` ORDER BY p.price ASC`;
      break;
    case "gia-giam":
      sql += ` ORDER BY p.price DESC`;
      break;
    case "giam-gia":
      sql += ` ORDER BY p.sale_percent DESC, p.price ASC`;
      break;
    case "pho-bien":
    default:
      sql += ` ORDER BY p.sold_count DESC, p.rating DESC`;
      break;
  }

  // Pagination - MySQL yêu cầu LIMIT và OFFSET phải là số nguyên
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const offsetNum = (pageNum - 1) * limitNum;
  
  sql += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;
  // Không push vào params vì đã dùng string interpolation

  console.log("🔍 Executing SQL:", sql.substring(0, 200) + "...");
  console.log("🔍 Params:", params);
  console.log("🔍 Pagination:", { page: pageNum, limit: limitNum, offset: offsetNum });
  
  const products = await query(sql, params);
  console.log("✅ Products found:", products.length);

  // Get total count for pagination
  let countSql = `
    SELECT COUNT(*) as total
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'active'
  `;
  const countParams = [];

  if (search) {
    countSql += ` AND (
      p.name LIKE ? OR 
      p.description LIKE ? OR 
      p.short_description LIKE ? OR
      p.brand LIKE ?
    )`;
    const searchTerm = `%${search}%`;
    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (category && category !== "Tất cả") {
    countSql += ` AND c.name = ?`;
    countParams.push(category);
  }

  if (brand && brand !== "Tất cả") {
    countSql += ` AND p.brand = ?`;
    countParams.push(brand);
  }

  if (form && form !== "Tất cả") {
    countSql += ` AND (p.short_description LIKE ? OR p.description LIKE ?)`;
    const formTerm = `%${form}%`;
    countParams.push(formTerm, formTerm);
  }

  const countResult = await query(countSql, countParams);
  const total = countResult[0]?.total ? parseInt(countResult[0].total) : 0;

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Lấy sản phẩm theo ID
 */
export async function getProductById(id) {
  const sql = `
    SELECT 
      p.*,
      c.name AS category_name,
      c.slug AS category_slug,
      (SELECT image_url FROM product_images 
       WHERE product_id = p.id AND is_primary = TRUE 
       LIMIT 1) AS primary_image
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? AND p.status = 'active'
  `;
  const results = await query(sql, [id]);
  return results[0] || null;
}

/**
 * Lấy tất cả hình ảnh của sản phẩm
 */
export async function getProductImages(productId) {
  const sql = `
    SELECT 
      id,
      image_url,
      alt_text,
      sort_order,
      is_primary
    FROM product_images
    WHERE product_id = ?
    ORDER BY is_primary DESC, sort_order ASC, id ASC
  `;
  return await query(sql, [productId]);
}

/**
 * Lấy danh sách categories (nhóm công dụng)
 */
export async function getCategories() {
  const sql = `
    SELECT DISTINCT c.name, c.slug
    FROM categories c
    INNER JOIN products p ON c.id = p.category_id
    WHERE p.status = 'active'
    ORDER BY c.name
  `;
  return await query(sql);
}

/**
 * Lấy danh sách categories đầy đủ cho trang home
 */
export async function getCategoriesForHome() {
  const sql = `
    SELECT 
      c.id,
      c.name,
      c.slug,
      c.description,
      c.sort_order as sortOrder,
      COUNT(DISTINCT p.id) as productCount
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
    WHERE c.status = 'active' AND c.parent_id IS NULL
    GROUP BY c.id, c.name, c.slug, c.description, c.sort_order
    ORDER BY c.sort_order ASC, c.name ASC
    LIMIT 10
  `;
  return await query(sql);
}

/**
 * Lấy danh sách brands (thương hiệu)
 */
export async function getBrands() {
  const sql = `
    SELECT DISTINCT brand
    FROM products
    WHERE status = 'active' AND brand IS NOT NULL AND brand != ''
    ORDER BY brand
  `;
  const results = await query(sql);
  return results.map((r) => r.brand);
}

/**
 * Lấy danh sách forms (dạng bào chế) - từ short_description hoặc description
 * Tạm thời extract từ dữ liệu có sẵn
 */
export async function getForms() {
  // Có thể tạo bảng riêng hoặc extract từ description
  // Tạm thời trả về danh sách cố định dựa trên dữ liệu mẫu
  const forms = [
    "Viên nén",
    "Viên sủi",
    "Gói bột",
    "Dung dịch",
    "Xịt mũi",
  ];
  return forms;
}

/**
 * Lấy sản phẩm liên quan (cùng category hoặc brand)
 */
export async function getRelatedProducts(productId, categoryId, brand, limit = 3) {
  let sql = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.price,
      p.old_price,
      p.sale_percent,
      p.rating,
      p.sold_count,
      p.image,
      p.cover_image,
      c.name AS category_name,
      (SELECT image_url FROM product_images 
       WHERE product_id = p.id AND is_primary = TRUE 
       LIMIT 1) AS primary_image
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'active' AND p.id != ?
  `;
  
  const params = [productId];
  
  // Ưu tiên cùng category hoặc brand
  if (categoryId) {
    sql += ` AND (p.category_id = ? OR p.brand = ?)`;
    params.push(categoryId, brand || '');
  } else if (brand) {
    sql += ` AND p.brand = ?`;
    params.push(brand);
  }
  
  const limitNum = parseInt(limit) || 3;
  
  // Sử dụng subquery để tránh SQL injection
  sql += ` ORDER BY 
    CASE WHEN p.category_id = ? THEN 1 ELSE 2 END,
    CASE WHEN p.brand = ? THEN 1 ELSE 2 END,
    p.sold_count DESC
    LIMIT ${limitNum}`;
  
  params.push(categoryId || 0, brand || '');
  const products = await query(sql, params);
  
  // Nếu chưa đủ, lấy thêm sản phẩm bất kỳ
  if (products.length < limitNum) {
    const additionalLimit = limitNum - products.length;
    const excludeIds = [productId, ...products.map(p => p.id)];
    const placeholders = excludeIds.map(() => '?').join(',');
    
    const additionalSql = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.price,
        p.old_price,
        p.sale_percent,
        p.rating,
        p.sold_count,
        p.image,
        p.cover_image,
        c.name AS category_name,
        (SELECT image_url FROM product_images 
         WHERE product_id = p.id AND is_primary = TRUE 
         LIMIT 1) AS primary_image
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active' 
        AND p.id NOT IN (${placeholders})
      ORDER BY p.sold_count DESC
      LIMIT ${additionalLimit}
    `;
    const additional = await query(additionalSql, excludeIds);
    products.push(...additional);
  }
  
  return products.slice(0, limitNum);
}

/**
 * Lấy sản phẩm nổi bật (featured)
 */
export async function getFeaturedProducts(limit = 8) {
  const limitNum = parseInt(limit) || 8;
  const sql = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.description,
      p.short_description,
      p.brand,
      p.sku,
      p.price,
      p.old_price,
      p.sale_percent,
      p.rating,
      p.sold_count,
      p.image,
      p.cover_image,
      p.status,
      c.name AS category_name,
      c.slug AS category_slug,
      (SELECT image_url FROM product_images 
       WHERE product_id = p.id AND is_primary = TRUE 
       LIMIT 1) AS primary_image
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'active' AND (p.is_featured = TRUE OR p.sold_count > 500)
    ORDER BY p.is_featured DESC, p.sold_count DESC, p.rating DESC
    LIMIT ${limitNum}
  `;
  return await query(sql);
}

/**
 * Lấy sản phẩm mới (new products)
 */
export async function getNewProducts(limit = 8) {
  const limitNum = parseInt(limit) || 8;
  const sql = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.description,
      p.short_description,
      p.brand,
      p.sku,
      p.price,
      p.old_price,
      p.sale_percent,
      p.rating,
      p.sold_count,
      p.image,
      p.cover_image,
      p.status,
      p.created_at,
      c.name AS category_name,
      c.slug AS category_slug,
      (SELECT image_url FROM product_images 
       WHERE product_id = p.id AND is_primary = TRUE 
       LIMIT 1) AS primary_image
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'active' AND (p.is_new = TRUE OR p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY))
    ORDER BY p.is_new DESC, p.created_at DESC
    LIMIT ${limitNum}
  `;
  return await query(sql);
}

/**
 * Lấy sản phẩm bán chạy (bestseller)
 */
export async function getBestsellerProducts(limit = 8) {
  const limitNum = parseInt(limit) || 8;
  const sql = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.description,
      p.short_description,
      p.brand,
      p.sku,
      p.price,
      p.old_price,
      p.sale_percent,
      p.rating,
      p.sold_count,
      p.image,
      p.cover_image,
      p.status,
      c.name AS category_name,
      c.slug AS category_slug,
      (SELECT image_url FROM product_images 
       WHERE product_id = p.id AND is_primary = TRUE 
       LIMIT 1) AS primary_image
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'active' AND (p.is_bestseller = TRUE OR p.sold_count > 0)
    ORDER BY p.is_bestseller DESC, p.sold_count DESC, p.rating DESC
    LIMIT ${limitNum}
  `;
  return await query(sql);
}

/**
 * Lấy sản phẩm khuyến mãi (có sale_percent hoặc old_price)
 */
export async function getSaleProducts(limit = 12) {
  const limitNum = parseInt(limit) || 12;
  const sql = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.description,
      p.short_description,
      p.brand,
      p.sku,
      p.price,
      p.old_price,
      p.sale_percent,
      p.rating,
      p.sold_count,
      p.image,
      p.cover_image,
      p.status,
      c.name AS category_name,
      c.slug AS category_slug,
      (SELECT image_url FROM product_images 
       WHERE product_id = p.id AND is_primary = TRUE 
       LIMIT 1) AS primary_image
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'active' 
      AND (p.sale_percent > 0 OR (p.old_price IS NOT NULL AND p.old_price > p.price))
    ORDER BY p.sale_percent DESC, (p.old_price - p.price) DESC, p.sold_count DESC
    LIMIT ${limitNum}
  `;
  return await query(sql);
}

