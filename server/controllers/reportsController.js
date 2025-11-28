// controllers/reportsController.js
const User = require("../models/User");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Menu = require("../models/Menu");
const Feedback = require("../models/Feedback");
const Attendance = require("../models/Attendance");
const PDFDocument = require("pdfkit");
const Inventory = require("../models/Inventory"); // Added Inventory model

// @desc    Generate user analytics report
// @route   POST /api/reports/generate
// @access  Private/Admin
exports.generateReport = async (req, res) => {
  try {
    const { type, dateRange, includeCharts } = req.body;
    const { startDate, endDate } = dateRange;

    let reportData = {};

    switch (type) {
      case "users":
        reportData = await generateUserReport(startDate, endDate);
        break;
      case "sales":
        reportData = await generateSalesReport(startDate, endDate);
        break;
      case "inventory":
        reportData = await generateInventoryReport(startDate, endDate);
        break;
      case "feedback":
        reportData = await generateFeedbackReport(startDate, endDate);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid report type",
        });
    }

    // Check if there was an error in report generation
    if (reportData.error) {
      return res.status(500).json({
        success: false,
        message: reportData.error,
      });
    }

    // Save report to database (you might want to create a Report model)
    const report = {
      type,
      dateRange,
      data: reportData,
      generatedBy: req.user.id,
      status: "completed",
      createdAt: new Date(),
    };

    res.status(200).json({
      success: true,
      message: `${type} report generated successfully`,
      report: {
        id: Date.now().toString(), // Temporary ID
        ...report,
      },
    });
  } catch (error) {
    console.error("Generate report error:", error);
    res.status(500).json({
      success: false,
      message: `Server error generating ${req.body.type} report: ${error.message}`,
    });
  }
};

// @desc    Get reports history
// @route   GET /api/reports/history
// @access  Private/Admin
exports.getReportsHistory = async (req, res) => {
  try {
    // Return empty array - implement Report model if needed for storing report history
    const reports = [];

    res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Get reports history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching reports history",
    });
  }
};

// @desc    Download report
// @route   GET /api/reports/:id/download
// @access  Private/Admin
exports.downloadReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { format, type, dateRange } = req.query;

    if (format === "pdf") {
      // Create PDF document
      const doc = new PDFDocument();

      // Set response headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${type}-report-${id}.pdf`
      );

      // Pipe PDF to response
      doc.pipe(res);

      // Parse date range if provided
      let startDate, endDate;
      if (dateRange) {
        const parsedRange = JSON.parse(dateRange);
        startDate = parsedRange.startDate;
        endDate = parsedRange.endDate;
      } else {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        endDate = new Date();
      }

      // Generate report data based on type
      let reportData = {};
      let reportTitle = "MessMate Report";

      switch (type) {
        case "users":
          reportData = await generateUserReport(startDate, endDate);
          reportTitle = "MessMate User Analytics Report";
          break;
        case "sales":
          reportData = await generateSalesReport(startDate, endDate);
          reportTitle = "MessMate Sales Report";
          break;
        case "inventory":
          reportData = await generateInventoryReport(startDate, endDate);
          reportTitle = "MessMate Inventory Report";
          break;
        case "feedback":
          reportData = await generateFeedbackReport(startDate, endDate);
          reportTitle = "MessMate Feedback Report";
          break;
        default:
          reportData = { message: "Report data not available" };
      }

      // Add header content to PDF
      doc.fontSize(24).text(reportTitle, { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Report ID: ${id}`, { align: "center" });
      doc
        .fontSize(12)
        .text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, {
          align: "center",
        });
      doc
        .fontSize(12)
        .text(
          `Date Range: ${new Date(startDate).toLocaleDateString(
            "en-IN"
          )} - ${new Date(endDate).toLocaleDateString("en-IN")}`,
          { align: "center" }
        );
      doc.moveDown(2);

      // Add report-specific content
      if (type === "users" && reportData.summary) {
        // User Report Content
        doc.fontSize(18).text("Summary Statistics", { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Total Users: ${reportData.summary.totalUsers}`);
        doc.fontSize(12).text(`New Users: ${reportData.summary.newUsers}`);
        doc
          .fontSize(12)
          .text(`Active Users: ${reportData.summary.activeUsers}`);
        doc
          .fontSize(12)
          .text(`Verified Users: ${reportData.summary.verifiedUsers}`);
        doc
          .fontSize(12)
          .text(
            `Active User Percentage: ${reportData.summary.activeUserPercentage}%`
          );
        doc.moveDown(2);

        if (reportData.usersByRole) {
          doc
            .fontSize(18)
            .text("User Distribution by Role", { underline: true });
          doc.moveDown();
          Object.entries(reportData.usersByRole).forEach(([role, count]) => {
            const percentage = (
              (count / reportData.summary.totalUsers) *
              100
            ).toFixed(1);
            doc
              .fontSize(12)
              .text(
                `${
                  role.charAt(0).toUpperCase() + role.slice(1)
                }: ${count} (${percentage}%)`
              );
          });
          doc.moveDown(2);
        }

        if (reportData.activity) {
          doc.fontSize(18).text("Activity Metrics", { underline: true });
          doc.moveDown();
          doc
            .fontSize(12)
            .text(
              `Average Bookings per User: ${reportData.activity.avgBookingsPerUser.toFixed(
                1
              )}`
            );
          doc
            .fontSize(12)
            .text(
              `Average Amount per User: ₹${reportData.activity.avgAmountPerUser.toFixed(
                2
              )}`
            );
          doc
            .fontSize(12)
            .text(
              `Active Users (with bookings): ${reportData.activity.activeUserCount}`
            );
          doc.moveDown(2);
        }
      } else if (type === "sales" && reportData.summary) {
        // Sales Report Content
        doc.fontSize(18).text("Sales Summary", { underline: true });
        doc.moveDown();
        doc
          .fontSize(12)
          .text(
            `Total Revenue: ₹${reportData.summary.totalRevenue.toFixed(2)}`
          );
        doc
          .fontSize(12)
          .text(`Total Bookings: ${reportData.summary.totalBookings}`);
        doc
          .fontSize(12)
          .text(
            `Average Order Value: ₹${reportData.summary.averageOrderValue.toFixed(
              2
            )}`
          );
        doc
          .fontSize(12)
          .text(`Total Transactions: ${reportData.summary.totalTransactions}`);
        doc.moveDown(2);

        if (reportData.topItems && reportData.topItems.length > 0) {
          doc.fontSize(18).text("Top Performing Items", { underline: true });
          doc.moveDown();
          reportData.topItems.slice(0, 10).forEach((item, index) => {
            doc
              .fontSize(12)
              .text(
                `${index + 1}. ${item.name} - ${
                  item.orders
                } orders - ₹${item.revenue.toFixed(2)}`
              );
          });
          doc.moveDown(2);
        }
      } else if (type === "inventory" && reportData.summary) {
        // Inventory Report Content
        doc.fontSize(18).text("Inventory Summary", { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Total Items: ${reportData.summary.totalItems}`);
        doc
          .fontSize(12)
          .text(`Low Stock Items: ${reportData.summary.lowStockItems}`);
        doc
          .fontSize(12)
          .text(`Out of Stock Items: ${reportData.summary.outOfStockItems}`);
        doc
          .fontSize(12)
          .text(
            `Total Stock Value: ₹${reportData.summary.totalStockValue.toFixed(
              2
            )}`
          );
        doc.moveDown(2);

        if (reportData.lowStockItems && reportData.lowStockItems.length > 0) {
          doc.fontSize(18).text("Low Stock Alerts", { underline: true });
          doc.moveDown();
          reportData.lowStockItems.forEach((item, index) => {
            doc
              .fontSize(12)
              .text(
                `${index + 1}. ${item.name} - Current Stock: ${
                  item.currentStock
                } ${item.unit}`
              );
          });
          doc.moveDown(2);
        }
      } else if (type === "feedback" && reportData.summary) {
        // Feedback Report Content
        doc.fontSize(18).text("Feedback Summary", { underline: true });
        doc.moveDown();
        doc
          .fontSize(12)
          .text(`Total Reviews: ${reportData.summary.totalReviews}`);
        doc
          .fontSize(12)
          .text(
            `Average Rating: ${reportData.summary.averageRating.toFixed(1)}/5`
          );
        doc
          .fontSize(12)
          .text(`Positive Reviews: ${reportData.summary.positiveReviews}`);
        doc
          .fontSize(12)
          .text(`Satisfaction Rate: ${reportData.summary.satisfactionRate}%`);
        doc.moveDown(2);

        if (reportData.recentFeedback && reportData.recentFeedback.length > 0) {
          doc.fontSize(18).text("Recent Feedback", { underline: true });
          doc.moveDown();
          reportData.recentFeedback.slice(0, 10).forEach((feedback, index) => {
            doc
              .fontSize(12)
              .text(
                `${index + 1}. Rating: ${
                  feedback.rating
                }/5 - ${feedback.comment.substring(0, 100)}...`
              );
          });
          doc.moveDown(2);
        }
      } else {
        // Generic content for unknown report types
        doc.fontSize(16).text("Report Content", { underline: true });
        doc.moveDown();
        doc
          .fontSize(12)
          .text("This is a generated report from MessMate system.");
        doc
          .fontSize(12)
          .text(
            "The report contains analytics and insights about your mess management system."
          );
        doc.moveDown();
        doc
          .fontSize(12)
          .text("For detailed analytics, please use the web interface.");
      }

      // Add footer
      doc.moveDown(2);
      doc
        .fontSize(10)
        .text("Generated by MessMate System", {
          align: "center",
          color: "gray",
        });
      doc
        .fontSize(10)
        .text("For support, contact your system administrator", {
          align: "center",
          color: "gray",
        });

      // Finalize PDF
      doc.end();
    } else if (format === "excel") {
      // Return CSV format with actual data
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${type}-report-${id}.csv`
      );

      let csvContent = `Report Type,${type}\n`;
      csvContent += `Report ID,${id}\n`;
      csvContent += `Generated Date,${new Date().toLocaleDateString(
        "en-IN"
      )}\n`;
      csvContent += `Date Range,${new Date(startDate).toLocaleDateString(
        "en-IN"
      )} to ${new Date(endDate).toLocaleDateString("en-IN")}\n\n`;

      // Add report-specific CSV data
      if (type === "users" && reportData.summary) {
        csvContent += "Metric,Value\n";
        csvContent += `Total Users,${reportData.summary.totalUsers}\n`;
        csvContent += `New Users,${reportData.summary.newUsers}\n`;
        csvContent += `Active Users,${reportData.summary.activeUsers}\n`;
        csvContent += `Verified Users,${reportData.summary.verifiedUsers}\n`;
        csvContent += `Active User Percentage,${reportData.summary.activeUserPercentage}%\n`;
      } else if (type === "sales" && reportData.summary) {
        csvContent += "Metric,Value\n";
        csvContent += `Total Revenue,₹${reportData.summary.totalRevenue.toFixed(
          2
        )}\n`;
        csvContent += `Total Bookings,${reportData.summary.totalBookings}\n`;
        csvContent += `Average Order Value,₹${reportData.summary.averageOrderValue.toFixed(
          2
        )}\n`;
        csvContent += `Total Transactions,${reportData.summary.totalTransactions}\n`;
      }

      res.send(csvContent);
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid format. Use pdf or excel",
      });
    }
  } catch (error) {
    console.error("Download report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error downloading report",
    });
  }
};

// @desc    Schedule report
// @route   POST /api/reports/schedule
// @access  Private/Admin
exports.scheduleReport = async (req, res) => {
  try {
    const { type, frequency, enabled } = req.body;

    // For now, just return success. In a real app, you'd save to a scheduled reports collection
    res.status(200).json({
      success: true,
      message: `${type} report scheduled ${frequency}`,
    });
  } catch (error) {
    console.error("Schedule report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error scheduling report",
    });
  }
};

// @desc    Download user report specifically
// @route   GET /api/reports/users/download
// @access  Private/Admin
exports.downloadUserReport = async (req, res) => {
  try {
    const { format, dateRange } = req.query;
    const { startDate, endDate } = dateRange
      ? JSON.parse(dateRange)
      : {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
        };

    // Generate user report data
    const userData = await generateUserReport(startDate, endDate);

    if (format === "pdf") {
      // Create PDF document
      const doc = new PDFDocument();

      // Set response headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=user-report-${startDate}-to-${endDate}.pdf`
      );

      // Pipe PDF to response
      doc.pipe(res);

      // Add content to PDF
      doc
        .fontSize(24)
        .text("MessMate User Analytics Report", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(12)
        .text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, {
          align: "center",
        });
      doc
        .fontSize(12)
        .text(
          `Date Range: ${new Date(startDate).toLocaleDateString(
            "en-IN"
          )} - ${new Date(endDate).toLocaleDateString("en-IN")}`,
          { align: "center" }
        );
      doc.moveDown(2);

      // Summary section
      doc.fontSize(18).text("Summary Statistics", { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Total Users: ${userData.summary.totalUsers}`);
      doc.fontSize(12).text(`New Users: ${userData.summary.newUsers}`);
      doc.fontSize(12).text(`Active Users: ${userData.summary.activeUsers}`);
      doc
        .fontSize(12)
        .text(`Verified Users: ${userData.summary.verifiedUsers}`);
      doc
        .fontSize(12)
        .text(
          `Active User Percentage: ${userData.summary.activeUserPercentage}%`
        );
      doc.moveDown(2);

      // User distribution by role
      doc.fontSize(18).text("User Distribution by Role", { underline: true });
      doc.moveDown();
      Object.entries(userData.usersByRole).forEach(([role, count]) => {
        const percentage = (
          (count / userData.summary.totalUsers) *
          100
        ).toFixed(1);
        doc
          .fontSize(12)
          .text(
            `${
              role.charAt(0).toUpperCase() + role.slice(1)
            }: ${count} (${percentage}%)`
          );
      });
      doc.moveDown(2);

      // Activity metrics
      doc.fontSize(18).text("Activity Metrics", { underline: true });
      doc.moveDown();
      doc
        .fontSize(12)
        .text(
          `Average Bookings per User: ${userData.activity.avgBookingsPerUser.toFixed(
            1
          )}`
        );
      doc
        .fontSize(12)
        .text(
          `Average Amount per User: ₹${userData.activity.avgAmountPerUser.toFixed(
            2
          )}`
        );
      doc
        .fontSize(12)
        .text(
          `Active Users (with bookings): ${userData.activity.activeUserCount}`
        );
      doc.moveDown(2);

      // Registration trends (last 10 days)
      if (
        userData.registrationTrends &&
        userData.registrationTrends.length > 0
      ) {
        doc
          .fontSize(18)
          .text("Recent Registration Trends", { underline: true });
        doc.moveDown();
        doc.fontSize(12).text("Date\t\t\tRegistrations");
        doc.fontSize(12).text("----------------------------------------");

        userData.registrationTrends.slice(-10).forEach((trend) => {
          const date = `${trend._id.day}/${trend._id.month}/${trend._id.year}`;
          doc.fontSize(12).text(`${date}\t\t\t${trend.count}`);
        });
      }

      // User Details List
      doc.addPage();
      doc.fontSize(18).text("User Details List", { underline: true });
      doc.moveDown();

      // Get actual user details
      const users = await User.find({})
        .select(
          "name email role studentId hostel phone isActive isVerified createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(30); // Limit to first 30 users to avoid huge PDFs

      if (users.length > 0) {
        users.forEach((user, index) => {
          const name = user.name || "N/A";
          const email = user.email || "N/A";
          const role = user.role || "N/A";
          const status = user.isActive ? "Active" : "Inactive";
          const hostel = user.hostel || "N/A";
          const phone = user.phone || "N/A";
          const studentId = user.studentId || "N/A";
          const joinedDate = user.createdAt
            ? new Date(user.createdAt).toLocaleDateString("en-IN")
            : "N/A";

          // User header
          doc.fontSize(14).text(`${index + 1}. ${name}`, { underline: true });
          doc.moveDown(0.5);

          // User details in a structured format
          doc.fontSize(10).text(`Email: ${email}`);
          doc
            .fontSize(10)
            .text(`Role: ${role.charAt(0).toUpperCase() + role.slice(1)}`);
          doc.fontSize(10).text(`Status: ${status}`);
          doc.fontSize(10).text(`Hostel: ${hostel}`);
          doc.fontSize(10).text(`Phone: ${phone}`);
          doc.fontSize(10).text(`Student ID: ${studentId}`);
          doc.fontSize(10).text(`Joined: ${joinedDate}`);

          doc.moveDown(1);

          // Add a separator line
          if (index < users.length - 1) {
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);
          }
        });

        if (users.length === 30) {
          doc.moveDown();
          doc
            .fontSize(10)
            .text(
              "Note: Showing first 30 users. For complete list, use the web interface.",
              { color: "gray" }
            );
        }
      } else {
        doc.fontSize(12).text("No users found in the system.");
      }

      // Finalize PDF
      doc.end();
    } else if (format === "excel") {
      // For Excel, we'll return a CSV format for now
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=user-report-${startDate}-to-${endDate}.csv`
      );

      let csvContent = "Metric,Value\n";
      csvContent += `Total Users,${userData.summary.totalUsers}\n`;
      csvContent += `New Users,${userData.summary.newUsers}\n`;
      csvContent += `Active Users,${userData.summary.activeUsers}\n`;
      csvContent += `Verified Users,${userData.summary.verifiedUsers}\n`;
      csvContent += `Active User Percentage,${userData.summary.activeUserPercentage}%\n`;
      csvContent += `Average Bookings per User,${userData.activity.avgBookingsPerUser.toFixed(
        1
      )}\n`;
      csvContent += `Average Amount per User,₹${userData.activity.avgAmountPerUser.toFixed(
        2
      )}\n`;
      csvContent += `Active Users (with bookings),${userData.activity.activeUserCount}\n`;

      // Add role distribution
      csvContent += "\nRole Distribution\n";
      csvContent += "Role,Count,Percentage\n";
      Object.entries(userData.usersByRole).forEach(([role, count]) => {
        const percentage = (
          (count / userData.summary.totalUsers) *
          100
        ).toFixed(1);
        csvContent += `${role},${count},${percentage}%\n`;
      });

      // Add user details
      csvContent += "\nUser Details\n";
      csvContent +=
        "Name,Email,Role,Status,Hostel,Phone,Student ID,Joined Date\n";

      // Get actual user details
      const users = await User.find({})
        .select(
          "name email role studentId hostel phone isActive isVerified createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(100); // Limit to first 100 users for CSV

      users.forEach((user) => {
        const name = user.name || "N/A";
        const email = user.email || "N/A";
        const role = user.role || "N/A";
        const status = user.isActive ? "Active" : "Inactive";
        const hostel = user.hostel || "N/A";
        const phone = user.phone || "N/A";
        const studentId = user.studentId || "N/A";
        const joinedDate = user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("en-IN")
          : "N/A";

        // Escape commas in CSV
        const escapedName = name.includes(",") ? `"${name}"` : name;
        const escapedEmail = email.includes(",") ? `"${email}"` : email;
        const escapedHostel = hostel.includes(",") ? `"${hostel}"` : hostel;

        csvContent += `${escapedName},${escapedEmail},${role},${status},${escapedHostel},${phone},${studentId},${joinedDate}\n`;
      });

      if (users.length === 100) {
        csvContent +=
          "\nNote: Showing first 100 users. For complete list, use the web interface.\n";
      }

      res.send(csvContent);
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid format. Use pdf or excel",
      });
    }
  } catch (error) {
    console.error("Download user report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error downloading user report",
    });
  }
};

// Helper function to generate user analytics report
const generateUserReport = async (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Get user statistics
  const totalUsers = await User.countDocuments();
  const newUsers = await User.countDocuments({
    createdAt: { $gte: start, $lte: end },
  });

  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  const activeUsers = await User.countDocuments({ isActive: true });
  const verifiedUsers = await User.countDocuments({ isVerified: true });

  // Get user activity data
  const userActivity = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$userId",
        bookingCount: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $group: {
        _id: null,
        avgBookingsPerUser: { $avg: "$bookingCount" },
        avgAmountPerUser: { $avg: "$totalAmount" },
        activeUserCount: { $sum: 1 },
      },
    },
  ]);

  // Get registration trends
  const registrationTrends = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
    },
  ]);

  return {
    summary: {
      totalUsers,
      newUsers,
      activeUsers,
      verifiedUsers,
      activeUserPercentage: ((activeUsers / totalUsers) * 100).toFixed(2),
    },
    usersByRole: usersByRole.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    activity: userActivity[0] || {
      avgBookingsPerUser: 0,
      avgAmountPerUser: 0,
      activeUserCount: 0,
    },
    registrationTrends,
    dateRange: { startDate, endDate },
  };
};

// Helper function to generate sales report
const generateSalesReport = async (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Get payment data
  const salesData = await Payment.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
        totalTransactions: { $sum: 1 },
        avgTransactionValue: { $avg: "$amount" },
      },
    },
  ]);

  // Get booking data
  const bookingData = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: "served",
      },
    },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalQuantity: { $sum: "$quantity" },
        avgOrderValue: { $avg: "$finalAmount" },
      },
    },
  ]);

  // Get top performing items
  const topItems = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: "served",
      },
    },
    {
      $lookup: {
        from: "dailymenus",
        localField: "menuId",
        foreignField: "_id",
        as: "menuDetails",
      },
    },
    { $unwind: "$menuDetails" },
    {
      $group: {
        _id: "$menuDetails._id",
        name: { $first: "$menuDetails.items.name" },
        orders: { $sum: "$quantity" },
        revenue: { $sum: "$finalAmount" },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
  ]);

  // Get daily sales trend
  const dailySales = await Payment.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: "completed",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        revenue: { $sum: "$amount" },
        transactions: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const salesSummary = salesData[0] || {
    totalRevenue: 0,
    totalTransactions: 0,
    avgTransactionValue: 0,
  };

  const bookingSummary = bookingData[0] || {
    totalBookings: 0,
    totalQuantity: 0,
    avgOrderValue: 0,
  };

  return {
    summary: {
      totalRevenue: salesSummary.totalRevenue,
      totalBookings: bookingSummary.totalBookings,
      totalTransactions: salesSummary.totalTransactions,
      averageOrderValue: bookingSummary.avgOrderValue,
      totalQuantity: bookingSummary.totalQuantity,
    },
    topItems: topItems.map((item) => ({
      name: item.name || "Unknown Item",
      orders: item.orders,
      revenue: item.revenue,
    })),
    dailySales,
    dateRange: { startDate, endDate },
  };
};

// Helper function to generate inventory report
const generateInventoryReport = async (startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get inventory data from Inventory collection
    const inventoryData = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$currentStock", "$unitPrice"] } },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ["$currentStock", "$reorderLevel"] }, 1, 0],
            },
          },
          outOfStockItems: {
            $sum: { $cond: [{ $eq: ["$currentStock", 0] }, 1, 0] },
          },
        },
      },
    ]);

    // Get low stock items details using aggregation instead of find
    const lowStockItems = await Inventory.aggregate([
      {
        $match: {
          $expr: { $lte: ["$currentStock", "$reorderLevel"] },
        },
      },
      {
        $project: {
          name: "$itemName", // Use itemName field
          currentStock: 1,
          reorderLevel: 1,
          unit: 1,
          unitPrice: 1,
        },
      },
      { $sort: { currentStock: 1 } },
      { $limit: 20 },
    ]);

    // Get out of stock items
    const outOfStockItems = await Inventory.find({
      currentStock: 0,
    })
      .select("itemName unit unitPrice lastRestocked") // Use itemName field
      .sort({ lastRestocked: -1 })
      .limit(20);

    // Get recent stock movements
    const recentMovements = await Inventory.aggregate([
      {
        $match: {
          lastRestocked: { $gte: start, $lte: end },
        },
      },
      {
        $project: {
          name: "$itemName", // Use itemName field
          lastRestocked: 1,
          currentStock: 1,
          unit: 1,
        },
      },
      { $sort: { lastRestocked: -1 } },
      { $limit: 10 },
    ]);

    const summary = inventoryData[0] || {
      totalItems: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
    };

    return {
      summary: {
        totalItems: summary.totalItems,
        totalStockValue: summary.totalValue,
        lowStockItems: summary.lowStockItems,
        outOfStockItems: summary.outOfStockItems,
      },
      lowStockItems: lowStockItems.map((item) => ({
        name: item.name,
        currentStock: item.currentStock,
        reorderLevel: item.reorderLevel,
        unit: item.unit,
        unitPrice: item.unitPrice,
      })),
      outOfStockItems: outOfStockItems.map((item) => ({
        name: item.itemName, // Use itemName field
        unit: item.unit,
        unitPrice: item.unitPrice,
        lastRestocked: item.lastRestocked,
      })),
      recentMovements: recentMovements.map((item) => ({
        name: item.name,
        currentStock: item.currentStock,
        unit: item.unit,
        lastRestocked: item.lastRestocked,
      })),
      dateRange: { startDate, endDate },
    };
  } catch (error) {
    console.error("Error generating inventory report:", error);

    // Return fallback data if there's an error
    return {
      summary: {
        totalItems: 0,
        totalStockValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
      },
      lowStockItems: [],
      outOfStockItems: [],
      recentMovements: [],
      dateRange: { startDate, endDate },
      error: "Unable to fetch inventory data",
    };
  }
};

// Helper function to generate feedback report
const generateFeedbackReport = async (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Get feedback summary
  const feedbackData = await Feedback.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        avgRating: { $avg: "$rating" },
        positiveReviews: {
          $sum: { $cond: [{ $gte: ["$rating", 4] }, 1, 0] },
        },
        negativeReviews: {
          $sum: { $cond: [{ $lte: ["$rating", 2] }, 1, 0] },
        },
      },
    },
  ]);

  // Get recent feedback
  const recentFeedback = await Feedback.find({
    createdAt: { $gte: start, $lte: end },
  })
    .select("rating comment createdAt user")
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .limit(20);

  // Get rating distribution
  const ratingDistribution = await Feedback.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  const summary = feedbackData[0] || {
    totalReviews: 0,
    avgRating: 0,
    positiveReviews: 0,
    negativeReviews: 0,
  };

  const satisfactionRate =
    summary.totalReviews > 0
      ? ((summary.positiveReviews / summary.totalReviews) * 100).toFixed(1)
      : 0;

  return {
    summary: {
      totalReviews: summary.totalReviews,
      averageRating: summary.avgRating,
      positiveReviews: summary.positiveReviews,
      negativeReviews: summary.negativeReviews,
      satisfactionRate: satisfactionRate,
    },
    recentFeedback: recentFeedback.map((feedback) => ({
      rating: feedback.rating,
      comment: feedback.comment,
      userName: feedback.user?.name || "Anonymous",
      date: feedback.createdAt,
    })),
    ratingDistribution: ratingDistribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    dateRange: { startDate, endDate },
  };
};
