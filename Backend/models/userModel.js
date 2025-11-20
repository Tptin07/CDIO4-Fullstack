import { query } from "../config/database.js";

/**
 * Tìm user theo email
 */
export async function findByEmail(email) {
  const sql = "SELECT * FROM users WHERE email = ?";
  const results = await query(sql, [email]);
  return results[0] || null;
}

/**
 * Tìm user theo ID
 */
export async function findById(id) {
  const sql =
    "SELECT id, name, email, phone, gender, date_of_birth, avatar, role, status, created_at, updated_at FROM users WHERE id = ?";
  const results = await query(sql, [id]);
  return results[0] || null;
}

/**
 * Tạo user mới
 */
export async function create(userData) {
  const { name, email, password, phone, avatar, role } = userData;
  const sql = `
    INSERT INTO users (name, email, password, phone, avatar, role, status)
    VALUES (?, ?, ?, ?, ?, ?, 'active')
  `;
  const result = await query(sql, [
    name,
    email,
    password,
    phone || null,
    avatar || null,
    role || "customer",
  ]);

  // Lấy user vừa tạo (không trả về password)
  const newUser = await findById(result.insertId);
  return newUser;
}

/**
 * Cập nhật thông tin user
 */
export async function update(id, userData) {
  try {
    const { name, phone, gender, date_of_birth, avatar } = userData;

    console.log("🔄 Model update - Input:", {
      id,
      name,
      phone,
      gender,
      date_of_birth,
      hasAvatar: !!avatar,
      avatarLength: avatar ? avatar.length : 0,
    });

    // Xử lý phone:
    // - Nếu phone === undefined: không update (giữ nguyên trong DB)
    // - Nếu phone === null: set null (xóa phone)
    // - Nếu phone là string: trim và set giá trị (hoặc null nếu rỗng)
    let phoneValue = undefined;
    if (phone !== undefined) {
      if (phone === null) {
        phoneValue = null;
      } else if (typeof phone === "string") {
        phoneValue = phone.trim() || null;
      } else {
        phoneValue = null;
      }
    }

    // Xử lý avatar
    let avatarValue;
    if (avatar !== undefined) {
      if (avatar === null || avatar === "") {
        avatarValue = null;
      } else if (typeof avatar === "string" && avatar.trim() !== "") {
        avatarValue = avatar.trim();
      } else {
        avatarValue = null;
      }
    }

    // Xây dựng SQL động dựa trên các field được cung cấp
    const setParts = [];
    const params = [];

    // Name luôn được cập nhật (required)
    if (name !== undefined) {
      setParts.push("name = ?");
      params.push(name.trim());
    }

    // Phone
    if (phoneValue !== undefined) {
      setParts.push("phone = ?");
      params.push(phoneValue);
    }

    // Gender (chỉ update nếu được cung cấp)
    if (gender !== undefined) {
      setParts.push("gender = ?");
      params.push(gender || null);
    }

    // Date of birth (chỉ update nếu được cung cấp)
    if (date_of_birth !== undefined) {
      setParts.push("date_of_birth = ?");
      params.push(date_of_birth || null);
    }

    // Avatar (chỉ update nếu được cung cấp)
    if (avatarValue !== undefined) {
      setParts.push("avatar = ?");
      params.push(avatarValue);
    }

    // Luôn cập nhật updated_at
    setParts.push("updated_at = CURRENT_TIMESTAMP");

    if (setParts.length === 0) {
      throw new Error("Không có dữ liệu nào để cập nhật");
    }

    // Thêm id vào params
    params.push(id);

    const sql = `
      UPDATE users 
      SET ${setParts.join(", ")}
      WHERE id = ?
    `;

    console.log("📝 Executing UPDATE:", {
      sql: sql.substring(0, 200) + "...",
      paramsCount: params.length,
      phone: phoneValue,
      hasAvatar: avatarValue !== undefined,
      avatarLength: avatarValue ? avatarValue.length : 0,
    });

    await query(sql, params);

    console.log("✅ Model update - Query executed successfully");

    const updatedUser = await findById(id);
    console.log("✅ Model update - Retrieved user:", {
      id: updatedUser?.id,
      phone: updatedUser?.phone,
      gender: updatedUser?.gender,
      date_of_birth: updatedUser?.date_of_birth,
      hasAvatar: !!updatedUser?.avatar,
      avatarLength: updatedUser?.avatar ? updatedUser.avatar.length : 0,
    });

    return updatedUser;
  } catch (error) {
    console.error("❌ Model update error:", error);
    throw error;
  }
}

/**
 * Kiểm tra email đã tồn tại chưa
 */
export async function emailExists(email, excludeId = null) {
  let sql = "SELECT COUNT(*) as count FROM users WHERE email = ?";
  const params = [email];

  if (excludeId) {
    sql += " AND id != ?";
    params.push(excludeId);
  }

  const results = await query(sql, params);
  return results[0].count > 0;
}
