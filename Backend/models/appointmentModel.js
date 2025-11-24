import { query } from "../config/database.js";

function mapAppointmentRow(row) {
  if (!row) return null;
  const serviceDetails =
    row.serviceJoinId !== undefined && row.serviceJoinId !== null
      ? {
          id: row.serviceJoinId,
          code: row.serviceCode,
          name: row.serviceFullName,
          duration: row.serviceDuration,
          price: row.servicePrice,
          icon: row.serviceIcon,
          status: row.serviceStatus,
        }
      : null;

  const userDetails =
    row.userJoinId !== undefined && row.userJoinId !== null
      ? {
          id: row.userJoinId,
          name: row.userName,
          email: row.userEmail,
          phone: row.userPhone,
        }
      : null;

  return {
    id: row.id,
    appointmentCode: row.appointmentCode,
    userId: row.userId,
    serviceId: row.serviceId,
    serviceName: row.serviceName,
    appointmentDate: row.appointmentDate,
    appointmentTime: row.appointmentTime,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    customerEmail: row.customerEmail,
    note: row.note,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    serviceDetails,
    userDetails,
  };
}

export async function createAppointment(data) {
  const result = await query(
    `INSERT INTO appointments (
      appointment_code,
      user_id,
      service_id,
      service_name,
      appointment_date,
      appointment_time,
      customer_name,
      customer_phone,
      customer_email,
      note,
      status
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      data.appointmentCode,
      data.userId,
      data.serviceId,
      data.serviceName,
      data.appointmentDate,
      data.appointmentTime,
      data.customerName,
      data.customerPhone,
      data.customerEmail,
      data.note,
      data.status || "pending",
    ]
  );

  return await getAppointmentById(result.insertId);
}

export async function getAppointmentById(id) {
  const rows = await query(
    `SELECT 
      a.id,
      a.appointment_code AS appointmentCode,
      a.user_id AS userId,
      a.service_id AS serviceId,
      a.service_name AS serviceName,
      DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointmentDate,
      DATE_FORMAT(a.appointment_time, '%H:%i') AS appointmentTime,
      a.customer_name AS customerName,
      a.customer_phone AS customerPhone,
      a.customer_email AS customerEmail,
      a.note,
      a.status,
      a.created_at AS createdAt,
      a.updated_at AS updatedAt,
      s.id AS serviceJoinId,
      s.service_code AS serviceCode,
      s.name AS serviceFullName,
      s.duration AS serviceDuration,
      s.price AS servicePrice,
      s.icon AS serviceIcon,
      s.status AS serviceStatus,
      u.id AS userJoinId,
      u.name AS userName,
      u.email AS userEmail,
      u.phone AS userPhone
     FROM appointments a
     LEFT JOIN services s ON a.service_id = s.id
     LEFT JOIN users u ON a.user_id = u.id
     WHERE a.id = ?`,
    [id]
  );
  return mapAppointmentRow(rows[0]);
}

export async function getAppointmentByCode(code) {
  const rows = await query(
    `SELECT id FROM appointments WHERE appointment_code = ?`,
    [code]
  );
  return rows[0] || null;
}

export async function getAppointmentsByUser(userId) {
  const rows = await query(
    `SELECT 
      a.id,
      a.appointment_code AS appointmentCode,
      a.user_id AS userId,
      a.service_id AS serviceId,
      a.service_name AS serviceName,
      DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointmentDate,
      DATE_FORMAT(a.appointment_time, '%H:%i') AS appointmentTime,
      a.customer_name AS customerName,
      a.customer_phone AS customerPhone,
      a.customer_email AS customerEmail,
      a.note,
      a.status,
      a.created_at AS createdAt,
      a.updated_at AS updatedAt,
      s.id AS serviceJoinId,
      s.service_code AS serviceCode,
      s.name AS serviceFullName,
      s.duration AS serviceDuration,
      s.price AS servicePrice,
      s.icon AS serviceIcon,
      s.status AS serviceStatus
     FROM appointments a
     LEFT JOIN services s ON a.service_id = s.id
     WHERE a.user_id = ?
     ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
    [userId]
  );

  return rows.map(mapAppointmentRow);
}

export async function getAppointmentsAdmin(filters = {}) {
  const {
    status = null,
    search = "",
    dateFrom = null,
    dateTo = null,
  } = filters;

  let sql = `
    SELECT 
      a.id,
      a.appointment_code AS appointmentCode,
      a.user_id AS userId,
      a.service_id AS serviceId,
      a.service_name AS serviceName,
      DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointmentDate,
      DATE_FORMAT(a.appointment_time, '%H:%i') AS appointmentTime,
      a.customer_name AS customerName,
      a.customer_phone AS customerPhone,
      a.customer_email AS customerEmail,
      a.note,
      a.status,
      a.created_at AS createdAt,
      a.updated_at AS updatedAt,
      s.id AS serviceJoinId,
      s.service_code AS serviceCode,
      s.name AS serviceFullName,
      s.duration AS serviceDuration,
      s.price AS servicePrice,
      s.icon AS serviceIcon,
      s.status AS serviceStatus,
      u.id AS userJoinId,
      u.name AS userName,
      u.email AS userEmail,
      u.phone AS userPhone
    FROM appointments a
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN users u ON a.user_id = u.id
    WHERE 1=1
  `;

  const params = [];

  if (status && status !== "all") {
    sql += ` AND a.status = ?`;
    params.push(status);
  }

  if (search) {
    sql += ` AND (
      a.appointment_code LIKE ? OR
      a.customer_name LIKE ? OR
      a.customer_phone LIKE ? OR
      a.service_name LIKE ?
    )`;
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  if (dateFrom) {
    sql += ` AND a.appointment_date >= ?`;
    params.push(dateFrom);
  }

  if (dateTo) {
    sql += ` AND a.appointment_date <= ?`;
    params.push(dateTo);
  }

  sql += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

  const rows = await query(sql, params);
  return rows.map(mapAppointmentRow);
}

export async function updateAppointmentStatus(id, status, note = null) {
  const params = [status];
  let sql = `UPDATE appointments SET status = ?`;

  if (note !== null && note !== undefined) {
    sql += `, note = ?`;
    params.push(note);
  }

  sql += `, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  params.push(id);

  await query(sql, params);
  return await getAppointmentById(id);
}

export async function deleteAppointmentById(id) {
  await query(`DELETE FROM appointments WHERE id = ?`, [id]);
  return true;
}

