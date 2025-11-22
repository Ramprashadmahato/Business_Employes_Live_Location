import Company from "../models/Company.js";
import Staff from "../models/Staff.js";
import CheckInLog from "../models/CheckInLog.js";
import ExcelJS from "exceljs";

/**
 * Helper: Get date range based on rangeType or custom dates
 */
const getDateRange = (rangeType, startDate, endDate) => {
  if (startDate && endDate) return { start: new Date(startDate), end: new Date(endDate) };

  const now = new Date();
  let start, end;

  switch (rangeType) {
    case "daily":
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
      break;
    case "weekly":
      const day = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case "monthly":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case "yearly":
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    default:
      start = new Date(0);
      end = new Date();
  }

  return { start, end };
};

/**
 * @desc Generate report for companies/staff/attendance
 * @route GET /api/reports
 * @query rangeType=daily|weekly|monthly|yearly, startDate, endDate, companyId, staffId, export=excel
 * @access Admin / Company
 */
export const generateReport = async (req, res) => {
  try {
    const { rangeType, startDate, endDate, companyId, staffId, export: exportType } = req.query;
    const { start, end } = getDateRange(rangeType, startDate, endDate);

    // ---------------- Role-based Company Filter ----------------
    let companyFilter = {};
    if (req.user.role === "COMPANY") {
      companyFilter._id = req.user.companyId; // Company can only see its own data
    } else if (companyId) {
      companyFilter._id = companyId; // Admin can filter by companyId
    }

    const companies = await Company.find(companyFilter);
    if (!companies.length) {
      return res.status(404).json({ success: false, message: "No companies found" });
    }

    // ---------------- Staff Filter ----------------
    let staffFilter = {};
    if (req.user.role === "COMPANY") {
      staffFilter.companyId = req.user.companyId; // Always restrict to own company
      if (staffId) staffFilter._id = staffId; // Optional individual staff
    } else if (req.user.role === "ADMIN") {
      if (staffId) staffFilter._id = staffId;
      else if (companyId) staffFilter.companyId = companyId;
      else staffFilter.companyId = { $in: companies.map((c) => c._id) };
    }

    const staffs = await Staff.find(staffFilter).populate("companyId", "name email");
    if (!staffs.length) {
      return res.status(404).json({ success: false, message: "No staff found" });
    }

    // ---------------- Attendance Data ----------------
    const attendanceData = await Promise.all(
      staffs.map(async (staff) => {
        const logs = await CheckInLog.find({
          staffId: staff._id,
          checkInTime: { $gte: start, $lte: end },
        }).sort({ checkInTime: 1 });

        let totalHours = 0;
        logs.forEach((log) => {
          if (log.checkOutTime && log.checkInTime) {
            totalHours += (log.checkOutTime - log.checkInTime) / (1000 * 60 * 60);
          }
        });

        let status = "Not Checked In";
        if (logs.length > 0) {
          const lastLog = logs[logs.length - 1];
          status = lastLog.checkOutTime ? "Checked Out" : "Checked In";
        }

        return {
          staffName: staff.name,
          staffEmail: staff.email,
          staffPhone: staff.phone || "N/A",
          company: staff.companyId?.name || "N/A",
          totalCheckIns: logs.length,
          spoofed: logs.filter((log) => log.isSpoofed).length,
          workingHours: totalHours.toFixed(2),
          status,
        };
      })
    );

    // ---------------- Excel Export ----------------
    if (exportType === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Staff Report");

      sheet.columns = [
        { header: "Staff Name", key: "staffName", width: 25 },
        { header: "Email", key: "staffEmail", width: 30 },
        { header: "Phone", key: "staffPhone", width: 15 },
        { header: "Company", key: "company", width: 25 },
        { header: "Total Check-Ins", key: "totalCheckIns", width: 15 },
        { header: "Spoofed Attempts", key: "spoofed", width: 15 },
        { header: "Working Hours", key: "workingHours", width: 15 },
        { header: "Status", key: "status", width: 15 },
      ];

      sheet.getRow(1).font = { bold: true };

      attendanceData.forEach((item) => sheet.addRow(item));

      const fileName = `Staff_Report_${companies[0].name.replace(/\s+/g, "_")}_${staffId || "All"}_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

      await workbook.xlsx.write(res);
      return res.end();
    }

    // ---------------- JSON Response ----------------
    res.status(200).json({
      success: true,
      data: {
        range: { start, end },
        companies,
        staffs: staffs.length,
        attendance: attendanceData,
      },
    });
  } catch (error) {
    console.error("Generate Report Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
