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
 * 変えるときは、両方を同じに直すこと（違うと、AI に相談内容が渡らない）。
 * 2 回実行すると、フォームが 2 つできる。いらないほうはドライブから消す。
 */

const FORM_TITLE = 'mise & register AI無料POSレジ診断';

const FORM_DESCRIPTION = [
  '診断は最後まで無料です。診断のあとに料金を請求することはありません。',
  'AI が作った回答の下書きを運営者が確認し、メールでお返しします。回答まで数日かかることがあります。',
  '',
  '・氏名・住所・電話番号・カード番号・パスワードなどは書かないでください。',
  '・相談内容は、回答を作るために AI サービス（Anthropic の Claude）に送ります。詳しくはサイトのプライバシーポリシー（https://www.mise-register.com/about）をご覧ください。',
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

  // ===== 必須の質問（ai-consult.gs の CONFIG.fields） =====
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

  form
    .addMultipleChoiceItem()
    .setTitle('相談の種類')
    .setChoiceValues(['POSレジ・決済端末', 'ハンディターミナル・スキャナー', 'プリンター・キャッシュドロア', '業務用Android端末', 'ネットワーク機器', 'その他'])
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle('相談内容')
    .setHelpText('例）混む時間に、レシートプリンターが急に印刷しなくなります。電源を入れ直すと一度は直ります。')
    .setRequired(true);

  // ===== 任意の質問（ai-consult.gs の CONFIG.detailFields） =====
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
