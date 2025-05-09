// const multer = require("multer");
// const cors = require("cors");
// const pdfParse = require("pdf-parse");
// const path = require("path");

// const app = express();
// const upload = multer();

// app.use(cors());
// app.use(express.static(path.join(__dirname, "public")));

// // 智能推荐函数
// function recommendServices({ revenue, turnover }) {
//   const revenueNum = parseFloat(revenue.replace(/[^0-9.]/g, "")) || 0;
//   const turnoverNum = parseFloat(turnover.replace(/[^0-9.]/g, "")) || 0;

//   const services = [];

//   if (revenueNum >= 85000) {
//     services.push("建议注册 VAT（增值税）");
//   } else {
//     services.push("不强制注册 VAT，可视业务类型考虑");
//   }

//   if (revenueNum >= 10000) {
//     services.push("建议使用年度公司财务报表服务");
//   }

//   if (turnoverNum > 0) {
//     services.push("建议考虑 PAYE 薪资处理或账务外包服务");
//   }

//   if (revenueNum < 50000) {
//     services.push("适合使用简易税务申报服务");
//   }

//   return services;
// }

// app.post("/upload", upload.single("pdf"), async (req, res) => {
//   try {
//     const data = await pdfParse(req.file.buffer);
//     const text = data.text;

//     const nameMatch = text.match(/(Company Name|公司名称)[:：]?\s*(.*)/);
//     const revenueMatch = text.match(
//       /(Annual Revenue|年收入)[:：]?\s*([£￥]?\s?[\d,\.]+)/
//     );
//     const turnoverMatch = text.match(
//       /(Turnover|营业额)[:：]?\s*([£￥]?\s?[\d,\.]+)/
//     );

//     const companyName = nameMatch ? nameMatch[2].trim() : "未识别";
//     const revenue = revenueMatch ? revenueMatch[2].trim() : "未识别";
//     const turnover = turnoverMatch ? turnoverMatch[2].trim() : "未识别";

//     // 提取货币单位
//     const currencySymbol = revenue.includes("£")
//       ? "GBP"
//       : revenue.includes("￥") || revenue.includes("¥")
//       ? "CNY"
//       : "UNKNOWN";

//     // 推荐服务
//     const recommendedServices =
//       revenue !== "未识别" && turnover !== "未识别"
//         ? recommendServices({ revenue, turnover })
//         : [];

//     res.json({
//       company_name: companyName,
//       annual_revenue: revenue,
//       turnover,
//       currency: currencySymbol,
//       recommended_services: recommendedServices,
//     });
//   } catch (err) {
//     res.status(500).json({ error: "解析失败", detail: err.message });
//   }
// });

// app.listen(3000, () => {
//   console.log("🚀 Server running at http://localhost:3000");
// });
// index.js (Node.js 后端)

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse");
const path = require("path");

const app = express();
const upload = multer();

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// 智能推荐函数
function recommendServices({ revenue, turnover }) {
  const revenueNum = parseFloat(revenue.replace(/[^0-9.]/g, "")) || 0;
  const turnoverNum = parseFloat(turnover.replace(/[^0-9.]/g, "")) || 0;

  const services = [];

  if (revenueNum >= 85000) {
    services.push("建议注册 VAT（增值税）");
  } else {
    services.push("不强制注册 VAT，可视业务类型考虑");
  }

  if (revenueNum >= 10000) {
    services.push("建议使用年度公司财务报表服务");
  }

  if (turnoverNum > 0) {
    services.push("建议考虑 PAYE 薪资处理或账务外包服务");
  }

  if (revenueNum < 50000) {
    services.push("适合使用简易税务申报服务");
  }

  return services;
}

app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    const data = await pdfParse(req.file.buffer);
    const text = data.text;

    const nameMatch = text.match(/(Company Name|公司名称)[:：]?\s*(.*)/);
    const revenueMatch = text.match(
      /(Annual Revenue|年收入)[:：]?\s*([£￥]?\s?[\d,\.]+)/
    );
    const turnoverMatch = text.match(
      /(Turnover|营业额)[:：]?\s*([£￥]?\s?[\d,\.]+)/
    );

    const companyName = nameMatch ? nameMatch[2].trim() : "未识别";
    const revenue = revenueMatch ? revenueMatch[2].trim() : "未识别";
    const turnover = turnoverMatch ? turnoverMatch[2].trim() : "未识别";

    // 提取货币单位
    const currencySymbol = revenue.includes("£")
      ? "GBP"
      : revenue.includes("￥") || revenue.includes("¥")
      ? "CNY"
      : "UNKNOWN";

    // 推荐服务
    const recommendedServices =
      revenue !== "未识别" && turnover !== "未识别"
        ? recommendServices({ revenue, turnover })
        : [];

    res.json({
      company_name: companyName,
      annual_revenue: revenue,
      turnover,
      currency: currencySymbol,
      recommended_services: recommendedServices,
    });
  } catch (err) {
    res.status(500).json({ error: "解析失败", detail: err.message });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});

app.get("/ping", (req, res) => {
  res.send("pong");
});
