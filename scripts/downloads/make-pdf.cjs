// レジ締めチェック表の HTML を、Chrome で A4 の PDF に印刷して public/downloads/ に置く
// 使い方: node scripts/downloads/make-pdf.cjs <playwright-core のフォルダ>
//   playwright-core はブログの依存に入れていない（ビルドを重くしないため）。手元に入れた場所を渡す
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require(path.join(process.argv[2] ?? '', 'node_modules', 'playwright-core'));

const SRC = path.join(__dirname, 'register-closing-checklist.html');
const OUT = path.join(__dirname, '..', '..', 'public', 'downloads', 'register-closing-checklist.pdf');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage();
  // 外への通信はしない（ファイルの中だけで完結する）
  await page.route(/^https?:/, (r) => r.abort());
  await page.goto(pathToFileURL(SRC).href);
  await page.pdf({ path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: true });
  const pages = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight / (297 * 96 / 25.4 - 2 * 10 * 96 / 25.4)));
  console.log('pdf ok', OUT, '（目安のページ数', pages, '）');
  await browser.close();
})();
