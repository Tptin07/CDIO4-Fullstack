/**
 * Utility function để validate và làm sạch ID
 * Loại bỏ ID tạm thời (dạng '0-xxx-yyy') và đảm bảo ID là số nguyên hợp lệ
 * KHÔNG chấp nhận ID bắt đầu bằng 0
 * 
 * @param {string|number} id - ID cần validate
 * @param {string} fieldName - Tên field để hiển thị trong error message (optional)
 * @returns {number} - ID đã được validate (số nguyên dương, >= 1)
 * @throws {Error} - Nếu ID không hợp lệ
 */
export function validateId(id, fieldName = 'ID') {
  if (id === null || id === undefined || id === '') {
    throw new Error(`${fieldName} không được để trống`);
  }

  const idString = id.toString().trim();
  
  // Kiểm tra nếu ID là string và bắt đầu bằng "0-" (ID tạm thời)
  if (typeof id === 'string' && idString.startsWith('0-')) {
    console.error(`❌ Rejected temporary ID (starts with 0-):`, {
      original: id,
      fieldName
    });
    throw new Error(`${fieldName} không hợp lệ: ${id}. ID tạm thời không được phép.`);
  }

  // Loại bỏ mọi ký tự không phải số
  const cleanId = idString.replace(/[^0-9]/g, '');
  
  // Kiểm tra nếu sau khi clean, ID bắt đầu bằng 0 (và không phải số 0 đơn lẻ)
  if (cleanId.length > 1 && cleanId.startsWith('0')) {
    console.error(`❌ Rejected ID starting with 0:`, {
      original: id,
      cleaned: cleanId,
      fieldName
    });
    throw new Error(`${fieldName} không hợp lệ: ${id}. ID không được bắt đầu bằng số 0.`);
  }
  
  // Parse thành số nguyên
  const validatedId = parseInt(cleanId);
  
  // Kiểm tra tính hợp lệ - phải là số nguyên dương (>= 1)
  if (isNaN(validatedId) || validatedId <= 0) {
    console.error(`❌ Invalid ${fieldName}:`, {
      original: id,
      type: typeof id,
      cleaned: cleanId,
      parsed: validatedId
    });
    throw new Error(`${fieldName} không hợp lệ: ${id}. ID phải là số nguyên dương (>= 1).`);
  }

  return validatedId;
}

/**
 * Validate nhiều ID cùng lúc
 * @param {Object} ids - Object chứa các ID cần validate { fieldName: idValue }
 * @returns {Object} - Object chứa các ID đã được validate
 */
export function validateIds(ids) {
  const validated = {};
  for (const [fieldName, id] of Object.entries(ids)) {
    validated[fieldName] = validateId(id, fieldName);
  }
  return validated;
}

