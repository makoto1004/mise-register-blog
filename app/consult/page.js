import Link from 'next/link';
import { SITE, CONSULT_FREE_NOTE } from '@/lib/site';
import ConsultFormFrame from '@/components/ConsultFormFrame';

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
      <div className="post-body">
        <p className="consult-free-box">
          <strong>{CONSULT_FREE_NOTE}</strong>
        </p>
        <p>AI が作った回答の下書きを運営者が確認し、メールでお返しします。</p>
        <ul>
          <li>
            <strong>氏名・住所・電話番号・カード番号・パスワードなどは書かないでください。</strong>
          </li>
          <li>
            相談内容は、回答を作るために AI サービス（Anthropic の Claude）に送ります。詳しくは<Link href="/about">プライバシーポリシー</Link>をご覧ください。
          </li>
        </ul>
      </div>

      {src ? (
        <ConsultFormFrame src={src} openUrl={SITE.consultFormUrl} />
      ) : (
        <p className="feedback-box">AI相談デスクは準備中です。</p>
      )}

      <div className="post-body">

        <h2>相談できること</h2>
        <ul>
          <li>選び方：POSレジ・周辺機器・ネットワーク機器</li>
          <li>使い方：設定、機器のつなぎ方</li>
          <li>エラーや障害：レジ・プリンター・スキャナーなど</li>
        </ul>
        <p>集客・経営・パソコンや Microsoft 365 の相談にはお答えできません。</p>

        <h2>記入例</h2>
        <table>
          <tbody>
            <tr>
              <th>相談の種類</th>
              <td>プリンター・キャッシュドロア</td>
            </tr>
            <tr>
              <th>相談内容</th>
              <td>混む時間に、レシートプリンターが急に印刷しなくなります。電源を入れ直すと一度は直ります。</td>
            </tr>
            <tr>
              <th>画面やランプの表示</th>
              <td>赤いランプが速く点滅。レジに「プリンターに接続できません」と出る</td>
            </tr>
          </tbody>
        </table>
        <p>エラーの文字は見たとおりに書いてください。写真は受け付けていません。</p>

        <h2>ご利用の前に</h2>
        <ul>
          <li>回答まで数日かかることがあります。</li>
          <li>同じメールアドレスからは1か月に3回までです。</li>
          <li>回答は一般的な情報です。最終的には各メーカー・サービスの公式情報でご確認ください。</li>
          <li>税金・法律・許可などの個別の判断にはお答えできません。</li>
          <li>資料づくりなど有料の作業は別です。<Link href="/services">作業代行のページ</Link>をご覧ください。</li>
        </ul>
      </div>
    </article>
  );
}
