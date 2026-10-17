'use client';

import { useMemo, useState } from 'react';

// 初期費用シミュレーター（ブラウザで動く計算機）
// 初期値は「10坪前後の小さなお店」を想定した目安（出典を確認できた金額のレンジの中ほど）。
// 出典のない項目は空欄にして、読者が見積もりの金額を入力する。
//
// 項目の書き方:
//   def   … 1 つあたりの目安の金額（なければ空欄）
//   qty   … 数量を選べる項目の、最初の数量（指定した項目だけ「×数量」を表示）
//   off   … 最初はチェックを外しておく項目
//   hint  … 補足（目安の出典など）

const COMMON_INITIAL = [
  { id: 'tablet', label: 'iPad・タブレット', def: 50000, qty: 1, hint: '新品のタブレットは5万円程度（スマレジ）。手持ちの端末を使うなら0円' },
  { id: 'stand', label: 'タブレットスタンド' },
  { id: 'printer', label: 'レシートプリンター', def: 50000, hint: '5万円程度。モバイル型は2〜5万円（スマレジ）' },
  { id: 'drawer', label: 'キャッシュドロア・手提げ金庫', def: 15000, hint: '現金を入れるだけなら1〜2万円程度（スマレジ）' },
  { id: 'reader', label: '決済端末（カードリーダー）', def: 20000, qty: 1, hint: '一般的には5,000円〜3万円程度（スマレジ）' },
  { id: 'scanner', label: 'バーコードスキャナー', def: 15000, off: true, hint: '1万5,000円〜5万円（スマレジ）。物販がなければ不要' },
  { id: 'network', label: 'Wi-Fiルーター・回線の工事' },
  { id: 'supplies', label: 'ロール紙などの消耗品' },
];

// 店舗を借りる業種の物件まわりの初期費用（キッチンカー以外）
const STORE_INITIAL = [
  { id: 'property', label: '物件の取得費（保証金・敷金・礼金・仲介手数料など）' },
  { id: 'interior', label: '内装工事費' },
];

const CATEGORY_INITIAL = {
  cafe: [
    { id: 'property', label: '物件の取得費（保証金・仲介手数料・前家賃など）', def: 2000000, hint: '10坪・居抜きで150万〜250万円（会計事務所の解説記事）' },
    { id: 'interior', label: '内装工事費', def: 2250000, hint: '10坪・居抜きの部分改装で150万〜300万円（同上）' },
    { id: 'kitchen', label: '厨房機器（冷蔵庫・製氷機など）', def: 1400000, hint: '居抜きの残置設備を活かして80万〜200万円（同上）' },
    { id: 'coffee', label: 'コーヒーマシン・グラインダー', hint: '上の厨房機器の目安に含めて考えてもよい' },
    { id: 'furniture', label: 'テーブル・チェア', def: 400000, hint: '什器・食器・備品で50万〜80万円（同上）のうち家具の分' },
    { id: 'tableware', label: '食器・テイクアウト容器', def: 250000, hint: '同上のうち食器・備品の分' },
    { id: 'order', label: 'モバイルオーダーなどの導入費用', off: true },
  ],
  salon: [
    ...STORE_INITIAL,
    { id: 'shampoo', label: 'シャンプー台（給排水・給湯の工事は内装工事費へ）', def: 300000, qty: 1, hint: '1台20万〜80万円以上（miiiy）' },
    { id: 'station', label: 'セット面（鏡・カウンター・スタイリングチェア）', def: 120000, qty: 2, hint: '1面5万〜20万円前後（miiiy）' },
    { id: 'beautytools', label: 'ドライヤー（サロン用）', def: 50000, qty: 2, hint: '1台2万〜8万円程度（miiiy）' },
    { id: 'waiting', label: '待合のソファ・テーブル' },
    { id: 'karte', label: 'カルテ用のiPad・ケース' },
    { id: 'reserve', label: '予約システムの導入費用', off: true },
  ],
  'kitchen-car': [
    {
      id: 'vehicle',
      label: 'キッチンカーの車両（購入・製作）',
      def: 3000000,
      hint: '新車の車両費用は300万〜700万円程度（フランチャイズ情報サイト）。レンタルなら外す',
    },
    {
      id: 'rental',
      label: 'レンタルする場合のレンタル料（借りる期間分の合計）',
      off: true,
      hint: '1日1万5千〜3万円程度（マネーフォワードの解説記事）。購入する場合は外したまま',
    },
    { id: 'power', label: 'ポータブル電源・発電機' },
    { id: 'sign', label: '看板・のぼり' },
    { id: 'permit', label: '営業許可の手数料など' },
  ],
  apparel: [
    { id: 'property', label: '物件の取得費（保証金・敷金・礼金・仲介手数料など）', hint: '20坪・家賃50万円の例で300万〜500万円（STORES）。小さなお店は家賃に合わせて入力' },
    { id: 'interior', label: '内装工事費', hint: '20坪の例で200万〜600万円（STORES）' },
    { id: 'fixtures', label: 'ハンガーラック・棚などの什器', def: 400000, hint: '20坪の例で80万円（STORES）。10坪なら半分ほどを目安に' },
    { id: 'fitting', label: '試着室・鏡' },
    { id: 'lighting', label: '照明' },
    { id: 'label', label: 'ラベルプリンター・タグガン' },
    { id: 'stock', label: '最初の仕入れ', def: 1500000, hint: '100万〜200万円（STORES）' },
  ],
  devices: [...STORE_INITIAL],
};

// 毎月の費用（全業種共通）
const MONTHLY = [
  { id: 'pos', label: 'POSレジの月額', def: 0, hint: '無料プランなら0円' },
  { id: 'line', label: '通信費（回線・モバイルルーター）' },
  { id: 'accounting', label: '会計ソフトの月額（年額 ÷ 12）' },
  { id: 'staff', label: '人件費（アルバイト・スタッフ）', qty: 1, hint: '1人あたりの月の金額。1人で営業するならチェックを外す' },
];

// 店舗を借りる業種の毎月の費用（キッチンカー以外）
const STORE_MONTHLY = [
  { id: 'rent', label: '家賃（共益費・管理費を含む）', hint: '物件の家賃を入力' },
  { id: 'utilities', label: '水道光熱費' },
];

// 業種ごとの毎月の費用
const CATEGORY_MONTHLY = {
  cafe: [
    ...STORE_MONTHLY,
    { id: 'food', label: '食材費（コーヒー豆・牛乳・フードの材料など）' },
    { id: 'packaging', label: 'テイクアウト容器・紙ナプキンなどの消耗品' },
  ],
  salon: [
    ...STORE_MONTHLY,
    { id: 'materials', label: '材料費（カラー剤・パーマ液・シャンプーなど）' },
    { id: 'retail', label: '店販商品の仕入れ' },
    { id: 'linen', label: 'タオル・ケープなどのリネン・洗濯代' },
  ],
  'kitchen-car': [
    { id: 'food', label: '食材費' },
    { id: 'packaging', label: '容器・割り箸などの消耗品' },
    { id: 'venue', label: '出店料（イベント・場所の利用料）', qty: 1, hint: '1回あたりの金額 × 月の出店回数' },
    { id: 'fuel', label: '燃料費（ガソリン・調理用のガスなど）' },
    { id: 'parking', label: '駐車場代' },
    { id: 'kitchen', label: '仕込み場所の利用料', hint: '自前の施設なら0円' },
    { id: 'insurance', label: '自動車保険（年額 ÷ 12）' },
  ],
  apparel: [
    ...STORE_MONTHLY,
    { id: 'restock', label: '商品の仕入れ' },
    { id: 'shopper', label: 'ショッパー・値札などの消耗品' },
  ],
  devices: [...STORE_MONTHLY],
};

// 目安の出典（シミュレーターの下に表示）
const SOURCES = {
  common: [{ label: 'スマレジ「POSレジの価格・費用相場」（2026年6月更新）', url: 'https://smaregi.jp/learn/pos_price.php' }],
  cafe: [{ label: '会計事務所の解説記事「カフェ開業の資金はいくら？」（2026年9月更新）', url: 'https://axlcpa.jp/cafe-kaigyo-shikin/' }],
  salon: [{ label: 'miiiy「美容室開業に必要な設備一覧」', url: 'https://www.miiiy.com/journal/opening/beauty-salon-equipment/' }],
  apparel: [{ label: 'STORES「アパレルショップを開業するには？」（2026年1月）', url: 'https://stores.fun/magazine/articles/apparel-store-opening' }],
  'kitchen-car': [
    { label: 'フランチャイズ情報サイト「キッチンカーフランチャイズの開業資金」', url: 'https://fc-platform.jp/kitchencar-fc-cost/' },
    { label: 'マネーフォワード「キッチンカーレンタルの料金相場」', url: 'https://biz.moneyforward.com/restaurant/basic/292/' },
  ],
};

const QTY_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

const yen = (n) => `${Math.round(n).toLocaleString('ja-JP')}円`;
const toNumber = (value) => {
  const n = Number(String(value ?? '').replace(/[,，円\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const formatDefault = (n) => (typeof n === 'number' ? n.toLocaleString('ja-JP') : '');

function ItemRow({ item, value, qty, checked, onChange, onQty, onToggle }) {
  return (
    <li className="sim-row">
      <label className="sim-check">
        <input type="checkbox" checked={checked} onChange={onToggle} />
        <span>
          {item.label}
          {item.hint && <span className="sim-hint">{item.hint}</span>}
        </span>
      </label>
      <span className="sim-input">
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={value}
          disabled={!checked}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${item.label}の金額`}
        />
        円
        {item.qty !== undefined && (
          <select
            className="sim-qty"
            value={qty}
            disabled={!checked}
            onChange={(e) => onQty(Number(e.target.value))}
            aria-label={`${item.label}の数量`}
          >
            {QTY_OPTIONS.map((n) => (
              <option key={n} value={n}>
                ×{n}
              </option>
            ))}
          </select>
        )}
      </span>
    </li>
  );
}

const initialState = (items) => ({
  values: Object.fromEntries(items.map((item) => [item.id, formatDefault(item.def)])),
  qty: Object.fromEntries(items.filter((item) => item.qty !== undefined).map((item) => [item.id, item.qty])),
  unchecked: Object.fromEntries(items.filter((item) => item.off).map((item) => [item.id, true])),
});

export default function CostSimulator({ category }) {
  const initialItems = useMemo(
    () => [...(CATEGORY_INITIAL[category] ?? STORE_INITIAL), ...COMMON_INITIAL],
    [category],
  );
  const monthlyItems = useMemo(
    () => [...(CATEGORY_MONTHLY[category] ?? STORE_MONTHLY), ...MONTHLY],
    [category],
  );
  const sources = [...(SOURCES[category] ?? []), ...SOURCES.common];

  // 初期費用と毎月の費用で同じ id（例: kitchen）があっても混ざらないよう、別々に持つ
  const [init, setInit] = useState(() => initialState(initialItems));
  const [monthly, setMonthly] = useState(() => initialState(monthlyItems));
  const [sales, setSales] = useState('');
  const [rate, setRate] = useState('');

  const handlers = (setter) => ({
    setValue: (id) => (v) => setter((s) => ({ ...s, values: { ...s.values, [id]: v } })),
    setQty: (id) => (n) => setter((s) => ({ ...s, qty: { ...s.qty, [id]: n } })),
    toggle: (id) => () => setter((s) => ({ ...s, unchecked: { ...s.unchecked, [id]: !s.unchecked[id] } })),
  });
  const initH = handlers(setInit);
  const monthlyH = handlers(setMonthly);

  const sum = (items, state) =>
    items.reduce(
      (total, item) =>
        total + (state.unchecked[item.id] ? 0 : toNumber(state.values[item.id]) * (state.qty[item.id] ?? 1)),
      0,
    );

  const initialTotal = sum(initialItems, init);
  const fee = (toNumber(sales) * Number(String(rate).replace(/[%％\s]/g, '') || 0)) / 100;
  const monthlyTotal = sum(monthlyItems, monthly) + (Number.isFinite(fee) ? fee : 0);
  const firstYear = initialTotal + monthlyTotal * 12;

  const reset = () => {
    setInit(initialState(initialItems));
    setMonthly(initialState(monthlyItems));
    setSales('');
    setRate('');
  };
  const clearAll = () => {
    setInit((s) => ({ ...s, values: Object.fromEntries(initialItems.map((i) => [i.id, ''])) }));
    setMonthly((s) => ({ ...s, values: Object.fromEntries(monthlyItems.map((i) => [i.id, ''])) }));
    setSales('');
    setRate('');
  };

  const renderRows = (items, state, h) =>
    items.map((item) => (
      <ItemRow
        key={item.id}
        item={item}
        value={state.values[item.id] ?? ''}
        qty={state.qty[item.id] ?? 1}
        checked={!state.unchecked[item.id]}
        onChange={h.setValue(item.id)}
        onQty={h.setQty(item.id)}
        onToggle={h.toggle(item.id)}
      />
    ));

  return (
    <section className="cost-sim" aria-labelledby="cost-sim-title">
      <h2 id="cost-sim-title">初期費用シミュレーター</h2>
      <p className="sim-lead">
        はじめから入っている金額は、<strong>10坪前後の小さなお店</strong>を想定した目安です（下の出典の金額レンジの中ほど）。
        必要なものにチェックを入れ、見積もりの金額や数量に書き換えると、初期費用と毎月の費用の合計を計算できます。空欄の項目は、お店に合わせて入力してください。
      </p>
      <div className="sim-actions">
        <button type="button" onClick={reset}>
          目安の金額に戻す
        </button>
        <button type="button" onClick={clearAll}>
          金額をすべて空にする
        </button>
      </div>

      <h3 className="sim-heading">初期費用</h3>
      <ul className="sim-list">{renderRows(initialItems, init, initH)}</ul>

      <h3 className="sim-heading">毎月の費用</h3>
      <ul className="sim-list">
        {renderRows(monthlyItems, monthly, monthlyH)}
        <li className="sim-row sim-fee">
          <span>
            キャッシュレス決済の手数料
            <span className="sim-hint">手数料率は契約する決済サービスの公式サイトで確認</span>
          </span>
          <span className="sim-fee-inputs">
            <span className="sim-input">
              月の売上（キャッシュレス分）
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={sales}
                onChange={(e) => setSales(e.target.value)}
                aria-label="月のキャッシュレス売上"
              />
              円
            </span>
            <span className="sim-input">
              ×
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                aria-label="決済手数料率"
                className="sim-rate"
              />
              %
            </span>
          </span>
        </li>
      </ul>

      <dl className="sim-result" aria-live="polite">
        <div>
          <dt>初期費用の合計</dt>
          <dd>{yen(initialTotal)}</dd>
        </div>
        <div>
          <dt>毎月の費用の合計</dt>
          <dd>{yen(monthlyTotal)}</dd>
        </div>
        <div className="sim-total">
          <dt>1年目の合計（初期費用 ＋ 毎月の費用 × 12）</dt>
          <dd>{yen(firstYear)}</dd>
        </div>
      </dl>
      <p className="sim-note">
        ※ 目安は公開情報の金額レンジから選んだ参考値で、地域・物件・機種によって大きく変わります。実際の費用は、各サービス・販売店・工事業者の見積もりで確認してください。
      </p>
      <p className="sim-note">目安の出典：</p>
      <ul className="sim-sources">
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
