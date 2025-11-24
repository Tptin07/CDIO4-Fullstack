import {
  createAppointment as createAppointmentRecord,
  getAppointmentsByUser,
  getAppointmentById,
  getAppointmentByCode,
  updateAppointmentStatus,
} from "../models/appointmentModel.js";
import { getServiceById } from "../models/serviceModel.js";

const ALLOWED_USER_CANCEL_STATUS = ["pending", "confirmed"];

function formatAppointmentResponse(appointment) {
  if (!appointment) return null;
  return {
    ...appointment,
    scheduledAt: appointment.appointmentDate
      ? `${appointment.appointmentDate}T${appointment.appointmentTime}`
      : null,
  };
}

async function generateAppointmentCode() {
  let attempts = 0;
  while (attempts < 5) {
    const code = `APT${Date.now().toString(36).toUpperCase()}${Math.random()
      .toString(36)
      .substring(2, 5)
      .toUpperCase()}`;
    const exists = await getAppointmentByCode(code);
    if (!exists) return code.slice(0, 12);
    attempts += 1;
  }
  return `APT${Date.now()}`;
}

function validateDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function validateTime(time) {
  return /^\d{2}:\d{2}$/.test(time);
}

function validatePhone(phone) {
  return /^(0|\+84)\d{8,10}$/.test(phone.replace(/\s/g, ""));
}

export async function createAppointment(req, res) {
  try {
    const {
      serviceId,
      appointmentDate,
      appointmentTime,
      customerName,
      customerPhone,
      customerEmail = null,
      note = null,
    } = req.body;

    if (!serviceId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc (dịch vụ, ngày, giờ).",
      });
    }

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập họ tên khách hàng.",
      });
    }

    if (!validatePhone(customerPhone || "")) {
      return res.status(400).json({
        success: false,
        message: "Số điện thoại không hợp lệ.",
      });
    }

    if (!validateDate(appointmentDate) || !validateTime(appointmentTime)) {
      return res.status(400).json({
        success: false,
        message: "Thời gian đặt lịch không hợp lệ.",
      });
    }

    const targetDate = new Date(`${appointmentDate}T${appointmentTime}:00`);
    if (Number.isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Không thể phân tích thời gian đặt lịch.",
      });
    }

    if (targetDate.getTime() < Date.now() - 5 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: "Thời gian đặt lịch phải lớn hơn thời gian hiện tại.",
      });
    }

    const service = await getServiceById(serviceId);
    if (!service || service.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Dịch vụ không tồn tại hoặc đã tạm ngưng.",
      });
    }

    const appointment = await createAppointmentRecord({
      appointmentCode: await generateAppointmentCode(),
      userId: req.user?.userId || null,
      serviceId: service.id,
      serviceName: service.name,
      appointmentDate,
      appointmentTime,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim() || null,
      note: note?.trim() || null,
    });

    res.status(201).json({
      success: true,
      data: formatAppointmentResponse(appointment),
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({
      success: false,
      message: "Không thể tạo lịch hẹn.",
      error: error.message,
    });
  }
}

export async function getUserAppointments(req, res) {
  try {
    const appointments = await getAppointmentsByUser(req.user.userId);
    res.json({
      success: true,
      data: appointments.map(formatAppointmentResponse),
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách lịch hẹn.",
      error: error.message,
    });
  }
}

export async function getAppointmentDetail(req, res) {
  try {
    const appointment = await getAppointmentById(req.params.id);
    if (
      !appointment ||
      (appointment.userId && appointment.userId !== req.user.userId)
    ) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch hẹn.",
      });
    }

    res.json({
      success: true,
      data: formatAppointmentResponse(appointment),
    });
  } catch (error) {
    console.error("Error fetching appointment detail:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin lịch hẹn.",
      error: error.message,
    });
  }
}

export async function cancelAppointment(req, res) {
  try {
    const appointment = await getAppointmentById(req.params.id);
    if (
      !appointment ||
      (appointment.userId && appointment.userId !== req.user.userId)
    ) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch hẹn.",
      });
    }

    if (!ALLOWED_USER_CANCEL_STATUS.includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy lịch ở trạng thái hiện tại.",
      });
    }

    const reason = req.body?.reason?.trim();
    const combinedNote = reason
      ? `${appointment.note ? `${appointment.note}\n` : ""}[User cancel] ${reason}`
      : appointment.note;

    const updated = await updateAppointmentStatus(
      appointment.id,
      "cancelled",
      combinedNote
    );

    res.json({
      success: true,
      data: formatAppointmentResponse(updated),
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({
      success: false,
      message: "Không thể hủy lịch hẹn.",
      error: error.message,
    });
  }
}

