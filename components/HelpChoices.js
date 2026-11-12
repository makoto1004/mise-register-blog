import Link from 'next/link';
import { SERVICES_OPEN, CONSULT_FREE_NOTE, CONSULT_NAME, CONSULT_AVAILABLE } from '@/lib/site';

// 無料（AI無料POSレジ診断）と有料（資料づくりの代行）の 2 つの枠。受付先が未設定のときは枠を消さず「準備中」と出す
export default function HelpChoices() {
  const consultOpen = CONSULT_AVAILABLE;

  return (
    <section className="help-choices" aria-labelledby="help-choices-heading">
      <h2 id="help-choices-heading" className="help-choices-title">
        困ったら
      </h2>
      <div className="help-choices-grid">
        <div className="help-box help-free">
          <p className="help-label">無料</p>
          <h3 className="help-heading">{CONSULT_NAME}</h3>
          <p>選び方・使い方・エラー</p>
          <p className="help-note">{CONSULT_FREE_NOTE}</p>
          {consultOpen ? (
            <Link href="/consult" className="help-button">
              診断してみる
            </Link>
          ) : (
            <p className="help-pending">準備中です</p>
          )}
        </div>
        <div className="help-box help-paid">
          <p className="help-label">有料</p>
          <h3 className="help-heading">資料づくりを頼む</h3>
          <p>CSV・マニュアル・集計表など</p>
          <Link href="/services" className="help-link">
            できること・できないこと
          </Link>
          {!SERVICES_OPEN && <p className="help-pending">受付の準備中です</p>}
        </div>
      </div>
    </section>
  );
}