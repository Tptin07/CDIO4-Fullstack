import {
  getServices,
  getServiceById,
} from "../models/serviceModel.js";

export async function getPublicServices(req, res) {
  try {
    const { status = "active", search = "" } = req.query;
    const services = await getServices({
      status,
      search,
      includeInactive: false,
    });

    res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách dịch vụ",
      error: error.message,
    });
  }
}

export async function getServiceDetail(req, res) {
  try {
    const service = await getServiceById(req.params.id);

    if (!service || service.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dịch vụ",
      });
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Error fetching service detail:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin dịch vụ",
      error: error.message,
    });
  }
}

