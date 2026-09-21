// ============================================================
//  サイト設定（ここだけ編集すればOK）
// ============================================================
window.SITE_CONFIG = {
  // 事業者情報
  business: {
    name: "太子草刈り代行",
    tagline: "農地・空き地・畦畔の草刈りを、地元の農家がお引き受けします",
    phone: "000-0000-0000",           // ← 電話番号
    email: "info@example.com",        // ← 受付メール（フォーム送信先の予備にも使用）
    line: "",                          // ← LINE公式アカウントURL（任意）
    hours: "8:00〜18:00（日曜定休）",
  },

  // サービス提供エリアの中心（大阪府南河内郡太子町 役場：大阪府南河内郡太子町大字山田88）
  center: { lat: 34.518682, lng: 135.647661 },
  centerLabel: "太子町（大阪府南河内郡）",
  radiusKm: 30,

  // Google Maps JavaScript API キー
  // 未設定（空文字）の場合は、キー不要の埋め込み地図にフォールバックします（円は描画されません）
  googleMapsApiKey: "",

  // Jotform のフォームID（例: "251234567890123"）
  // Jotform で作成したフォームの「公開」→「埋め込み」に表示される URL
  //   https://form.jotform.com/251234567890123  の数字部分
  // 設定すると Jotform のフォームが埋め込まれます。
  // 未設定の間は簡易フォーム（入力内容をメール本文にしたメーラー起動）を表示します
  jotformFormId: "",

  // 標準料金（税込・円）。相場調査は docs/pricing-research.md を参照
  pricing: {
    minCharge: 8000,           // 最低料金
    farmlandPer10a: 15000,     // 田畑・休耕地（草丈50cm未満）10aあたり
    farmlandPerSqm: 150,       // 同上 ㎡換算（表示用）
    residentialPerSqm: 200,    // 宅地・空き地・駐車場 ㎡あたり
    ridgePer100m: 4000,        // 畦畔・法面 100mあたり
    hourly: 2500,              // 時間制（1人1時間）
    tallGrassSurcharge: 0.2,   // 草丈50cm〜1m 割増率
    disposalPerSqm: 50,        // 集草・搬出 ㎡あたり
    travelFeeOver15km: 2000,   // 15km超〜30km 出張費
  },
};
