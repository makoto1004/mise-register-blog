import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'AI相談デスク（無料）｜POSレジ・スキャナー・プリンター・ネットワーク',
  description:
    'POSレジ・ハンディターミナル・バーコードリーダー・プリンター・業務用Android端末・お店のネットワーク機器の困りごとを、フォームから無料で相談できます。AI が作った回答を運営者が確認して、メールでお返しします。',
  alternates: { canonical: '/consult' },
};

// Google フォームの URL から、埋め込み用の URL を作る（?embedded=true を付ける）
function embedUrl(url) {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith('google.com')) return '';
    u.searchParams.set('embedded', 'true');
    return u.toString();
  } catch {
    return '';
  }
}

// AI 相談デスク（無料）のページ（フォーム入力 → AI の下書きを運営者が確認 → メールで回答）
export default function ConsultPage() {
  const src = SITE.consultFormUrl ? embedUrl(SITE.consultFormUrl) : '';

  return (
    <article className="article">
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <Link href="/">ホーム</Link> › <span>AI相談デスク</span>
      </nav>
      <h1 className="page-title">AI相談デスク</h1>
      <img
        className="consult-hero"
        src="/images/consult-desk.webp"
        width={1200}
        height={674}
        alt="相談の手紙を持つレシートプリンターのレジまると、親指を立てるタブレットのPOSレジのポスタが、受付のカウンターに並んでいる手描きのイラスト"
      />
      <div className="post-body">
        <p>
          「mise &amp; register AI相談デスク」では、お店のレジまわりの困りごとを、下のフォームから無料で相談できます。AI アシスタントの「レジまる」（プリンター・スキャナーなどの担当）と「ポスタ」（POSレジ・決済端末・ネットワークなどの担当）が回答の下書きを作り、運営者が内容を確認してから、メールでお返しします。
        </p>

        <h2>相談できること</h2>
        <ul>
          <li>POSレジ・決済端末（選び方・使い方・設定・トラブル）</li>
          <li>ハンディターミナル・バーコードリーダー・モバイルスキャナー</li>
          <li>レシートプリンター・ラベルプリンター・キャッシュドロア</li>
          <li>業務用のAndroid端末（Android Enterprise を含む）</li>
          <li>ネットワーク機器（Wi-Fiアクセスポイント・ルーター・スイッチ・LAN配線）</li>
        </ul>
        <p>これ以外のご相談（集客・メニュー・経営全般、Windowsパソコン・Microsoft 365 の相談など）にはお答えできません。</p>

        <h2>ご利用の前に</h2>
        <ul>
          <li>運営者が確認してからお送りするため、回答まで数日かかることがあります。</li>
          <li>ご相談は、同じメールアドレスから1か月に3回までとさせていただきます。</li>
          <li>回答は一般的な情報です。製品の仕様・料金・設定は変わることがあるため、最終的には各メーカー・サービスの公式情報やサポート窓口でご確認ください。</li>
          <li>税金・法律・許可などの個別の判断にはお答えできません。</li>
          <li>
            <strong>氏名・住所・電話番号・クレジットカード番号・パスワードなどは書かないでください。</strong>
          </li>
          <li>
            相談内容は、回答を作るために AI サービス（Anthropic の Claude）に送ります。詳しくは<Link href="/about">プライバシーポリシー</Link>をご覧ください。
          </li>
          <li>内容によっては、お答えできない場合があります。</li>
        </ul>
      </div>

      {src ? (
        <iframe className="contact-frame" src={src} title="AI相談デスクのフォーム" loading="lazy">
          読み込んでいます…
        </iframe>
      ) : (
        <p className="feedback-box">AI相談デスクは準備中です。</p>
      )}
    </article>
  );
}
