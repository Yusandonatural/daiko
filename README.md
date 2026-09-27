# 太子草刈り代行 ウェブサイト

大阪府太子町を中心に 30km 圏内で農地・空き地の草刈りを代行するサービスの LP（ランディングページ）です。
静的サイト（HTML / CSS / JS のみ）なので、GitHub Pages・Netlify・Cloudflare Pages などにそのまま置けます。

## 構成

```
index.html               ページ本体
config.js                事業者情報・座標・APIキー・料金（ここだけ編集すれば運用可能）
assets/style.css         スタイル
assets/app.js            地図・概算計算・フォーム送信
docs/pricing-research.md 作業単価の相場調査メモと出典
docs/jotform-setup.md    Jotform フォームの作り方と推奨項目
docs/google-maps-api-key.md  Google Maps API キーの取得手順
docs/service-area.md     30km圏内の市町村一覧と算出方法
assets/areas.js          対応エリアの市町村データ（一覧・フォームに反映）
```

## 公開前に設定すること（config.js）

1. **事業者情報** `business.name / phone / email / hours`
2. **拠点座標** `center` … 大阪府南河内郡太子町役場（自宅や作業拠点に変える場合はここを編集）
3. **Google Maps API キー** `googleMapsApiKey`（任意）
   - 未設定でも OpenStreetMap でピンと 30km の円が表示されます。Google Maps の見た目にしたい場合のみ設定してください
   - 取得手順は `docs/google-maps-api-key.md` を参照
4. **Jotform のフォーム ID** `jotformFormId`
   - Jotform でフォームを作成し、「公開」→「埋め込み」に表示される URL の数字部分（例: `251234567890123`）を設定
   - 推奨の質問項目と作り方は `docs/jotform-setup.md` を参照
   - 未設定の間は簡易フォーム（入力内容を本文にしたメーラー起動）が表示されます
5. **料金** `pricing` … 相場の根拠は `docs/pricing-research.md`

## ローカルで確認

```
python3 -m http.server 8000
# → http://localhost:8000
```

## GitHub Pages で公開

`main` に push すると `.github/workflows/pages.yml` が自動でデプロイし、
https://yusandonatural.github.io/daiko/ で公開されます（Settings → Pages の Source は「GitHub Actions」）。
独自ドメインを使う場合は Settings → Pages → Custom domain に設定し、DNS に CNAME を追加してください。

---

# まいにち30ぷん（子ども向け 英語＆算数アプリ） `study/`

「30分べんきょうしたら30分ゲーム」を毎日続けるための家庭学習アプリです（静的HTML・PWA）。
公開URL：https://yusandonatural.github.io/daiko/study/

- 対象：年少さん〜小学6年生（9段階）。**英語が中心（標準7割）＋算数（3割）**、割合は保護者設定で 50〜90% に変更可
- 難しさ：かんたん〜ふつう。直近の正解率で自動切替、まちがえた問題は3問後にもう一度出題
- 年少〜小1は「音声を聞いて絵を選ぶ」形式中心（字が読めなくてもOK）。英語はブラウザの読み上げで発音
- タイマーは解いている間だけ進む（90秒操作なしで自動停止）。途中でやめても続きから
- **レッスン1回（標準30分）クリアごとにゲームタイム30分**。2回で60分、3回で90分と貯まる（1日の上限回数は保護者設定：上限なし／1〜4回）
- ゲームタイムはスタート／ストップで使用、5分前・1分前・終了でお知らせ。その日のうちに使い切り
- 継続のしかけ：連続日数、スタンプカレンダー（月送り・日付タップで その日の時間／問題数／正解率）、スター＆ランク、連続メダル
- タイマー：はみがき3分・おかたづけ10分・しゅくだい20分など用途つきプリセット、1〜60分と±調整。ほかの画面に移っても進み、終わるとどの画面でもアラーム＋読み上げ
- iPad 対応：たて向きは上に「きょう」＋下に大きなカレンダー、よこ向きは左右2画面（問題は左に問題・右に答え）
- 保護者画面：兄弟ごとの登録、時間設定、4桁暗証番号、14日間の記録と苦手な問題の種類、バックアップ／復元
- データは端末の localStorage のみに保存（サーバー送信なし）。GA4 はページ閲覧と「クリア」イベントのみ（広告・シグナル無効）

```
study/index.html          画面の土台（メタ・GA4）
study/js/data.js          英単語・フレーズのデータ（学年ごと）
study/js/questions.js     問題の自動生成（学年×英語/算数）
study/js/app.js           画面・タイマー・記録・保護者設定
study/css/style.css       スタイル
study/sw.js / manifest    オフライン対応・ホーム画面に追加
```

問題を増やすときは `data.js` に単語を足す（`g` は出題開始学年：0=年少 … 8=小6）か、
`questions.js` の `PLAN` に出題の種類と重みを追加してください。
