const express = require("express");
const multer = require("multer");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const puppeteer = require("puppeteer-core");
const chromium = require("chrome-aws-lambda");

const app = express();
const upload = multer();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

console.log("✅ App started!");

// 服务配置
const SERVICES = {
  self: {
    zh: {
      "Year-end Accounts": "年度财务报告",
      "Personal Tax Returns": "个人税申报",
      "Payroll Services (x4)": "员工税申报 (x4)",
      Pension: "养老金",
      "VAT Returns (x4)": "增值税申报 (x4)",
      "Accountant Letter (x2)": "会计师证明信 (x2)",
      "All Registrations": "包括所有注册 (VAT, PAYE, SA)",
      "Tax Planning": "税务规划和咨询",
    },
    en: {
      "Year-end Accounts": "Year-end Accounts",
      "Personal Tax Returns": "Personal Tax Returns",
      "Payroll Services (x4)": "Payroll Services (upto and incl. 4)",
      Pension: "Pension",
      "VAT Returns (x4)": "VAT Returns (x4)",
      "Accountant Letter (x2)": "Accountant Letter (x2)",
      "All Registrations": "Include all registrations (VAT, PAYE, SA)",
      "Tax Planning": "Tax Planning / Consultancy",
    },
  },
  company: {
    zh: {
      "Confirmation Statement": "公司年审",
      "Year-end Accounts": "年度财务报告",
      "Company Tax Returns": "公司税申报",
      "Payroll Services (x4)": "员工税申报 (x4)",
      Pension: "养老金",
      "Director Self Assessment (x2)": "董事个人税申报 (x2)",
      "VAT Returns": "增值税申报",
      "Accountant Letter (x2)": "会计师证明信 (x2)",
      "All Registrations": "包括所有注册 (VAT, PAYE, LTD, SA)",
      "Tax Planning": "税务规划和咨询",
    },
    en: {
      "Confirmation Statement": "Confirmation Statement",
      "Year-end Accounts": "Year-end Accounts",
      "Company Tax Returns": "Company Tax Returns",
      "Payroll Services (x4)": "Payroll Services (upto and incl. 4)",
      Pension: "Pension",
      "Director Self Assessment (x2)": "Director Self Assessment (x2)",
      "VAT Returns": "VAT Returns",
      "Accountant Letter (x2)": "Accountant Letter (x2)",
      "All Registrations": "Include all registrations (VAT, PAYE, LTD, SA)",
      "Tax Planning": "Tax Planning / Consultancy",
    },
  },
};

function formatDate(date) {
  if (!date) return "--";
  return `${date.year}年${date.month}月${date.day}日`;
}

function readBase64Image(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "base64") : null;
}

app.post("/generate-pdf", async (req, res) => {
  const { clientType, packageType, services, fromDate, toDate } = req.body;

  const PRICING = {
    self: {
      basic: 900,
      vat: 1500,
      premium: 2100,
    },
    company: {
      basic: 1200,
      vat: 1800,
      premium: 2400,
    },
  };

  const allServices = Object.keys(SERVICES[clientType].en);
  const included = services;
  const excluded = allServices.filter((s) => !included.includes(s));
  const fee = PRICING[clientType]?.[packageType] || "N/A";

  const logoTopBase64 = readBase64Image(
    path.join(__dirname, "public", "logo-top.png")
  );
  const logoBottomBase64 = readBase64Image(
    path.join(__dirname, "public", "logo-bottom.png")
  );
  const fullDate = `${formatDate(fromDate)} – ${formatDate(toDate)}`;

  const html = `
    <html lang="zh">
      <head>
        <meta charset="UTF-8">
        <style>
          @font-face {
            font-family: 'Calibri';
            font-style: normal;
            font-weight: normal;
            src: local('Calibri'), local('微软雅黑'), sans-serif;
          }
          body {
            font-family: 'Calibri', '微软雅黑', sans-serif;
            padding: 40px;
            line-height: 1.7;
            font-size: 14px;
            background: #fff;
            color: #000;
          }
          h1, h3, p {
            margin: 0;
            padding: 0;
          }
          ul { padding-left: 20px; margin-top: 0.5em; }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .company-info {
            flex: 1;
            line-height: 1.6;
          }
          .logo-wrap {
            display: flex;
            gap: 10px;
          }
          .logo {
            max-height: 80px;
            max-width: 180px;
            object-fit: contain;
          }
          .date {
            margin-top: 0.5em;
            text-decoration: underline;
          }
          .section-title {
            margin-top: 1.2em;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>AZD ACCOUNTANTS LTD</h1>
            <h3>德佳会计事务所</h3>
            <p>公司编号 Company Number: 14986915</p>
            <p>地址 Address：7 Charlotte Street, Manchester, England, M1 4DZ</p>
            <p>电话 Phone: +44 (0) 7511 450 777</p>
            <p>邮箱 Email: info@azdaccountants.co.uk</p>
            <p class="date">日期：${fullDate}</p>
          </div>
          <div class="logo-wrap">
            ${
              logoTopBase64
                ? `<img src="data:image/png;base64,${logoTopBase64}" class="logo" />`
                : ""
            }
            ${
              logoBottomBase64
                ? `<img src="data:image/png;base64,${logoBottomBase64}" class="logo" />`
                : ""
            }
          </div>
        </div>

        <p style="margin-top: 1.5em;">您好，我总结一下我们的服务协议，公司年费为 £${fee}，我们提供的服务包括：</p>

        <ol>
        ${included
          .map(
            (s) =>
              `<li>${SERVICES[clientType].zh[s]} / ${SERVICES[clientType].en[s]}</li>`
          )
          .join("")}
        </ol>

        <p class="section-title">不包括的有：</p>
        <ol>
           ${excluded
             .map(
               (s) =>
                 `<li>${SERVICES[clientType].zh[s]} / ${SERVICES[clientType].en[s]}</li>`
             )
             .join("")}
        </ol>

        <p><strong>These will be charged separately. 这些服务将单独计费。</strong></p>
      </body>
    </html>
  `;

  try {
    const puppeteer = require("puppeteer");

    // 使用 puppeteer 自带的 Chromium
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=quote.pdf`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("生成失败:", err);
    res.status(500).json({ error: "PDF 生成失败" });
  }
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/puppeteer-test", async (req, res) => {
  try {
    const path = await chromium.executablePath;
    res.json({ chromiumExecutable: path });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
