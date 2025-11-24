import { query } from "../config/database.js";

/**
 * Lấy danh sách dịch vụ với các tiêu chí lọc
 */
export async function getServices(options = {}) {
  const {
    status = null,
    search = "",
    includeInactive = false,
    limit = null,
  } = options;

  let sql = `
    SELECT 
      id,
      service_code AS serviceCode,
      name,
      description,
      duration,
      price,
      icon,
      status,
      sort_order AS sortOrder,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM services
    WHERE 1=1
  `;

  const params = [];

  if (status && status !== "all") {
    sql += ` AND status = ?`;
    params.push(status);
  } else if (!includeInactive) {
    sql += ` AND status = 'active'`;
  }

  if (search) {
    sql += ` AND (name LIKE ? OR service_code LIKE ?)`;
    const term = `%${search}%`;
    params.push(term, term);
  }

  sql += ` ORDER BY sort_order ASC, created_at DESC`;

  const limitNum = Number(limit);
  if (!Number.isNaN(limitNum) && limitNum > 0) {
    sql += ` LIMIT ?`;
    params.push(limitNum);
  }

  return await query(sql, params);
}

export async function getServiceById(id) {
  const results = await query(
    `SELECT 
      id,
      service_code AS serviceCode,
      name,
      description,
      duration,
      price,
      icon,
      status,
      sort_order AS sortOrder,
      created_at AS createdAt,
      updated_at AS updatedAt
     FROM services
     WHERE id = ?`,
    [id]
  );
  return results[0] || null;
}

export async function getServiceByCode(code) {
  const results = await query(
    `SELECT 
      id,
      service_code AS serviceCode,
      name,
      description,
      duration,
      price,
      icon,
      status,
      sort_order AS sortOrder,
      created_at AS createdAt,
      updated_at AS updatedAt
     FROM services
     WHERE service_code = ?`,
    [code]
  );
  return results[0] || null;
}

export async function createService(data) {
  const {
    serviceCode,
    name,
    description = null,
    duration = null,
    price = null,
    icon = null,
    status = "active",
    sortOrder = 0,
  } = data;

  const result = await query(
    `INSERT INTO services (
      service_code,
      name,
      description,
      duration,
      price,
      icon,
      status,
      sort_order
    ) VALUES (?,?,?,?,?,?,?,?)`,
    [
      serviceCode,
      name,
      description,
      duration,
      price,
      icon,
      status,
      sortOrder,
    ]
  );

  return await getServiceById(result.insertId);
}

export async function updateService(id, updates = {}) {
  const fields = [];
  const params = [];

  const map = {
    serviceCode: "service_code",
    name: "name",
    description: "description",
    duration: "duration",
    price: "price",
    icon: "icon",
    status: "status",
    sortOrder: "sort_order",
  };

  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || !(key in map)) return;
    fields.push(`${map[key]} = ?`);
    params.push(value);
  });

  if (!fields.length) {
    return await getServiceById(id);
  }

  params.push(id);

  await query(
    `UPDATE services 
     SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    params
  );

  return await getServiceById(id);
}

export async function softDeleteService(id) {
  await query(
    `UPDATE services 
     SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [id]
  );
  return await getServiceById(id);
}

export async function ensureServiceCodeUnique(serviceCode, excludeId = null) {
  const params = [serviceCode];
  let sql = `SELECT id FROM services WHERE service_code = ?`;
  if (excludeId) {
    sql += ` AND id <> ?`;
    params.push(excludeId);
  }

  const rows = await query(sql, params);
  return rows.length === 0;
}

