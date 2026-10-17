'use client';

import { useMemo, useState } from 'react';

// 初期費用シミュレーター（ブラウザで動く計算機）
// 金額の初期値は入れない（価格は変わるため）。読者が見積もりや商品ページの金額を入力して合計を出す。
// hint は出典を確認できた目安だけを書く。

const COMMON_INITIAL = [
  { id: 'tablet', label: 'iPad・タブレット', hint: '手持ちの端末を使うなら0円' },
  { id: 'stand', label: 'タブレットスタンド' },
  { id: 'printer', label: 'レシートプリンター' },
  { id: 'drawer', label: 'キャッシュドロア・手提げ金庫' },
  { id: 'reader', label: '決済端末（カードリーダー）' },
  { id: 'scanner', label: 'バーコードスキャナー', hint: '物販がなければ不要' },
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
    ...STORE_INITIAL,
    { id: 'kitchen', label: '厨房機器（冷蔵庫・製氷機など）' },
    { id: 'coffee', label: 'コーヒーマシン・グラインダー' },
    { id: 'furniture', label: 'テーブル・チェア' },
    { id: 'tableware', label: '食器・テイクアウト容器' },
    { id: 'order', label: 'モバイルオーダーなどの導入費用' },
  ],
  salon: [
    ...STORE_INITIAL,
    { id: 'shampoo', label: 'シャンプー台（給排水・給湯の工事を含む）' },
    { id: 'station', label: 'セット椅子・鏡（セット面）' },
    { id: 'beautytools', label: 'ドライヤー・スチーマーなどの美容機器' },
    { id: 'waiting', label: '待合のソファ・テーブル' },
    { id: 'karte', label: 'カルテ用のiPad・ケース' },
    { id: 'reserve', label: '予約システムの導入費用' },
  ],
  'kitchen-car': [
    {
      id: 'vehicle',
      label: 'キッチンカーの車両（購入・製作）',
      hint: '新車の車両費用は300万〜700万円程度という目安あり（フランチャイズ情報サイト）',
    },
    {
      id: 'rental',
      label: 'レンタルする場合のレンタル料（借りる期間分の合計）',
      hint: '1日1万5千〜3万円程度という目安あり（マネーフォワードの解説記事）。購入する場合はチェックを外す',
    },
    { id: 'power', label: 'ポータブル電源・発電機' },
    { id: 'sign', label: '看板・のぼり' },
    { id: 'permit', label: '営業許可の手数料など' },
  ],
  apparel: [
    ...STORE_INITIAL,
    { id: 'fixtures', label: 'ハンガーラック・棚などの什器' },
    { id: 'fitting', label: '試着室・鏡' },
    { id: 'lighting', label: '照明' },
    { id: 'label', label: 'ラベルプリンター・タグガン' },
    { id: 'stock', label: '最初の仕入れ' },
  ],
  devices: [...STORE_INITIAL],
};

// 毎月の費用（全業種共通）
const MONTHLY = [
  { id: 'pos', label: 'POSレジの月額', hint: '無料プランなら0円' },
  { id: 'line', label: '通信費（回線・モバイルルーター）' },
  { id: 'accounting', label: '会計ソフトの月額（年額 ÷ 12）' },
  { id: 'staff', label: '人件費（アルバイト・スタッフ）', hint: '1人で営業するなら0円' },
];

// 店舗を借りる業種の毎月の費用（キッチンカー以外）
const STORE_MONTHLY = [
  { id: 'rent', label: '家賃（共益費・管理費を含む）' },
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
    { id: 'venue', label: '出店料（イベント・場所の利用料）' },
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

const yen = (n) => `${Math.round(n).toLocaleString('ja-JP')}円`;
const toNumber = (value) => {
  const n = Number(String(value).replace(/[,，円\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

function ItemRow({ item, value, checked, onChange, onToggle }) {
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
      </span>
    </li>
  );
}

export default function CostSimulator({ category }) {
  const initialItems = useMemo(
    () => [...(CATEGORY_INITIAL[category] ?? []), ...COMMON_INITIAL],
    [category],
  );
  const monthlyItems = useMemo(
    () => [...(CATEGORY_MONTHLY[category] ?? STORE_MONTHLY), ...MONTHLY],
    [category],
  );

  const [values, setValues] = useState({});
  const [unchecked, setUnchecked] = useState({});
  const [sales, setSales] = useState('');
  const [rate, setRate] = useState('');

  const isChecked = (id) => !unchecked[id];
  const setValue = (id) => (v) => setValues((prev) => ({ ...prev, [id]: v }));
  const toggle = (id) => () => setUnchecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const sum = (items) => items.reduce((total, item) => total + (isChecked(item.id) ? toNumber(values[item.id]) : 0), 0);

  const initialTotal = sum(initialItems);
  const fee = (toNumber(sales) * Number(String(rate).replace(/[%％\s]/g, '') || 0)) / 100;
  const monthlyTotal = sum(monthlyItems) + (Number.isFinite(fee) ? fee : 0);
  const firstYear = initialTotal + monthlyTotal * 12;

  return (
    <section className="cost-sim" aria-labelledby="cost-sim-title">
      <h2 id="cost-sim-title">初期費用シミュレーター</h2>
      <p className="sim-lead">
        必要なものにチェックを入れ、見積もりや商品ページの金額を入力すると、初期費用と毎月の費用の合計を計算できます。
        価格は変わるため、金額は入っていません。
      </p>

      <h3 className="sim-heading">初期費用</h3>
      <ul className="sim-list">
        {initialItems.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            value={values[item.id] ?? ''}
            checked={isChecked(item.id)}
            onChange={setValue(item.id)}
            onToggle={toggle(item.id)}
          />
        ))}
      </ul>

      <h3 className="sim-heading">毎月の費用</h3>
      <ul className="sim-list">
        {monthlyItems.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            value={values[item.id] ?? ''}
            checked={isChecked(item.id)}
            onChange={setValue(item.id)}
            onToggle={toggle(item.id)}
          />
        ))}
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
        ※ 計算結果は入力した金額をもとにした目安です。実際の費用は、各サービス・販売店の見積もりで確認してください。
      </p>
    </section>
  );
}
