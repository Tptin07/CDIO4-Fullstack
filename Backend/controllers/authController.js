import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findByEmail, create, findById, update } from "../models/userModel.js";
import { query } from "../config/database.js";
import { validateId } from "../utils/validateId.js";

/**
 * Đăng ký user mới
 */
export async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin: tên, email và mật khẩu",
      });
    }

    // Validation họ tên: không được chứa số, ký tự đặc biệt, phải >= 5 ký tự
    const trimmedName = name.trim();
    if (trimmedName.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Họ và tên phải có ít nhất 5 ký tự",
      });
    }
    if (/\d/.test(trimmedName)) {
      return res.status(400).json({
        success: false,
        message: "Họ và tên không được chứa số",
      });
    }
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(trimmedName)) {
      return res.status(400).json({
        success: false,
        message: "Họ và tên không được chứa ký tự đặc biệt",
      });
    }

    // Validation mật khẩu: phải > 5 ký tự, có chữ hoa, chữ thường, chữ số, ký tự đặc biệt
    if (password.length <= 5) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải lớn hơn 5 ký tự",
      });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất một chữ cái in hoa",
      });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất một chữ cái thường",
      });
    }
    if (!/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất một chữ số",
      });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất một ký tự đặc biệt",
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được đăng ký",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Tạo user mới
    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone || null,
      role: "customer",
    };

    const newUser = await create(userData);

    // Tạo JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          gender: newUser.gender,
          date_of_birth: newUser.date_of_birth,
          avatar: newUser.avatar,
          role: newUser.role,
        },
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng ký",
      error: error.message,
    });
  }
}

/**
 * Đăng nhập
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    // Tìm user theo email
    const user = await findByEmail(email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Kiểm tra status - không cho phép đăng nhập nếu bị khóa hoặc vô hiệu hóa
    if (user.status === "banned") {
      return res.status(403).json({
        success: false,
        message:
          "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
      });
    }

    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message:
          "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
      });
    }

    // Chỉ cho phép đăng nhập nếu status là 'active'
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "Tài khoản của bạn không thể đăng nhập. Vui lòng liên hệ quản trị viên.",
      });
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          date_of_birth: user.date_of_birth,
          avatar: user.avatar,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng nhập",
      error: error.message,
    });
  }
}

/**
 * Lấy thông tin user hiện tại
 */
export async function getCurrentUser(req, res) {
  try {
    const userId = req.user.userId;
    const user = await findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          date_of_birth: user.date_of_birth,
          avatar: user.avatar,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin người dùng",
      error: error.message,
    });
  }
}

/**
 * Cập nhật thông tin profile (name, phone, avatar)
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user.userId;
    const { name, phone, gender, date_of_birth, birthday, avatar } = req.body;

    // Log request body size để debug
    const bodySize = JSON.stringify(req.body).length;
    console.log("📝 Update profile request:", {
      userId,
      bodySize: `${(bodySize / 1024).toFixed(2)} KB`,
      hasName: !!name,
      hasPhone: !!phone,
      gender,
      date_of_birth: date_of_birth || birthday,
      hasAvatar: !!avatar,
      avatarLength: avatar ? avatar.length : 0,
      avatarType: avatar ? avatar.substring(0, 20) : null,
    });

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tên không được để trống",
      });
    }

    // Kiểm tra user có tồn tại không
    const existingUser = await findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Validation avatar (nếu có)
    // Base64 string của ảnh 2MB sẽ có khoảng 2.6MB, giới hạn ở 5MB để an toàn
    if (avatar && avatar.length > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Ảnh đại diện quá lớn. Vui lòng chọn ảnh nhỏ hơn 2MB",
      });
    }

    // Validation gender
    if (gender && !["male", "female", "other"].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Giới tính không hợp lệ",
      });
    }

    // Validation date_of_birth (nếu có)
    // Hỗ trợ cả date_of_birth và birthday để tương thích với frontend
    const birthDate = date_of_birth || birthday;
    if (birthDate) {
      const parsedDate = new Date(birthDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Ngày sinh không hợp lệ",
        });
      }
      // Kiểm tra ngày sinh không được trong tương lai
      if (parsedDate > new Date()) {
        return res.status(400).json({
          success: false,
          message: "Ngày sinh không thể trong tương lai",
        });
      }
    }

    // Xử lý avatar
    // Nếu avatar là undefined, không update field này (giữ nguyên trong DB)
    // Nếu avatar là null hoặc empty string, set null (xóa avatar)
    // Nếu avatar là string hợp lệ, lưu vào DB
    let avatarValue = undefined; // undefined = không update field này

    if (avatar !== undefined) {
      if (avatar === null || avatar === "") {
        // Xóa avatar
        avatarValue = null;
      } else if (typeof avatar === "string") {
        const trimmedAvatar = avatar.trim();
        if (trimmedAvatar !== "") {
          // Lưu avatar
          avatarValue = trimmedAvatar;
        } else {
          // Xóa avatar nếu empty sau khi trim
          avatarValue = null;
        }
      }
    }
    // Nếu avatar === undefined, giữ nguyên avatarValue = undefined (không update)

    // Cập nhật thông tin
    const updateData = {
      name: name.trim(),
    };

    // Chỉ thêm phone nếu được cung cấp trong request
    if (phone !== undefined) {
      updateData.phone =
        phone && typeof phone === "string" && phone.trim()
          ? phone.trim()
          : null;
    }

    // Chỉ thêm gender nếu được cung cấp
    if (gender !== undefined) {
      updateData.gender = gender || null;
    }

    // Chỉ thêm date_of_birth nếu được cung cấp
    if (birthDate !== undefined) {
      updateData.date_of_birth = birthDate || null;
    }

    // Chỉ thêm avatar vào updateData nếu có giá trị (không phải undefined)
    if (avatarValue !== undefined) {
      updateData.avatar = avatarValue;
    }

    console.log("💾 Updating user with data:", {
      name: updateData.name,
      phone: updateData.phone !== undefined ? updateData.phone : "NOT_UPDATED",
      willUpdatePhone: updateData.phone !== undefined,
      gender:
        updateData.gender !== undefined ? updateData.gender : "NOT_UPDATED",
      willUpdateGender: updateData.gender !== undefined,
      date_of_birth:
        updateData.date_of_birth !== undefined
          ? updateData.date_of_birth
          : "NOT_UPDATED",
      willUpdateBirthday: updateData.date_of_birth !== undefined,
      willUpdateAvatar: avatarValue !== undefined,
      avatarValue:
        avatarValue === undefined
          ? "NOT_UPDATED"
          : avatarValue === null
          ? "NULL (will delete)"
          : `String (${avatarValue.length} chars)`,
      avatarPreview: updateData.avatar
        ? updateData.avatar.substring(0, 100) + "..."
        : null,
    });

    const updatedUser = await update(userId, updateData);

    console.log("✅ User updated successfully:", {
      id: updatedUser.id,
      gender: updatedUser.gender,
      date_of_birth: updatedUser.date_of_birth,
      hasAvatar: !!updatedUser.avatar,
      avatarLength: updatedUser.avatar ? updatedUser.avatar.length : 0,
    });

    res.json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          gender: updatedUser.gender,
          date_of_birth: updatedUser.date_of_birth,
          avatar: updatedUser.avatar,
          role: updatedUser.role,
          status: updatedUser.status,
        },
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật thông tin",
      error: error.message,
    });
  }
}

/**
 * Lấy danh sách địa chỉ của user
 */
export async function getUserAddresses(req, res) {
  try {
    const userId = req.user.userId;

    const addresses = await query(
      `SELECT 
        id,
        full_name,
        phone,
        province,
        district,
        ward,
        street_address,
        postal_code,
        is_default,
        created_at,
        updated_at
      FROM addresses
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    // Đảm bảo tất cả id là số nguyên hợp lệ
    const validatedAddresses = (addresses || [])
      .map((addr) => ({
        ...addr,
        id: parseInt(addr.id), // Đảm bảo id là số nguyên
      }))
      .filter((addr) => !isNaN(addr.id) && addr.id > 0);

    res.json({
      success: true,
      data: validatedAddresses,
    });
  } catch (error) {
    console.error("Get user addresses error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách địa chỉ",
      error: error.message,
    });
  }
}

/**
 * Tạo hoặc cập nhật địa chỉ
 */
export async function saveAddress(req, res) {
  try {
    const userId = req.user.userId;
    const rawId = req.params?.id || req.body?.id || null; // Hỗ trợ cả params và body
    const {
      full_name,
      phone,
      province,
      district,
      ward,
      street_address,
      postal_code,
      is_default = false,
    } = req.body;

    // Validation
    if (
      !full_name ||
      !phone ||
      !province ||
      !district ||
      !ward ||
      !street_address
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin địa chỉ",
      });
    }

    // Validate ID nếu có - loại bỏ ID tạm thời
    let validatedId = null;
    if (rawId) {
      try {
        validatedId = validateId(rawId, "address_id");
      } catch (error) {
        console.error("❌ Invalid address ID in saveAddress:", {
          original: rawId,
          type: typeof rawId,
          error: error.message,
        });
        return res.status(400).json({
          success: false,
          message: error.message || "ID địa chỉ không hợp lệ",
        });
      }
    }

    // Nếu có id, cập nhật địa chỉ hiện có
    if (validatedId) {
      // Kiểm tra địa chỉ có thuộc về user không
      const [existing] = await query(
        `SELECT id FROM addresses WHERE id = ? AND user_id = ?`,
        [validatedId, userId]
      );

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy địa chỉ",
        });
      }

      // Nếu set làm mặc định, bỏ mặc định của các địa chỉ khác
      if (is_default) {
        await query(
          `UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND id != ?`,
          [userId, validatedId]
        );
      }

      await query(
        `UPDATE addresses 
         SET full_name = ?, phone = ?, province = ?, district = ?, ward = ?,
             street_address = ?, postal_code = ?, is_default = ?, updated_at = NOW()
         WHERE id = ? AND user_id = ?`,
        [
          full_name,
          phone,
          province,
          district,
          ward,
          street_address,
          postal_code || null,
          is_default,
          validatedId,
          userId,
        ]
      );

      res.json({
        success: true,
        message: "Đã cập nhật địa chỉ thành công",
        data: { id: validatedId },
      });
    } else {
      // Tạo địa chỉ mới
      // Nếu set làm mặc định, bỏ mặc định của các địa chỉ khác
      if (is_default) {
        await query(
          `UPDATE addresses SET is_default = FALSE WHERE user_id = ?`,
          [userId]
        );
      }

      const result = await query(
        `INSERT INTO addresses 
         (user_id, full_name, phone, province, district, ward, street_address, postal_code, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          full_name,
          phone,
          province,
          district,
          ward,
          street_address,
          postal_code || null,
          is_default,
        ]
      );

      // Đảm bảo insertId là số nguyên hợp lệ
      const insertId = parseInt(result.insertId);
      if (isNaN(insertId) || insertId <= 0) {
        console.error(
          "❌ Invalid insertId from database:",
          result.insertId,
          typeof result.insertId
        );
        return res.status(500).json({
          success: false,
          message: "Lỗi khi tạo địa chỉ: ID không hợp lệ",
        });
      }

      res.json({
        success: true,
        message: "Đã thêm địa chỉ thành công",
        data: { id: insertId },
      });
    }
  } catch (error) {
    console.error("Save address error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lưu địa chỉ",
      error: error.message,
    });
  }
}

/**
 * User tự khóa tài khoản của mình (cần xác thực mật khẩu)
 */
export async function lockAccount(req, res) {
  try {
    const userId = req.user.userId;
    const { password } = req.body;

    // Validation
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập mật khẩu để xác thực",
      });
    }

    // Lấy thông tin user hiện tại
    const user = await findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Không cho phép admin tự khóa tài khoản
    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Không thể khóa tài khoản quản trị viên",
      });
    }

    // Kiểm tra tài khoản đã bị khóa chưa
    if (user.status === "banned") {
      return res.status(400).json({
        success: false,
        message: "Tài khoản của bạn đã bị khóa",
      });
    }

    // Xác thực mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu không đúng. Vui lòng thử lại",
      });
    }

    // Khóa tài khoản (chuyển status sang 'banned')
    await query("UPDATE users SET status = ? WHERE id = ?", ["banned", userId]);

    res.json({
      success: true,
      message:
        "Đã khóa tài khoản thành công. Tài khoản của bạn đã bị khóa và cần quản trị viên duyệt để mở lại.",
      data: {
        status: "banned",
        locked: true,
      },
    });
  } catch (error) {
    console.error("Lock account error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi khóa tài khoản",
      error: error.message,
    });
  }
}

/**
 * Thay đổi mật khẩu cho user (cần xác thực mật khẩu hiện tại)
 */
export async function changePassword(req, res) {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới",
      });
    }

    // Lấy thông tin user (bao gồm password) trực tiếp từ DB
    const users = await query("SELECT * FROM users WHERE id = ?", [userId]);
    const user = users && users[0];
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    // Xác thực mật khẩu hiện tại
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Mật khẩu hiện tại không đúng" });
    }

    // Kiểm tra mật khẩu mới theo quy tắc (same as register)
    if (newPassword.length <= 5) {
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu phải lớn hơn 5 ký tự" });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất một chữ cái in hoa",
      });
    }
    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất một chữ cái thường",
      });
    }
    if (!/\d/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất một chữ số",
      });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất một ký tự đặc biệt",
      });
    }

    // Hash và cập nhật mật khẩu
    const saltRounds = 10;
    const hashed = await bcrypt.hash(newPassword, saltRounds);
    await query("UPDATE users SET password = ? WHERE id = ?", [hashed, userId]);

    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đổi mật khẩu",
      error: error.message,
    });
  }
}
