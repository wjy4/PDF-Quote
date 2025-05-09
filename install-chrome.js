const puppeteer = require("puppeteer");

puppeteer
  .createBrowserFetcher()
  .download("1363265") // puppeteer v24.8.2 对应的 Chromium revision
  .then((revisionInfo) => {
    console.log("Downloaded Chromium:", revisionInfo.executablePath);
  })
  .catch((err) => {
    console.error("Chromium download failed", err);
    process.exit(1);
  });
