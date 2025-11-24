// src/services/categories.js
const CATEGORIES_KEY = "demo_categories";
const PRODUCTS_KEY = "demo_products";

function readCategories() {
  try {
    return JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [];
  } catch {
    return [];
  }
}

function writeCategories(categories) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function readProducts() {
  try {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
  } catch {
    // Fallback to imported PRODUCTS if available
    return [];
  }
}

// Initialize default categories if empty
export function initCategories() {
  const categories = readCategories();
  if (categories.length === 0) {
    const defaultCategories = [
      { id: 1, name: "Thuốc kê đơn", description: "Các loại thuốc cần kê đơn", status: "active", createdAt: Date.now() },
      { id: 2, name: "Thuốc không kê đơn", description: "Thuốc không cần kê đơn", status: "active", createdAt: Date.now() },
      { id: 3, name: "Thực phẩm chức năng", description: "Thực phẩm bổ sung dinh dưỡng", status: "active", createdAt: Date.now() },
      { id: 4, name: "Chăm sóc da", description: "Sản phẩm chăm sóc da mặt và cơ thể", status: "active", createdAt: Date.now() },
      { id: 5, name: "Khẩu trang", description: "Khẩu trang y tế và khẩu trang vải", status: "active", createdAt: Date.now() },
      { id: 6, name: "Thiết bị y tế", description: "Thiết bị đo lường và chăm sóc sức khỏe", status: "active", createdAt: Date.now() },
      { id: 7, name: "Vitamin", description: "Các loại vitamin và khoáng chất", status: "active", createdAt: Date.now() },
    ];
    writeCategories(defaultCategories);
    return defaultCategories;
  }
  return categories;
}

export function getAllCategories() {
  const categories = readCategories();
  if (categories.length === 0) {
    return initCategories();
  }
  return categories;
}

export function getCategoryById(id) {
  const categories = readCategories();
  return categories.find((c) => c.id === id) || null;
}

export function createCategory(categoryData) {
  const categories = readCategories();
  const existed = categories.some(
    (c) => c.name.toLowerCase() === categoryData.name.toLowerCase()
  );
  if (existed) throw new Error("Danh mục đã tồn tại");

  const newCategory = {
    id: Date.now(),
    name: categoryData.name.trim(),
    description: categoryData.description || "",
    status: categoryData.status || "active",
    createdAt: Date.now(),
  };
  categories.push(newCategory);
  writeCategories(categories);
  return newCategory;
}

export function updateCategory(id, updates) {
  const categories = readCategories();
  const idx = categories.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Không tìm thấy danh mục");

  // Check duplicate name
  if (updates.name) {
    const duplicate = categories.find(
      (c) => c.id !== id && c.name.toLowerCase() === updates.name.toLowerCase()
    );
    if (duplicate) throw new Error("Tên danh mục đã tồn tại");
  }

  categories[idx] = { ...categories[idx], ...updates };
  writeCategories(categories);
  return categories[idx];
}

export function deleteCategory(id) {
  const categories = readCategories();
  const filtered = categories.filter((c) => c.id !== id);
  writeCategories(filtered);
  return true;
}

export function getCategoryProductCount(categoryName) {
  // This would count products by category name
  // For now, return a mock count
  const products = readProducts();
  return products.filter((p) => p.cat === categoryName).length;
}

