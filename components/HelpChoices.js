import Link from 'next/link';
import { SITE, SERVICES_OPEN } from '@/lib/site';

// 無料（AI 相談）と有料（資料づくりの代行）の 2 つの枠。受付先が未設定のときは枠を消さず「準備中」と出す
export default function HelpChoices() {
  const consultOpen = Boolean(SITE.consultFormUrl);

  return (
    <section className="help-choices" aria-labelledby="help-choices-heading">
      <h2 id="help-choices-heading" className="help-choices-title">
        困ったときの相談先
      </h2>
      <div className="help-choices-grid">
        <div className="help-box help-free">
          <p className="help-label">無料</p>
          <h3 className="help-heading">AI に相談する</h3>
          <p>POS レジの選び方・使い方・機器のエラーや障害</p>
          <p className="help-note">相談は最後まで無料です（1か月に3回まで）。相談のあとに料金を請求することはありません。</p>
          {consultOpen ? (
            <Link href="/consult" className="help-button">
              相談してみる
            </Link>
          ) : (
            <p className="help-pending">受付の準備中です</p>
          )}
        </div>
        <div className="help-box help-paid">
          <p className="help-label">有料</p>
          <h3 className="help-heading">資料づくりを頼む</h3>
          <p>商品データの CSV・マニュアル・売上の集計表など</p>
          <Link href="/services" className="help-link">
            できること・できないことを見る
          </Link>
          {!SERVICES_OPEN && <p className="help-pending">受付の準備中です</p>}
        </div>
      </div>
    </section>
  );
}