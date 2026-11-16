/**
 * AI無料POSレジ診断の Google フォームを、1 回の実行で作るスクリプト。
 *
 * 使い方（くわしくは gas/README.md の「1. Google フォームを作る」）：
 *   1. ブログ用の Google アカウントで https://script.google.com を開き、「新しいプロジェクト」
 *   2. 最初からある中身を消して、このファイルの中身を全部貼り、保存する
 *   3. 関数の選択で createConsultForm を選んで「実行」（初回は権限の確認が出るので許可する）
 *   4. 「実行ログ」に出る 3 つの URL（フォームの編集・回答用・回答のスプレッドシート）を控える
 *
 * 質問のタイトルは ai-consult.gs の CONFIG.fields・CONFIG.detailFields と一字一句同じにしてある。
 * 変えるときは、両方を同じに直すこと（違うと、AI に入力した内容が渡らない）。
 * 2 回実行すると、フォームが 2 つできる。いらないほうはドライブから消す。
 */

const FORM_TITLE = 'mise & register AI無料POSレジ診断';

// 「何を診断しますか」の選択肢（ai-consult.gs の CONFIG.purposeSelect と同じにする）
const PURPOSE_SELECT = 'POSレジを選びたい（開業前・入れかえ）';
const PURPOSE_TROUBLE = '今の機器のトラブル・使い方';

const FORM_DESCRIPTION = [
  '診断は最後まで無料です。診断のあとに料金を請求することはありません。',
  'AI が作った回答の下書きを運営者が確認し、メールでお返しします。回答まで数日かかることがあります。',
  '',
  '・氏名・住所・電話番号・カード番号・パスワードなどは書かないでください。',
  '・入力した内容は、回答を作るために AI サービス（Anthropic の Claude）に送ります。詳しくはサイトのプライバシーポリシー（https://www.mise-register.com/about）をご覧ください。',
  '・診断できること：POSレジ・周辺機器・ネットワーク機器の選び方、使い方（設定・つなぎ方）、エラーや障害。',
  '・集客・経営・パソコンや Microsoft 365、税金・法律・許可などの個別の判断にはお答えできません。',
].join('\n');

function createConsultForm() {
  const form = FormApp.create(FORM_TITLE);
  form.setDescription(FORM_DESCRIPTION);
  // メールアドレスは下の質問で聞くので、Google の自動収集はしない
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.setAllowResponseEdits(false);
  form.setConfirmationMessage('送信しました。運営者が確認してから、メールで回答をお送りします（数日かかることがあります）。');

  // フォームは 4 つのページに分ける
  //   1. 最初：メールアドレス・お店の種類・何を診断しますか（答えで 2 か 3 に進む）
  //   2. POSレジ選び：使いたいPOSレジ・お店の大きさ・会計の数・営業の場所・レジのまわり → 4 へ
  //   3. トラブル・使い方：診断してほしい機器・いつから・画面の表示など → 4 へ
  //   4. 最後：困っていること・知りたいこと・確認事項
  // 質問のタイトルは ai-consult.gs の CONFIG.fields（必須の質問）と CONFIG.detailFields（ページ 2・3 の質問）

  // ===== 1. 最初のページ =====
  form
    .addTextItem()
    .setTitle('メールアドレス')
    .setHelpText('回答をお送りするメールアドレス')
    .setRequired(true)
    .setValidation(FormApp.createTextValidation().requireTextIsEmail().setHelpText('メールアドレスの形で入力してください').build());

  form
    .addMultipleChoiceItem()
    .setTitle('お店の種類')
    .setChoiceValues(['カフェ・飲食店', '美容・サロン', 'アパレル・雑貨', 'キッチンカー', '開業準備中', 'その他'])
    .setRequired(true);

  // 選択肢ごとに進むページを決めるので、ページを作ってから選択肢を入れる
  const purpose = form.addMultipleChoiceItem().setTitle('何を診断しますか').setRequired(true);

  // ===== 2. POSレジ選びのページ =====
  const selectPage = form
    .addPageBreakItem()
    .setTitle('POSレジ選び')
    .setHelpText('お店の条件を教えてください。条件に合う POS レジと周辺機器の選び方をお返しします。');

  form
    .addCheckboxItem()
    .setTitle('使いたいPOSレジ')
    .setHelpText('気になっているものを全部えらんでください（いくつでも）')
    .setChoiceValues(['Airレジ', 'スマレジ', 'Square', 'まだ決めていない'])
    .showOtherOption(true);

  form
    .addMultipleChoiceItem()
    .setTitle('お店の大きさ')
    .setHelpText('レジに立つ人の数')
    .setChoiceValues(['1人で営業する', '2〜3人', '4人以上'])
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('1日の会計の数')
    .setChoiceValues(['30件くらいまで', '30〜100件', '100件より多い', '分からない（開業前）'])
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('営業の場所')
    .setChoiceValues(['お店（店舗）だけ', 'お店とイベント出店', 'キッチンカー・移動販売・イベント出店だけ'])
    .setRequired(true);

  form
    .addCheckboxItem()
    .setTitle('レジのまわり')
    .setHelpText('当てはまるものを全部えらんでください')
    .setChoiceValues([
      '水がかかる・ぬれた手でさわる',
      '油・粉・ほこりで汚れる',
      '屋外で使う（雨・日差し）',
      '電源やインターネットがない場所で使う',
      '特になし',
    ])
    .setRequired(true);

  // ===== 3. トラブル・使い方のページ =====
  const troublePage = form
    .addPageBreakItem()
    .setTitle('今の機器のトラブル・使い方')
    .setHelpText('分かる範囲で教えてください。分からない質問は空欄で大丈夫です。');

  form
    .addMultipleChoiceItem()
    .setTitle('診断してほしい機器')
    .setChoiceValues(['POSレジ・決済端末', 'ハンディターミナル・スキャナー', 'プリンター・キャッシュドロア', '業務用Android端末', 'ネットワーク機器', 'その他'])
    .setRequired(true);

  form.addTextItem().setTitle('いつから起きていますか').setHelpText('例）今日の昼から、3日前から、ときどき');

  form
    .addParagraphTextItem()
    .setTitle('画面やランプの表示')
    .setHelpText('エラーの文字やコードは、そのまま書き写してください。ランプの色や点滅のしかたも');

  form
    .addTextItem()
    .setTitle('機器のメーカー・機種名')
    .setHelpText('本体の裏や底のラベルに書いてあります。分からなければ空欄で大丈夫です');

  form.addMultipleChoiceItem().setTitle('機器のつなぎ方').setChoiceValues(['単体で使っている', 'POSレジとつないでいる', '分からない']);

  form
    .addMultipleChoiceItem()
    .setTitle('起きている範囲')
    .setChoiceValues(['いつも起きる', 'ときどき起きる・一部だけで起きる（特定のカードや商品など）', '分からない']);

  form
    .addMultipleChoiceItem()
    .setTitle('機器の台数')
    .setChoiceValues(['1台だけ使っている', '複数台あり、すべてで起きる', '複数台あり、一部だけで起きる']);

  // ===== 4. 最後のページ =====
  const lastPage = form.addPageBreakItem().setTitle('困っていること・知りたいこと');

  form
    .addParagraphTextItem()
    .setTitle('困っていること・知りたいこと')
    .setHelpText('例）カフェを開くので、POSレジとそろえる機器を知りたいです。／混む時間に、レシートプリンターが急に印刷しなくなります。電源を入れ直すと一度は直ります。')
    .setRequired(true);

  // 「何を診断しますか」の答えで進むページを分ける
  purpose.setChoices([
    purpose.createChoice(PURPOSE_SELECT, selectPage),
    purpose.createChoice(PURPOSE_TROUBLE, troublePage),
  ]);
  // POSレジ選びのページのあとは、トラブルのページを飛ばして最後のページへ
  //   （setGoToPage は「このページ区切りの前のページ」を終えたあとの行き先）
  troublePage.setGoToPage(lastPage);

  // ===== 同意（必須） =====
  form
    .addCheckboxItem()
    .setTitle('確認事項')
    .setChoiceValues([
      '回答は AI が作成した下書きを、運営者が確認してお送りすることに同意します',
      '氏名・住所・電話番号・カード番号・パスワードなどは書きません',
    ])
    .setValidation(FormApp.createCheckboxValidation().requireSelectAtLeast(2).setHelpText('2つともチェックしてください').build())
    .setRequired(true);

  // 回答をためるスプレッドシートを作ってつなぐ（ai-consult.gs はこのシートに貼る）
  const sheet = SpreadsheetApp.create(`${FORM_TITLE}（回答）`);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  Logger.log('フォームの編集：' + form.getEditUrl());
  Logger.log('回答用の URL（Vercel の NEXT_PUBLIC_CONSULT_FORM_URL に入れる）：' + form.getPublishedUrl());
  Logger.log('回答のスプレッドシート（ここの「拡張機能」→「Apps Script」に ai-consult.gs を貼る）：' + sheet.getUrl());
}
