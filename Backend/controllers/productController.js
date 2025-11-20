import * as productModel from "../models/productModel.js";

/**
 * GET /api/products
 * Lấy danh sách sản phẩm với filter, sort, pagination
 */
export async function getProducts(req, res) {
  try {
    const {
      q = "",
      cat = "Tất cả",
      brand = "Tất cả",
      form = "Tất cả",
      sort = "pho-bien",
      page = 1,
      limit = 6,
    } = req.query;

    console.log("📦 getProducts request:", { q, cat, brand, form, sort, page, limit });

    const filters = {
      search: q,
      category: cat,
      brand,
      form,
      sort,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 6,
    };

    const result = await productModel.getProducts(filters);
    console.log("✅ getProducts result:", { 
      productCount: result.products?.length || 0, 
      total: result.total 
    });

    // Transform data to match frontend format
    const products = result.products.map((p) => {
      // Ưu tiên: primary_image từ product_images > cover_image > image > placeholder
      const coverImage = p.primary_image || p.cover_image || p.image || "/img/placeholder.jpg";
      
      const extractedForm = extractForm(p.short_description || p.description);
      return {
        id: p.id,
        name: p.name,
        tag: p.category_name, // Nhóm công dụng
        cover: coverImage,
        img: coverImage, // Thêm img để tương thích với code cũ
        price: parseFloat(p.price),
        oldPrice: p.old_price ? parseFloat(p.old_price) : null,
        discount: p.sale_percent || (p.old_price && p.price ? 
          Math.round(((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100) : 0),
        rating: parseFloat(p.rating) || 0,
        sold: p.sold_count || 0,
        brand: p.brand || "—",
        form: extractedForm, // Extract form từ description, có thể là null
        sku: p.sku || null, // Mã sản phẩm
        description: p.description || p.short_description || "",
      };
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error in getProducts:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách sản phẩm",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

/**
 * GET /api/products/filters
 * Lấy danh sách filters (categories, brands, forms)
 */
export async function getFilters(req, res) {
  try {
    const [categories, brands, forms] = await Promise.all([
      productModel.getCategories(),
      productModel.getBrands(),
      productModel.getForms(),
    ]);

    res.json({
      success: true,
      data: {
        categories: categories.map((c) => c.name),
        brands,
        forms,
      },
    });
  } catch (error) {
    console.error("❌ Error in getFilters:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bộ lọc",
      error: error.message,
    });
  }
}

/**
 * GET /api/products/:id
 * Lấy chi tiết sản phẩm
 */
export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Lấy tất cả hình ảnh của sản phẩm
    const images = await productModel.getProductImages(id);
    
    // Ưu tiên: primary_image từ product_images > cover_image > image > placeholder
    const coverImage = product.primary_image || product.cover_image || product.image || "/img/placeholder.jpg";
    
    // Extract form từ description
    const extractedForm = extractForm(product.short_description || product.description);
    
    // Transform to frontend format
    const transformed = {
      id: product.id,
      name: product.name,
      tag: product.category_name,
      cat: product.category_name, // Thêm cat để tương thích
      category_id: product.category_id, // Thêm để dùng cho related products
      cover: coverImage,
      img: coverImage,
      images: images.map(img => ({
        url: img.image_url,
        alt: img.alt_text,
        isPrimary: img.is_primary
      })),
      price: parseFloat(product.price),
      oldPrice: product.old_price ? parseFloat(product.old_price) : null,
      old: product.old_price ? parseFloat(product.old_price) : null, // Thêm old để tương thích
      discount: product.sale_percent || (product.old_price && product.price ? 
        Math.round(((parseFloat(product.old_price) - parseFloat(product.price)) / parseFloat(product.old_price)) * 100) : 0),
      sale: product.sale_percent ? `-${product.sale_percent}%` : (product.old_price && product.price ? 
        `-${Math.round(((parseFloat(product.old_price) - parseFloat(product.price)) / parseFloat(product.old_price)) * 100)}%` : null), // Thêm sale để tương thích
      rating: parseFloat(product.rating) || 0,
      sold: product.sold_count || 0,
      brand: product.brand || "—",
      form: extractedForm, // Có thể là null nếu không tìm thấy
      sku: product.sku || null, // Mã sản phẩm
      description: product.description || product.short_description || "",
      desc: product.description || product.short_description || "", // Thêm desc để tương thích
      shortDescription: product.short_description || "",
    };

    res.json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    console.error("❌ Error in getProductById:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết sản phẩm",
      error: error.message,
    });
  }
}

/**
 * GET /api/products/:id/related
 * Lấy sản phẩm liên quan
 */
export async function getRelatedProducts(req, res) {
  try {
    const { id } = req.params;
    const { limit = 3 } = req.query;
    
    // Lấy thông tin sản phẩm hiện tại
    const product = await productModel.getProductById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }
    
    // Lấy sản phẩm liên quan
    const related = await productModel.getRelatedProducts(
      id,
      product.category_id,
      product.brand,
      parseInt(limit)
    );
    
    // Transform to frontend format
    const transformed = related.map((p) => {
      const coverImage = p.primary_image || p.cover_image || p.image || "/img/placeholder.jpg";
      return {
        id: p.id,
        name: p.name,
        tag: p.category_name,
        cat: p.category_name,
        cover: coverImage,
        img: coverImage,
        price: parseFloat(p.price),
        oldPrice: p.old_price ? parseFloat(p.old_price) : null,
        old: p.old_price ? parseFloat(p.old_price) : null,
        discount: p.sale_percent || (p.old_price && p.price ? 
          Math.round(((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100) : 0),
        sale: p.sale_percent ? `-${p.sale_percent}%` : (p.old_price && p.price ? 
          `-${Math.round(((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100)}%` : null),
        rating: parseFloat(p.rating) || 0,
        sold: p.sold_count || 0,
        brand: p.brand || "—",
      };
    });
    
    res.json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    console.error("❌ Error in getRelatedProducts:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy sản phẩm liên quan",
      error: error.message,
    });
  }
}

/**
 * GET /api/products/featured
 * Lấy sản phẩm nổi bật
 */
export async function getFeaturedProducts(req, res) {
  try {
    const { limit = 8 } = req.query;
    const products = await productModel.getFeaturedProducts(limit);
    
    const transformed = products.map((p) => {
      const coverImage = p.primary_image || p.cover_image || p.image || "/img/placeholder.jpg";
      const extractedForm = extractForm(p.short_description || p.description);
      
      return {
        id: p.id,
        name: p.name,
        tag: p.category_name,
        cat: p.category_name,
        cover: coverImage,
        img: coverImage,
        price: parseFloat(p.price),
        oldPrice: p.old_price ? parseFloat(p.old_price) : null,
        old: p.old_price ? parseFloat(p.old_price) : null,
        discount: p.sale_percent || (p.old_price && p.price ? 
          Math.round(((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100) : 0),
        sale: p.sale_percent ? `-${p.sale_percent}%` : (p.old_price && p.price ? 
          `-${Math.round(((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100)}%` : null),
        rating: parseFloat(p.rating) || 0,
        sold: p.sold_count || 0,
        brand: p.brand || "—",
        form: extractedForm,
        sku: p.sku || null,
        description: p.description || p.short_description || "",
        desc: p.description || p.short_description || "",
      };
    });

    res.json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    console.error("❌ Error in getFeaturedProducts:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy sản phẩm nổi bật",
      error: error.message,
    });
  }
}

/**
 * GET /api/products/new
 * Lấy sản phẩm mới
 */
export async function getNewProducts(req, res) {
  try {
    const { limit = 8 } = req.query;
    const products = await productModel.getNewProducts(limit);
    
    const transformed = products.map((p) => {
      const coverImage = p.primary_image || p.cover_image || p.image || "/img/placeholder.jpg";
      const extractedForm = extractForm(p.short_description || p.description);
      
      return {
        id: p.id,
        name: p.name,
        tag: p.category_name,
        cat: p.category_name,
        cover: coverImage,
        img: coverImage,
        price: parseFloat(p.price),
        oldPrice: p.old_price ? parseFloat(p.old_price) : null,
        old: p.old_price ? parseFloat(p.old_price) : null,
        discount: p.sale_percent || (p.old_price && p.price ? 
          Math.round(((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100) : 0),
        sale: p.sale_percent ? `-${p.sale_percent}%` : (p.old_price && p.price ? 
          `-${Math.round(((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100)}%` : null),
        rating: parseFloat(p.rating) || 0,
        sold: p.sold_count || 0,
        brand: p.brand || "—",
        form: extractedForm,
        sku: p.sku || null,
        description: p.description || p.short_description || "",
        desc: p.description || p.short_description || "",
        category: p.category_name,
      };
    });

    res.json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    console.error("❌ Error in getNewProducts:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy sản phẩm mới",
      error: error.message,
    });
  }
}

/**
 * GET /api/products/bestseller
 * Lấy sản phẩm bán chạy
 */
export async function getBestsellerProducts(req, res) {
  try {
    const { limit = 8 } = req.query;
    const products = await productModel.getBestsellerProducts(limit);
    
    const transformed = products.map((p) => {
      const coverImage = p.primary_image || p.cover_image || p.image || "/img/placeholder.jpg";
      const extractedForm = extractForm(p.short_description || p.description);
      
      return {
        id: p.id,
        name: p.name,
        tag: p.category_name,
        cat: p.category_name,
        cover: coverImage,
        img: coverImage,
        price: parseFloat(p.price),
        oldPrice: p.old_price ? parseFloat(p.old_price) : null,
        old: p.old_price ? parseFloat(p.old_price) : null,
        discount: p.sale_percent || (p.old_price && p.price ? 
          Math.round(((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100) : 0),
        sale: p.sale_percent ? `-${p.sale_percent}%` : (p.old_price && p.price ? 
          `-${Math.round(((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100)}%` : null),
        rating: parseFloat(p.rating) || 0,
        sold: p.sold_count || 0,
        brand: p.brand || "—",
        form: extractedForm,
        sku: p.sku || null,
        description: p.description || p.short_description || "",
        desc: p.description || p.short_description || "",
      };
    });

    res.json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    console.error("❌ Error in getBestsellerProducts:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy sản phẩm bán chạy",
      error: error.message,
    });
  }
}

/**
 * Helper function để extract form (dạng bào chế) từ description
 */
function extractForm(description) {
  if (!description) return null;

  const forms = [
    "Viên nén",
    "Viên sủi",
    "Gói bột",
    "Dung dịch",
    "Xịt mũi",
  ];

  for (const form of forms) {
    if (description.toLowerCase().includes(form.toLowerCase())) {
      return form;
    }
  }

  return null;
}

/**
 * GET /api/products/sale
 * Lấy sản phẩm khuyến mãi
 */
export async function getSaleProducts(req, res) {
  try {
    const { limit = 12 } = req.query;
    const products = await productModel.getSaleProducts(limit);
    
    const transformed = products.map((p) => {
      const coverImage = p.primary_image || p.cover_image || p.image || "/img/placeholder.jpg";
      const extractedForm = extractForm(p.short_description || p.description);
      
      return {
        id: p.id,
        name: p.name,
        tag: p.category_name,
        cat: p.category_name,
        cover: coverImage,
        img: coverImage,
        price: parseFloat(p.price),
        oldPrice: p.old_price ? parseFloat(p.old_price) : null,
        old: p.old_price ? parseFloat(p.old_price) : null,
        discount: p.sale_percent || (p.old_price && p.price ? 
          Math.round(((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100) : 0),
        sale: p.sale_percent ? `-${p.sale_percent}%` : (p.old_price && p.price ? 
          `-${Math.round(((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100)}%` : null),
        rating: parseFloat(p.rating) || 0,
        sold: p.sold_count || 0,
        brand: p.brand || "—",
        form: extractedForm,
        sku: p.sku || null,
        description: p.description || p.short_description || "",
        desc: p.description || p.short_description || "",
      };
    });

    res.json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    console.error("❌ Error in getSaleProducts:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy sản phẩm khuyến mãi",
      error: error.message,
    });
  }
}

/**
 * GET /api/products/categories
 * Lấy danh sách categories đầy đủ cho trang home
 */
export async function getCategoriesForHome(req, res) {
  try {
    const categories = await productModel.getCategoriesForHome();
    
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("❌ Error in getCategoriesForHome:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách danh mục",
      error: error.message,
    });
  }
}

