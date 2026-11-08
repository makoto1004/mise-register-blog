// 開業準備チェックリストの「かんたん診断」と「相談文」を作る
// AI は使わず、開業予定日までの日数と、まだ終わっていない項目から決まった文を選ぶ（ブラウザの中だけで動く）
// 文は「〜することがあります」までにとどめ、具体的な日数や料金は書かない（業種・地域・サービスで変わるため）

// 項目ごとの注意。days 以下になってもまだ終わっていなければ出す（上にあるものほど先に出す）
const ITEM_WARNINGS = [
  {
    ids: ['permits'],
    days: 60,
    text: '届出と許可の確認がまだです。手続きに日数がかかることがあるので、早めに公式の窓口で確かめましょう。',
  },
  {
    ids: ['property'],
    days: 60,
    text: '物件がまだ決まっていません。内装や設備の工事の日数も考えて、早めに決めたい項目です。',
  },
  {
    ids: ['pos', 'cashless'],
    days: 21,
    text: 'レジやキャッシュレス決済は、申し込みから使えるようになるまで、審査や機器の配送で日数がかかることがあります。',
  },
  {
    ids: ['network'],
    days: 14,
    text: 'ネットワークがまだです。回線の工事が要るときは、工事の日がすぐには取れないことがあります。',
  },
  {
    ids: ['products'],
    days: 7,
    text: '商品の登録がまだです。商品が多いときは、POSレジによっては表のファイル（CSV）でまとめて登録できます。',
  },
  {
    ids: ['rehearsal'],
    days: 3,
    text: '開店の前に一度、会計から締めまでを通しで練習しておきましょう。',
  },
];

// 項目ごとの注意は、多すぎると読まれないので 3 つまで
const MAX_WARNINGS = 3;

const yen = (n) => `${Math.round(n).toLocaleString('ja-JP')}円`;

// 診断の文を作る。level は good（順調）・info（目安）・warn（急ぎ）
export function diagnose({ days, remainingIds }) {
  const remaining = remainingIds.length;
  if (remaining === 0) return [];
  if (days === null) {
    return [{ level: 'info', text: '開業予定日を入れると、残りの日数に合わせて、先に進めたほうがいい準備をお知らせします。' }];
  }
  if (days < 0) {
    return [{ level: 'info', text: '開業予定日を過ぎています。まだの項目は、お店を回しながら少しずつ進めましょう。' }];
  }

  const results = [];
  const perItem = days / remaining;
  if (perItem < 2) {
    results.push({
      level: 'warn',
      text: `あと${days}日で${remaining}項目が残っています。1項目に使える日数は2日もありません。下の急ぎの項目から進めましょう。`,
    });
  } else if (perItem >= 7) {
    results.push({ level: 'good', text: `あと${days}日で残り${remaining}項目です。今のところ、日数には余裕があります。` });
  } else {
    results.push({
      level: 'info',
      text: `あと${days}日で残り${remaining}項目です。1項目に${Math.floor(perItem)}日ほどのペースで進めると間に合います。`,
    });
  }

  const remainingSet = new Set(remainingIds);
  ITEM_WARNINGS.filter((w) => days <= w.days && w.ids.some((id) => remainingSet.has(id)))
    .slice(0, MAX_WARNINGS)
    .forEach((w) => results.push({ level: 'warn', text: w.text }));
  return results;
}

// AI相談デスクのフォームに貼る相談文を作る
// 名前・連絡先などは入れない（フォームの内容は AI に送られるため）
export function buildConsultText({ categoryLabel, openDate, days, doneCount, total, remainingByStage, totals }) {
  const lines = ['【開業準備チェックリストの状況】'];
  if (categoryLabel) lines.push(`お店の種類：${categoryLabel}`);
  if (openDate) {
    const when = days === null ? '' : days >= 0 ? `（あと${days}日）` : `（${-days}日前に過ぎました）`;
    lines.push(`開業予定日：${openDate.replaceAll('-', '/')}${when}`);
  }
  lines.push(`進み具合：${total}項目のうち${doneCount}項目が完了`);
  if (remainingByStage.length > 0) {
    lines.push('まだの項目：');
    remainingByStage.forEach((stage) => lines.push(`・${stage.name}：${stage.titles.join('、')}`));
  }
  if (totals) {
    lines.push(`初期費用シミュレーターの合計：初期費用 ${yen(totals.initialTotal)}、毎月 ${yen(totals.monthlyTotal)}`);
  }
  lines.push('', '【相談したいこと】', '（ここに書いてください）');
  return lines.join('\n');
}
