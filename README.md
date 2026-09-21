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
```

## 公開前に設定すること（config.js）

1. **事業者情報** `business.name / phone / email / hours`
2. **拠点座標** `center` … 初期値は大阪府南河内郡太子町役場。兵庫県揖保郡太子町の場合はコメントの座標に変更
3. **Google Maps API キー** `googleMapsApiKey`
   - [Google Cloud Console](https://console.cloud.google.com/) で「Maps JavaScript API」を有効化しキーを作成
   - キーの「ウェブサイトの制限」に公開ドメインを設定
   - 未設定でもキー不要の埋め込み地図（ピンのみ）で表示されます。30km の円を描くにはキーが必要です
4. **フォーム送信先** `formEndpoint`
   - [Formspree](https://formspree.io/) で無料フォームを作り、`https://formspree.io/f/xxxxxxxx` を設定
   - 未設定の場合は入力内容を本文にしたメーラーが起動します（動作確認用）
5. **料金** `pricing` … 相場の根拠は `docs/pricing-research.md`

## ローカルで確認

```
python3 -m http.server 8000
# → http://localhost:8000
```

## GitHub Pages で公開

リポジトリの Settings → Pages → Source を「Deploy from a branch」、Branch を `main` / `(root)` にすると
`https://<user>.github.io/daiko/` で公開されます。
