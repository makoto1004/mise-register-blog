import Link from 'next/link';
import { Cormorant_Garamond } from 'next/font/google';
import Logo from '@/components/Logo';
import { SITE, CATEGORIES, OG_IMAGE } from '@/lib/site';
import './globals.css';

// ロゴの「mise」「&」に使うセリフ体（ビルド時に取り込まれ、サイト内から配信される）
const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: { siteName: SITE.name, locale: 'ja_JP', type: 'website', images: [OG_IMAGE] },
  twitter: { card: 'summary_large_image', images: [OG_IMAGE.url] },
  alternates: { canonical: '/' },
  // Google Search Console の所有権確認（HTML タグ方式）
  ...(googleVerification() ? { verification: { google: googleVerification() } } : {}),
};

// 環境変数の確認用の値を取り出す。<meta … content="…"> のタグをまるごと入れた場合も、content の中身だけを使う
function googleVerification() {
  const raw = (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? process.env.GOOGLE_SITE_VERIFICATION ?? '').trim();
  const match = raw.match(/content\s*=\s*["']([^"']+)["']/i);
  return match ? match[1].trim() : raw;
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={serif.variable}>
      <body id="top">
        <header className="site-header">
          <div className="header-top">
            <Link href="/" className="logo-link" aria-label={`${SITE.name} トップページ`}>
              <Logo />
            </Link>
            <p className="site-catch">{SITE.catchphrase}</p>
          </div>
          <nav className="menu-bar" aria-label="カテゴリー">
            <ul>
              {Object.entries(CATEGORIES).map(([slug, name]) => (
                <li key={slug}>
                  <Link href={`/category/${slug}`} className="underline-link">
                    {name}
                  </Link>
                </li>
              ))}
              <li className="menu-sitemap">
                <Link href="/site-map" className="underline-link">
                  サイトマップ
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        <main className="container">{children}</main>

        <footer id="footer" className="site-footer">
          <div className="footer-inner">
            <section id="footer-categories" className="footer-categories">
              <p className="footer-heading">カテゴリから探す</p>
              <ul>
                {Object.entries(CATEGORIES).map(([slug, name]) => (
                  <li key={slug}>
                    <Link href={`/category/${slug}`} className="underline-link">
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            <p className="footer-catch">{SITE.catchphrase}</p>
            <Link href="/" className="footer-logo" aria-label={`${SITE.name} トップページ`}>
              <Logo />
            </Link>
            <ul className="footer-links">
              <li>
                <Link href="/site-map" className="underline-link">
                  サイトマップ
                </Link>
              </li>
              <li>
                <Link href="/about" className="underline-link">
                  運営者情報・プライバシーポリシー
                </Link>
              </li>
            </ul>
            {/* Amazon アソシエイト・プログラムの規約で求められる表示 */}
            <p className="footer-note">Amazonのアソシエイトとして、当サイトは適格販売により収入を得ています。</p>
            <p className="footer-note">© {SITE.name}</p>
          </div>
        </footer>

        {/* スマホ用：画面下に固定するメニュー */}
        <nav className="bottom-bar" aria-label="クイックメニュー">
          <Link href="/site-map">サイトマップ</Link>
          <Link href="/">トップ</Link>
          <a href="#top" aria-label="ページの先頭へ">↑</a>
        </nav>
      </body>
    </html>
  );
}
