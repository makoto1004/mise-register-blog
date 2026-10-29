import Link from 'next/link';

export const metadata = {
  title: '特定商取引法に基づく表記',
  description: 'mise & register の運営者が提供する、レジまわりの作業代行サービスについての、特定商取引法に基づく表記です。',
  alternates: { canonical: '/legal' },
};

// 作業代行サービス（/services）の特定商取引法に基づく表記
// 氏名・住所・電話番号は、特定商取引法第11条ただし書きにもとづき、請求があったときにメールで開示する形にしている
// （請求が来たら、遅滞なく開示できるようにしておくこと。内容を変えるときは消費者庁の「特定商取引法ガイド」で確認する）
export default function LegalPage() {
  return (
    <article className="article">
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <Link href="/">ホーム</Link> › <span>特定商取引法に基づく表記</span>
      </nav>
      <h1 className="page-title">特定商取引法に基づく表記</h1>
      <div className="post-body">
        <p>
          <Link href="/services">レジまわりの作業代行</Link>についての表記です。
        </p>
        <table>
          <tbody>
            <tr>
              <th>サービスの提供者</th>
              <td>mise &amp; register 運営者（店番）</td>
            </tr>
            <tr>
              <th>氏名・所在地・電話番号</th>
              <td>
                ご請求があれば、メールで遅滞なくお知らせします。<Link href="/contact">お問い合わせフォーム</Link>からご連絡ください。
              </td>
            </tr>
            <tr>
              <th>連絡先</th>
              <td>
                <Link href="/contact">お問い合わせフォーム</Link>（お問い合わせの内容は、メールでお返事します）
              </td>
            </tr>
            <tr>
              <th>料金</th>
              <td>
                <Link href="/services">サービスのページ</Link>に目安を載せています。正式な金額は、ご依頼ごとに見積もりでお知らせします。
              </td>
            </tr>
            <tr>
              <th>料金以外にかかる費用</th>
              <td>振込手数料、インターネットの通信料</td>
            </tr>
            <tr>
              <th>お支払いの方法</th>
              <td>銀行振込</td>
            </tr>
            <tr>
              <th>お支払いの時期</th>
              <td>後払いです。確認用の見本（透かし入りのPDFや画面の写真）をお送りし、内容にご納得いただいてから7日以内にお振込ください。④POSレジの初期設定セットは、手順書（PDF）でお店が設定できたことをご確認いただいてから7日以内です（手順書をお渡ししてから14日たってもご連絡がない場合は、その日から7日以内）。</td>
            </tr>
            <tr>
              <th>サービスの提供時期</th>
              <td>見積もりに書いた納期までに確認用の見本をお送りし、お振込を確認してから完成品をお渡しします。</td>
            </tr>
            <tr>
              <th>見積もりの有効期限</th>
              <td>見積もりをお送りしてから14日間</td>
            </tr>
            <tr>
              <th>キャンセル</th>
              <td>
                作業を始める前のキャンセルは、料金はかかりません。作業を始めたあとのキャンセルは、それまでに終えた作業の分の料金（見積もりの金額が上限）をご相談のうえお支払いいただく場合があります。見本の内容がご依頼と違う場合は、修正で対応します。
              </td>
            </tr>
            <tr>
              <th>納品物に誤りがあった場合</th>
              <td>納品から14日以内にご連絡いただければ、無料で直します。内容の修正のご希望は、2回まで無料で対応します。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}
