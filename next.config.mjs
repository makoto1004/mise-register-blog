/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static Export: `next build` で out/ に静的 HTML を出力する
  output: 'export',
  // /posts/hello → out/posts/hello.html として出力（public/.htaccess のクリーンURL設定と対応）
  trailingSlash: false,
  // Static Export では画像最適化サーバーが使えないため無効化
  images: { unoptimized: true },
};

export default nextConfig;
