// 運営者が BOOTH で販売しているテンプレート（Excel・PowerPoint・PDF。/templates のページと、記事の最後の案内に使う）
// 記事のフロントマターでは `ownTemplates: [ledger]` のようにキーで指定する。
// 中身は BOOTH の販売ページと同じ事実だけを書く（元の文：ドキュメント\templates\B-sales-summary・C-store-it-ledger の 販売ページ.md）
// ファイルはブログに置かず、BOOTH の商品ページへのリンクだけにする。POS レジの機種名・サービス名は書かない
// 画像は BOOTH の商品画像を 900px の webp にしたもの（架空のカフェの見本データ）

export const OWN_TEMPLATES = {
  ledger: {
    id: 'ledger',
    name: 'お店の IT 管理台帳',
    catch: '機器・保証期限・障害記録・毎日の点検表を、Excel 1 冊に',
    summary:
      'レジまわりの機器の場所と保証・契約の期限、止まったときの記録、毎日・毎月の点検を、1 冊の Excel にまとめて管理できるテンプレートです。',
    features: [
      '機器を 1 台 1 行で記録（管理番号・型番・シリアル番号・階・置き場所・つなぎ方・保証や契約が終わる日など）。期限切れは赤、90日以内はだいだい色で、今日の日付から毎日計算し直します',
      '止まったときは障害記録に 1 件 1 行。その場でしたこと・連絡した先と受付番号・原因・同じことを防ぐ対策を書け、直った日時を入れると止まっていた時間が出ます',
      '1 か月分の点検表に ○・×・休 を付けられます。A4 横 1 枚で印刷して、レジ横で紙のまま使うこともできます',
      '年と月を入れると、その月の障害の件数・止まっていた時間・期限が近い機器の台数などをまとめます',
    ],
    contents: 'Excel 1 冊（シート 8 枚）を、架空のカフェの記入例入りと空のファイルの 2 つ',
    environment: 'Microsoft Excel（Windows 版で動作を確認）／Google スプレッドシート（計算と色分けが同じになることを確認）',
    price: '1,980円（税込）',
    boothUrl: 'https://mise-register.booth.pm/items/9123442',
    images: [
      { src: '/images/templates/ledger-1.webp', alt: '見本：お店の IT 管理台帳の表紙。点検表の 18 日に × が付いている' },
      { src: '/images/templates/ledger-2.webp', alt: '見本：機器台帳。保証が切れた機器は赤、90日以内の機器はだいだい色になっている' },
      { src: '/images/templates/ledger-3.webp', alt: '見本：点検表。18 日の開店前の × から、障害記録の 4 件目につながる' },
      { src: '/images/templates/ledger-4.webp', alt: '見本：障害記録と、10 月のまとめ（障害 4 件・止まっていた時間 1:15）' },
    ],
  },
  sales: {
    id: 'sales',
    name: '売上集計シート',
    catch: 'POS レジの売上明細を貼るだけで、客数・客単価・ABC分析まで',
    summary:
      'POS レジから書き出した売上明細を貼り付け、年と月を入れると、今月と前月の比較や商品別ランキングを自動で集計する Excel のテンプレートです。',
    features: [
      '今月と前月の比較（売上・客数・客単価・営業日数・1日平均と、前月比）',
      '日別・時間帯別・曜日別の売上と、商品別ランキング（ABC分析）・支払い方法ごとの割合',
      '毎日のレジ締めの記録。数えた現金を入れると、差額と「合っています／多い／少ない」が出ます',
      '客数と客単価は、明細に会計番号（レシート番号など）があるときに計算します',
    ],
    contents: '空のシートと、架空のカフェの 2 か月分の見本データ入りのシートの 2 つ',
    environment:
      'Microsoft Excel（Windows 版で動作を確認）／Google スプレッドシート（集計・レジ締めの数字は同じ。グラフのシートは表示が崩れるため、グラフは Excel で見るのがおすすめです）',
    price: '1,980円（税込）',
    boothUrl: 'https://mise-register.booth.pm/items/9123677',
    images: [
      { src: '/images/templates/sales-1.webp', alt: '見本：売上集計シートの表紙と、時間帯別の売上のグラフ' },
      { src: '/images/templates/sales-2.webp', alt: '見本：今月と前月の売上・客数・客単価を比べた表' },
      { src: '/images/templates/sales-3.webp', alt: '見本：商品別ランキングと A・B・C のランク' },
      { src: '/images/templates/sales-4.webp', alt: '見本：明細を書き出して貼り、年と月を入れる 3 ステップ' },
    ],
  },
  // 2026-11-17 追加（元の文：ドキュメント\templates\D-pos-selection・E-setup-checklist・DE-set の 販売ページ.md）
  pos: {
    id: 'pos',
    name: 'POSレジ選びワークシート',
    catch: 'お店の条件から、比べる項目・周辺機器・3年の費用まで',
    summary:
      'お店の条件を整理して、気になる POS レジを比べるための Excel のテンプレートです。これからお店を開く方に向けて作りました。',
    features: [
      '業種・営業の場所・レジのまわり（水・汚れ・屋外・電源）・予算などを選ぶと、比べる 21 項目に「必要」「あると便利」が自動で付きます。項目ごとに「なぜ」の説明があります',
      '周辺機器 10 種類に「必要」「検討」「いらない」が自動で付きます',
      '気になる POS レジを 3 つまで入れ、項目ごとに ○・×・要確認 を選ぶと、数が自動で集計されます',
      '端末・周辺機器・初期費用・月々の料金・決済手数料を入れると、1 か月・1 年・3 年の合計と、予算との差が出ます。候補 3 つを A4 横 1 枚で印刷できます',
    ],
    contents: 'Excel（シート 7 枚）を、架空のキッチンカーの記入例入りと空のファイルの 2 つ（記入例の料金は架空です）',
    environment: 'Microsoft Excel（Windows 版で動作を確認）',
    price: '1,480円（税込）',
    boothUrl: 'https://mise-register.booth.pm/items/9168250',
    images: [
      { src: '/images/templates/pos-1.webp', alt: '見本：POSレジ選びワークシートの表紙' },
      { src: '/images/templates/pos-2.webp', alt: '見本：お店の条件を入れると、比べる項目に「必要」「あると便利」が付く' },
      { src: '/images/templates/pos-3.webp', alt: '見本：周辺機器に「必要」「検討」「いらない」が付く' },
      { src: '/images/templates/pos-4.webp', alt: '見本：候補 3 つを並べて、3 年の費用まで比べるまとめ' },
    ],
  },
  setup: {
    id: 'setup',
    name: '開店前のレジ設定チェック表＋スタッフ用早見表',
    catch: '開店前の設定 36 項目・試しの会計・スタッフの権限表',
    summary:
      'POS レジを決めたあと、開店前の設定を順番に確かめて、スタッフと手順を共有するための Excel のテンプレートです。',
    features: [
      '9 つの分け方で 36 項目を確かめられます。項目ごとに「なぜ」と「確かめ方」があり、まだの項目はだいだい色になります',
      '8% の品だけ・10% の品だけ・両方の 3 通りの試しの会計で、レシートに載るべきことを 10 項目で確かめられます（国税庁のタックスアンサー No.6625 をもとにしています）',
      'スタッフ 10 人まで、会計・取り消し・返品・値引きなど 7 つの操作を誰ができるかを記録できます',
      'お店のレジでの手順と、止まったときの連絡先を書いた早見表を、A4 縦 1 枚で印刷できます。機種ごとの操作手順は入っていないので、お店のレジを見ながら書き込みます',
    ],
    contents: 'Excel（シート 6 枚）を、架空のカフェの記入例入りと空のファイルの 2 つ',
    environment: 'Microsoft Excel（Windows 版で動作を確認）',
    price: '980円（税込）',
    boothUrl: 'https://mise-register.booth.pm/items/9168283',
    images: [
      { src: '/images/templates/setup-1.webp', alt: '見本：開店前のレジ設定チェック表の表紙' },
      { src: '/images/templates/setup-2.webp', alt: '見本：開店前のチェック表。まだの項目はだいだい色' },
      { src: '/images/templates/setup-3.webp', alt: '見本：3 通りの試しの会計で、レシートに載るべきことを確かめる表' },
      { src: '/images/templates/setup-4.webp', alt: '見本：レジの横に置くスタッフ用早見表' },
    ],
  },
  set: {
    id: 'set',
    name: '開業準備セット（POSレジ選びワークシート＋開店前のレジ設定チェック表）',
    catch: 'POS レジ選びから開店前の設定まで。別々に買うより 480 円お得',
    summary:
      '上の「POSレジ選びワークシート」と「開店前のレジ設定チェック表＋スタッフ用早見表」の 2 つをまとめたセットです。中身はそれぞれと同じです。',
    features: [
      'まず「POSレジ選びワークシート」で、お店に合う POS レジと周辺機器を比べて決めます',
      '決めたら「開店前のレジ設定チェック表」で、設定を順番に進めて確かめます',
      '最後に「スタッフ用早見表」に、お店のレジでの手順を書いて印刷し、レジの横に置きます',
    ],
    contents: 'Excel 4 つ（2 つのテンプレートの、記入例入りと空のファイル）',
    environment: 'Microsoft Excel（Windows 版で動作を確認）',
    price: '1,980円（税込）',
    boothUrl: 'https://mise-register.booth.pm/items/9168291',
    images: [
      { src: '/images/templates/pos-1.webp', alt: '見本：POSレジ選びワークシートの表紙' },
      { src: '/images/templates/setup-1.webp', alt: '見本：開店前のレジ設定チェック表の表紙' },
    ],
  },
  // 2026-11-19 追加。Excel ではなく PDF とテキスト（元の文：ドキュメント\templates\F-ai-prompts\販売ページ_貼る用.txt）
  // 見本は架空のカフェで ChatGPT・Claude に実際に出させた文。サービス名（ChatGPT・Claude）は POS レジではないので書いてよい
  aiprompts: {
    id: 'aiprompts',
    name: '小さなお店の「AI に頼む文」集',
    catch: 'SNS・メニュー・口コミ返信・POP。空欄をうめて、AI に貼るだけ',
    summary:
      'お店の文章づくりを ChatGPT や Claude に手伝ってもらうための「頼み方の型」と、実際に AI が出した見本をまとめた PDF です。',
    features: [
      'SNS の投稿・メニューや商品の説明・口コミへの返信・POP の文章の 4 つ。型は「命令・前提条件・入力・出力」の 4 項目で、【　】に店名や伝えたいことを入れて貼ります',
      '使い道ごとに、架空のカフェで試した見本つき。AI が出した文を、直さずに載せています',
      '試したときに実際に起きた失敗（値段が抜けた・文字数を超えた など）と、使う前に確かめる 7 項目',
      'ChatGPT・Claude の無料版で始める手順と、AI に入れてはいけない情報',
    ],
    contents: 'PDF（A4・13 ページ）と、写す用のテキストファイル',
    environment: 'PDF とテキストファイルを開けるパソコンかスマホ／ChatGPT や Claude などの AI のアカウント（無料版で使えます）',
    price: '980円（税込）',
    boothUrl: 'https://mise-register.booth.pm/items/9176163',
    images: [
      { src: '/images/templates/aiprompts-1.webp', alt: '見本：「AI に頼む文集」の表紙。SNS の投稿・メニューの説明・口コミへの返信・POP の文章' },
      { src: '/images/templates/aiprompts-2.webp', alt: '見本：POP の型の【　】をうめて送ると、Claude がこう返した例' },
      { src: '/images/templates/aiprompts-3.webp', alt: '見本：使う前に確かめる一覧と、試したときに実際に起きた失敗' },
      { src: '/images/templates/aiprompts-4.webp', alt: '見本：入っているもの。PDF 13 ページと写す用のテキスト' },
    ],
  },
  // 2026-11-25 追加。Excel ではなく PowerPoint と PDF（元の文：ドキュメント\templates\H-remote-work-flow\販売ページ_貼る用.txt）
  remoteflow: {
    id: 'remoteflow',
    name: 'リモートワークのフロー図（お店用・事務員用）',
    catch: 'レジやネットが止まったとき、つながらない・あやしいときに見る図',
    summary:
      '店長が家にいる日のお店のスタッフ向けと、在宅で働く事務員向けの、A4 縦のフロー図 2 枚です。文字と箱を書き換えられます。',
    features: [
      'お店用：会計できるかを確かめ、止まったもの（端末・アプリ、お店のネット、レジの会社、カードなど、停電）ごとにすることを並べています。家にいる店長がすることは緑の箱です',
      '事務員用：あやしいこと（お金を求める画面・急に開けないファイル・あやしい添付）がなかったかを最初に確かめ、あったときにすることを 4 つの順番で示しています',
      '事務員用には、会社の画面につながらないときの確かめ方と、直らないときに担当者へ知らせる内容もあります（一般的な手順です）',
      'PowerPoint は箱を動かすと矢印も付いてきます。PDF は印刷して、連絡先を手で書けます。パスワードを書く欄はありません',
    ],
    contents: 'PowerPoint と PDF（どちらも A4 縦・2 ページ）を、空の版と記入例の版の 2 つずつ',
    environment: '書き換えには Microsoft PowerPoint が必要です（Windows 版で作成。Mac・Google スライドでは確かめていません）／PDF は PDF を見られるソフトで開けます',
    price: '500円（税込）',
    boothUrl: 'https://mise-register.booth.pm/items/9219500',
    images: [
      { src: '/images/templates/remoteflow-1.webp', alt: '見本：リモートワークのフロー図の表紙。お店用と事務員用の 2 枚' },
      { src: '/images/templates/remoteflow-2.webp', alt: '見本：お店用のフロー図。止まったものを 5 つに分けている' },
      { src: '/images/templates/remoteflow-3.webp', alt: '見本：事務員用のフロー図。あやしいことがなかったかを最初に確かめる' },
      { src: '/images/templates/remoteflow-4.webp', alt: '見本：PowerPoint で書き換えられる箱と矢印' },
    ],
  },
};

// 記事のフロントマターの ownTemplates（キーの配列）を、表示用のデータにする
export function resolveOwnTemplates(list) {
  if (!Array.isArray(list)) return [];
  return [...new Set(list.map(String))].filter((id) => OWN_TEMPLATES[id]).map((id) => OWN_TEMPLATES[id]);
}
