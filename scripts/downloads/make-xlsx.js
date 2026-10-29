// レジ締めチェック表のスプレッドシート版を作る（枚数などを入れると、合計と差額を自動で計算する）
// 使い方: NODE_PATH=<exceljs を入れたフォルダ>/node_modules node scripts/downloads/make-xlsx.js
//   exceljs はブログの依存に入れていない（ビルドを重くしないため）。項目は register-closing-checklist.html（印刷用）とそろえる
const path = require('path')
const ExcelJS = require('exceljs')

const OUT = path.join(__dirname, '..', '..', 'public', 'downloads', 'register-closing-checklist.xlsx')

const wb = new ExcelJS.Workbook()
wb.creator = 'mise & register'
const ws = wb.addWorksheet('レジ締め', { pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 1 } })

const FONT = 'Yu Gothic'
const INPUT = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF6D6' } } // 入力する所（うすい黄色）
const CALC = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } } // 自動で計算する所（うすい灰色）
const thin = { style: 'thin', color: { argb: 'FF888888' } }
const box = { top: thin, left: thin, bottom: thin, right: thin }
const yen = '#,##0"円"'
const RED = { font: { color: { argb: 'FFC0392B' }, bold: true } }

ws.columns = [{ width: 30 }, { width: 12 }, { width: 16 }, { width: 3 }, { width: 30 }, { width: 15 }, { width: 15 }, { width: 13 }]
ws.properties.defaultRowHeight = 20

const put = (addr, value, opt = {}) => {
  const c = ws.getCell(addr)
  c.value = value
  c.font = { name: FONT, size: opt.size ?? 11, bold: opt.bold ?? false, color: opt.color ? { argb: opt.color } : undefined }
  if (opt.fill) c.fill = opt.fill
  if (opt.border) c.border = box
  if (opt.fmt) c.numFmt = opt.fmt
  c.alignment = { vertical: 'middle', horizontal: opt.align ?? 'left', wrapText: true }
  return c
}
const heading = (addr, text) => put(addr, text, { bold: true, size: 12 })

// 確認の行：左に文、右の「済」の欄で選ぶ
const addCheck = (r, text) => {
  put(`A${r}`, text, { border: true }); ws.mergeCells(`A${r}:E${r}`)
  const c = put(`F${r}`, '', { fill: INPUT, border: true, align: 'center' })
  c.dataValidation = { type: 'list', allowBlank: true, formulae: ['"済,－"'] }
}

put('A1', 'レジ締めチェック表', { size: 16, bold: true })
put('A2', '黄色の所に入力すると、灰色の所が自動で計算されます。日付ごとにシートをコピーして使い、精算レシートといっしょに保管しましょう。', { size: 9, color: 'FF555555' })
ws.mergeCells('A2:H2')
put('A3', '日付', { bold: true }); put('B3', '', { fill: INPUT, border: true }); ws.mergeCells('B3:C3')
put('E3', '締めた人／確かめた人', { bold: true }); put('F3', '', { fill: INPUT, border: true }); put('G3', '', { fill: INPUT, border: true })

// 0. 締める前に
heading('A5', '0. 締める前に（POSレジの画面で。済んだら「済」を選ぶ）')
addCheck(6, '取り消し・返品・訂正の伝票に問題がない')
addCheck(7, '送られていない会計データがない（通知が出ていないか）')

// 1. 金種表
heading('A9', '1. 現金を数える（金種表）')
;['お札・硬貨', '枚数', '金額'].forEach((t, i) => put(`${'ABC'[i]}10`, t, { bold: true, fill: CALC, border: true, align: 'center' }))
const DENOMS = [10000, 5000, 2000, 1000, 500, 100, 50, 10, 5, 1]
DENOMS.forEach((d, i) => {
  const r = 11 + i
  put(`A${r}`, d, { border: true, fmt: '#,##0"円"' })
  put(`B${r}`, null, { fill: INPUT, border: true, fmt: '#,##0"枚"', align: 'right' })
  put(`C${r}`, { formula: `A${r}*B${r}` }, { fill: CALC, border: true, fmt: yen, align: 'right' })
})
put('A21', '営業中に金庫などへ移した現金', { border: true, size: 10 }); ws.mergeCells('A21:B21')
put('C21', null, { fill: INPUT, border: true, fmt: yen, align: 'right' })
put('A22', '数えた現金の合計（A）', { bold: true, border: true, fill: CALC }); ws.mergeCells('A22:B22')
put('C22', { formula: 'SUM(C11:C21)' }, { bold: true, border: true, fill: CALC, fmt: yen, align: 'right' })
put('A23', '商品券・クーポン券は現金とまぜずに分けて数えます。', { size: 9, color: 'FF555555' }); ws.mergeCells('A23:C23')

// 2. あるはずの現金
heading('E9', '2. あるはずの現金を計算する')
const rows = [
  ['B 開店時の釣り銭（準備金）', null, INPUT],
  ['C 現金の売上（POSレジの記録）', null, INPUT],
  ['D 営業中の入金（両替など）', null, INPUT],
  ['E 営業中の出金（買い出しなど）', null, INPUT],
  ['F あるはずの現金（B＋C＋D－E）', { formula: 'F10+F11+F12-F13' }, CALC],
  ['差額（A－F）', { formula: 'C22-F14' }, CALC],
]
rows.forEach(([label, v, fill], i) => {
  const r = 10 + i
  put(`E${r}`, label, { border: true, bold: fill === CALC })
  put(`F${r}`, v, { fill, border: true, fmt: yen, align: 'right', bold: fill === CALC })
})
put('G15', { formula: 'IF(F15=0,"合っています",IF(F15>0,"多い（現金が多い）","少ない（現金が足りない）"))' }, { size: 10, bold: true })
ws.mergeCells('G15:H15')
// 差額が0でないときは赤く表示する
ws.addConditionalFormatting({ ref: 'F15:G15', rules: [{ type: 'expression', formulae: ['$F$15<>0'], style: RED }] })

// 3. キャッシュレス
heading('E17', '3. キャッシュレスを見比べる')
;['支払い方法', 'POSレジ', '決済の管理画面', '差'].forEach((t, i) => put(`${'EFGH'[i]}18`, t, { bold: true, fill: CALC, border: true, align: 'center' }))
;['クレジットカード', 'QRコード決済', '電子マネー', 'その他（商品券など）'].forEach((t, i) => {
  const r = 19 + i
  put(`E${r}`, t, { border: true })
  put(`F${r}`, null, { fill: INPUT, border: true, fmt: yen, align: 'right' })
  put(`G${r}`, null, { fill: INPUT, border: true, fmt: yen, align: 'right' })
  put(`H${r}`, { formula: `F${r}-G${r}` }, { fill: CALC, border: true, fmt: yen, align: 'right' })
})
ws.addConditionalFormatting({ ref: 'H19:H22', rules: [{ type: 'expression', formulae: ['H19<>0'], style: RED }] })
put('E23', '「差」が0でなければ、支払い方法の登録まちがいを確かめる', { size: 9, color: 'FF555555' })
ws.mergeCells('E23:H23')

// 4. 差額が出たら
heading('A25', '4. 差額が出たら、上から順に確かめる（済んだら「済」を選ぶ）')
;[
  '金種ごとに数え直した（お札の重なり、硬貨の積み方、商品券がまざっていないか）',
  '金庫などへ移した現金も数えた（交代のときの伝え忘れはないか）',
  '開店時の釣り銭（B）が、いつもの金額と同じ',
  '営業中の入金・出金（D・E）を、すべて記録した',
  'キャッシュレスの会計を「現金」で登録していない（3の表の「差」が0か）',
  '会計忘れ・二重の会計・取り消し忘れがない（返品のときに現金を戻したかも）',
  '値引き・クーポンがレジに入っている（口頭で値引きして、入れ忘れていないか）',
  '差額が、どれかの会計のお釣りと同じ金額ではない（お釣りの渡し間違いの手がかり）',
].forEach((t, i) => addCheck(26 + i, t))
put('A34', '差額の理由・気づいたこと', { bold: true })
put('A35', '', { fill: INPUT, border: true }); ws.mergeCells('A35:H36')

// 5. 店じまい
heading('A38', '5. 店じまい')
addCheck(39, '翌日の釣り銭を残した（金額は右へ。毎日同じ金額に決めておくと迷いません）')
put('G39', null, { fill: INPUT, border: true, fmt: yen, align: 'right' })
addCheck(40, '売上金を取り出した（A－翌日の釣り銭。右に自動で出ます）')
put('G40', { formula: 'IF(G39="","",C22-G39)' }, { fill: CALC, border: true, fmt: yen, align: 'right', bold: true })
addCheck(41, '表・裏の出入口と、小さな窓の鍵を閉めた')

put('A43', 'mise & register（https://www.mise-register.com/）｜お店の中で自由にコピーして使えます。再配布・販売はご遠慮ください。', { size: 9, color: 'FF555555' })
ws.mergeCells('A43:H43')

ws.getRow(35).height = 28
ws.getRow(36).height = 28
ws.views = [{ showGridLines: false }]

wb.xlsx.writeFile(OUT).then(() => console.log('xlsx ok', OUT))
