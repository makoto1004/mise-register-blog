import Link from 'next/link';
import { Cormorant_Garamond } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import Logo from '@/components/Logo';
import { InstagramHeaderLink } from '@/components/XLinks';
import XHeaderTimeline from '@/components/XHeaderTimeline';
import SiteMotion from '@/components/SiteMotion';
import { SITE, CATEGORIES, OG_IMAGE, SERVICES_OPEN } from '@/lib/site';
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
  twitter: {
    card: 'summary_large_image',
    site: `@${SITE.xAccount}`,
    creator: `@${SITE.xAccount}`,
    images: [OG_IMAGE.url],
  },
  alternates: { canonical: '/' },
  // Google Search Console の所有権確認（HTML タグ方式）。確認用の値が複数あれば、タグを複数出す
  verification: { google: googleVerifications() },
  // Google AdSense のサイト確認（メタタグ方式）
  other: { 'google-adsense-account': SITE.adsenseClient },
};

// Google アナリティクスの測定 ID（G-XXXXXXXXXX）。未設定なら読み込まない
// 測定用のタグをまるごと貼った場合や、前後に空白・引用符がある場合も、G- で始まる部分だけを取り出す
const GA_ID = ((process.env.NEXT_PUBLIC_GA_ID ?? '').toUpperCase().match(/G-[A-Z0-9]+/) ?? [''])[0];

// 確認用の値の一覧。環境変数の値（以前のプロパティ用）と、下の値を合わせる
// 環境変数に <meta … content="…"> のタグをまるごと入れた場合も、content の中身だけを使う
function googleVerifications() {
  // Search Console の確認用の値（公開してよい値）。https://www.mise-register.com/ の URL プレフィックスのプロパティ用
  const SEARCH_CONSOLE_VERIFICATIONS = ['ZpSSIAZb_QGa0d7C_FxX60zmsYlSj-JNrSx3PEPOGiE'];
  const raw = (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? process.env.GOOGLE_SITE_VERIFICATION ?? '').trim();
  const match = raw.match(/content\s*=\s*["']([^"']+)["']/i);
  const fromEnv = match ? match[1].trim() : raw;
  return [...new Set([fromEnv, ...SEARCH_CONSOLE_VERIFICATIONS].filter(Boolean))];
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={serif.variable}>
      <head>
        {/* Impact（Shopify のアフィリエイト）のサイト確認用のタグ。Impact は content ではなく value で読むため、そのまま書く */}
        <meta name="impact-site-verification" value="0a53640a-dc73-49f8-9b75-7d581548b146" />
        {/* Google AdSense の広告コード（審査と広告の表示に使う） */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}`}
          crossOrigin="anonymous"
        />
      </head>
      <body id="top">
        <header className="site-header">
          <div className="header-top">
            <Link href="/" className="logo-link" aria-label={`${SITE.name} トップページ`}>
              <Logo />
            </Link>
            <p className="site-catch">{SITE.catchphrase}</p>
            <div className="header-social">
              <InstagramHeaderLink />
              <XHeaderTimeline account={SITE.xAccount} />
            </div>
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
              <li>
                <Link href="/search" className="underline-link">
                  記事を探す
                </Link>
              </li>
              <li className="menu-sitemap">
                <Link href="/site-map" className="underline-link">
                  サイトマップ
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        <main className="container">{children}</main>
        {/* スクロールでふわっと出す動き・記事の読んだ位置のバー（GSAP） */}
        <SiteMotion />

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
                <a
                  href={`https://x.com/${SITE.xAccount}`}
                  className="underline-link"
                  target="_blank"
                  rel="noopener noreferrer me"
                >
                  X（@{SITE.xAccount}）
                </a>
              </li>
              <li>
                <a
                  href={`https://www.instagram.com/${SITE.instagramAccount}/`}
                  className="underline-link"
                  target="_blank"
                  rel="noopener noreferrer me"
                >
                  Instagram（@{SITE.instagramAccount}）
                </a>
              </li>
              {/* AI 無料相談は、フォームの URL を設定してからリンクを出す */}
              {SITE.consultFormUrl && (
                <li>
                  <Link href="/consult" className="underline-link">
                    AI相談デスク
                  </Link>
                </li>
              )}
              {/* 有料の作業代行は、受付先（ココナラか見積もり依頼フォーム）の URL を設定してからリンクを出す */}
              {SERVICES_OPEN && (
                <li>
                  <Link href="/services" className="underline-link">
                    レジまわりの作業代行
                  </Link>
                </li>
              )}
              {/* 特定商取引法に基づく表記は、ブログで直接受けるときだけ必要（ココナラ経由はココナラの仕組みで取引する） */}
              {SITE.orderFormUrl && !SITE.coconalaUrl && (
                <li>
                  <Link href="/legal" className="underline-link">
                    特定商取引法に基づく表記
                  </Link>
                </li>
              )}
              <li>
                <Link href="/contact" className="underline-link">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/about" className="underline-link">
                  運営者情報・プライバシーポリシー
                </Link>
              </li>
            </ul>
            {/* 運営者のひとこと紹介（くわしくは運営者情報のページのプロフィール） */}
            <p className="footer-profile">
              運営者：相談デスクの店番（POSレジ・周辺機器・ネットワークの検証／ヘルプデスク）{' '}
              <Link href="/about#profile" className="underline-link">
                プロフィール
              </Link>
            </p>
            {/* Amazon アソシエイト・プログラムの規約で求められる表示 */}
            <p className="footer-note">Amazonのアソシエイトとして、当サイトは適格販売により収入を得ています。</p>
            <p className="footer-note">© {SITE.name}</p>
          </div>
        </footer>

        {/* スマホ用：画面下に固定するメニュー */}
        <nav className="bottom-bar" aria-label="クイックメニュー">
          <Link href="/site-map">サイトマップ</Link>
          <Link href="/search">記事を探す</Link>
          <Link href="/">トップ</Link>
          <a href="#top" aria-label="ページの先頭へ">↑</a>
        </nav>
      </body>
      {/^G-[A-Z0-9]+$/.test(GA_ID) && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
