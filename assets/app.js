/* global google */
(function () {
  const C = window.SITE_CONFIG || {};
  const P = C.pricing || {};
  const yen = (n) => Math.round(n).toLocaleString("ja-JP");

  // ---------- 事業者情報・料金の反映 ----------
  document.querySelectorAll("[data-biz]").forEach((el) => {
    const v = (C.business || {})[el.dataset.biz];
    if (v) el.textContent = v;
  });
  document.querySelectorAll("[data-biz-tel]").forEach((el) => {
    const tel = (C.business || {}).phone || "";
    el.textContent = tel;
    el.href = "tel:" + tel.replace(/[^0-9+]/g, "");
  });
  document.querySelectorAll("[data-price]").forEach((el) => {
    const v = P[el.dataset.price];
    if (v != null) el.textContent = yen(v);
  });
  document.querySelectorAll("[data-price-pct]").forEach((el) => {
    const v = P[el.dataset.pricePct];
    if (v != null) el.textContent = Math.round(v * 100);
  });
  document.querySelectorAll("[data-calc='residential100']").forEach((el) => {
    el.textContent = yen(Math.max(P.minCharge || 0, (P.residentialPerSqm || 0) * 100));
  });
  document.querySelectorAll("[data-center-label]").forEach((el) => { el.textContent = C.centerLabel || el.textContent; });
  document.querySelectorAll("[data-radius]").forEach((el) => { el.textContent = C.radiusKm || 30; });
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // ---------- 概算シミュレーター ----------
  const calcEls = {
    type: document.getElementById("calc-type"),
    area: document.getElementById("calc-area"),
    unit: document.getElementById("calc-unit"),
    height: document.getElementById("calc-height"),
    disposal: document.getElementById("calc-disposal"),
    distance: document.getElementById("calc-distance"),
    total: document.getElementById("calc-total"),
  };
  function toSqm(v, unit) {
    if (unit === "a") return v * 100;
    if (unit === "tsubo") return v * 3.30579;
    return v;
  }
  function estimate() {
    if (!calcEls.total) return;
    const sqm = toSqm(parseFloat(calcEls.area.value) || 0, calcEls.unit.value);
    if (sqm <= 0) { calcEls.total.textContent = "—"; return; }
    let base = calcEls.type.value === "farmland"
      ? sqm * ((P.farmlandPer10a || 0) / 1000)
      : sqm * (P.residentialPerSqm || 0);
    if (calcEls.height.value === "mid") base *= 1 + (P.tallGrassSurcharge || 0);
    base = Math.max(base, P.minCharge || 0);
    if (calcEls.disposal.checked) base += sqm * (P.disposalPerSqm || 0);
    if (calcEls.distance.value === "far") base += P.travelFeeOver15km || 0;
    calcEls.total.textContent = yen(Math.ceil(base / 100) * 100);
  }
  Object.values(calcEls).forEach((el) => el && el.addEventListener("input", estimate));
  estimate();

  // ---------- 市町村セレクト ----------
  const cities = {
    "大阪府": ["太子町","河南町","千早赤阪村","富田林市","羽曳野市","藤井寺市","柏原市","松原市","大阪狭山市","河内長野市","堺市","八尾市","東大阪市","大阪市","高石市","泉大津市","和泉市","忠岡町","岸和田市","大東市","門真市","守口市","四條畷市"],
    "奈良県": ["葛城市","香芝市","大和高田市","御所市","橿原市","王寺町","上牧町","河合町","広陵町","三郷町","平群町","斑鳩町","安堵町","川西町","三宅町","田原本町","高取町","明日香村","桜井市","大和郡山市","生駒市","天理市","奈良市","五條市","大淀町","下市町","吉野町"],
    "和歌山県": ["橋本市","かつらぎ町"],
  };
  const citySel = document.getElementById("city-select");
  if (citySel) {
    Object.entries(cities).forEach(([pref, list]) => {
      const og = document.createElement("optgroup");
      og.label = pref;
      list.forEach((c) => {
        const o = document.createElement("option");
        o.value = pref + c; o.textContent = c; og.appendChild(o);
      });
      citySel.appendChild(og);
    });
    const other = document.createElement("option");
    other.value = "その他（30km圏外）"; other.textContent = "その他（30km圏外・要相談）";
    citySel.appendChild(other);
  }

  // ---------- 地図 ----------
  const mapEl = document.getElementById("map");
  const mapNote = document.getElementById("map-note");
  function initEmbedMap() {
    const { lat, lng } = C.center;
    mapEl.innerHTML = `<iframe loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"
      src="https://maps.google.com/maps?q=${lat},${lng}&z=9&hl=ja&output=embed"></iframe>`;
    if (mapNote) mapNote.textContent = "※ 30km 圏の円を表示するには config.js に Google Maps API キーを設定してください。";
  }
  window.initServiceMap = function () {
    const center = C.center;
    const map = new google.maps.Map(mapEl, {
      center, zoom: 9, mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
      styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
    });
    new google.maps.Marker({ position: center, map, title: C.centerLabel || "拠点" });
    const circle = new google.maps.Circle({
      map, center, radius: (C.radiusKm || 30) * 1000,
      strokeColor: "#2e6b43", strokeOpacity: .9, strokeWeight: 2,
      fillColor: "#3f8f5a", fillOpacity: .15, clickable: false,
    });
    map.fitBounds(circle.getBounds());
    const info = new google.maps.InfoWindow({ content: `<strong>${C.centerLabel || ""}</strong><br>ここを中心に ${C.radiusKm || 30}km 圏内が対応エリアです` });
    info.open({ map, anchor: undefined, position: center });
    if (mapNote) mapNote.textContent = "";
  };
  if (mapEl) {
    if (C.googleMapsApiKey) {
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(C.googleMapsApiKey)}&language=ja&region=JP&callback=initServiceMap`;
      s.async = true; s.defer = true;
      s.onerror = initEmbedMap;
      document.head.appendChild(s);
      // 認証エラー（キー不正など）時のフォールバック
      window.gm_authFailure = initEmbedMap;
    } else {
      initEmbedMap();
    }
  }

  // ---------- フォーム ----------
  const form = document.getElementById("request-form");
  const status = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");
  const labels = {
    name: "お名前", phone: "電話番号", email: "メール", contact_method: "連絡方法",
    city: "市町村", address: "住所・目印", land_type: "土地の種類", area: "面積", area_unit: "単位",
    grass_height: "草の状態", timing: "希望時期", disposal: "刈草の処理", message: "備考",
  };
  function buildBody(fd) {
    const lines = [];
    for (const [k, label] of Object.entries(labels)) {
      const v = (fd.get(k) || "").toString().trim();
      if (k === "area_unit") continue;
      if (k === "area") { if (v) lines.push(`${label}: ${v} ${fd.get("area_unit") || ""}`); continue; }
      if (v) lines.push(`${label}: ${v}`);
    }
    return lines.join("\n");
  }
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.className = "form-status";
      if (!form.checkValidity()) {
        form.reportValidity();
        status.textContent = "必須項目をご確認ください。";
        status.classList.add("ng");
        return;
      }
      const fd = new FormData(form);
      if (fd.get("_gotcha")) return; // bot
      const body = buildBody(fd);
      const subject = `【草刈り依頼】${fd.get("name")} 様（${fd.get("city")}）`;

      if (!C.formEndpoint) {
        const to = (C.business || {}).email || "";
        window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        status.textContent = "メールソフトが開きます。送信して完了です。開かない場合はお電話ください。";
        status.classList.add("ok");
        return;
      }

      submitBtn.disabled = true;
      status.textContent = "送信中…";
      try {
        fd.append("_subject", subject);
        fd.append("summary", body);
        const res = await fetch(C.formEndpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        status.textContent = "送信しました。2〜3日以内にご連絡いたします。";
        status.classList.add("ok");
      } catch (err) {
        status.textContent = "送信に失敗しました。お手数ですがお電話またはメールでご連絡ください。";
        status.classList.add("ng");
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
})();
