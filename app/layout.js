import Link from 'next/link';
import { SITE, CATEGORIES } from '@/lib/site';
import './globals.css';

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: { siteName: SITE.name, locale: 'ja_JP', type: 'website' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body id="top">
        <header className="site-header">
          <div className="header-top">
            <p className="site-name">
              <Link href="/">{SITE.name}</Link>
            </p>
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
            </ul>
          </nav>
        </header>

        <main className="container">{children}</main>

        <footer id="footer" className="site-footer">
          <div className="footer-inner">
            <section id="footer-categories" className="footer-categories">
              <p className="footer-heading">カテゴリ検索</p>
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
            <p className="footer-sitename">
              <Link href="/" className="underline-link">
                {SITE.name}
              </Link>
            </p>
            <ul className="footer-links">
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
          <a href="#footer-categories">カテゴリ検索</a>
          <Link href="/">記事一覧</Link>
          <a href="#top" aria-label="ページの先頭へ">↑</a>
        </nav>
      </body>
    </html>
  );
}
