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

  // ---------- 対応エリア一覧・市町村セレクト（assets/areas.js） ----------
  const AREAS = window.SERVICE_AREAS || [];
  const byPref = [];
  AREAS.forEach((a) => {
    let g = byPref.find((x) => x.pref === a.pref);
    if (!g) { g = { pref: a.pref, items: [] }; byPref.push(g); }
    g.items.push(a);
  });
  const listEl = document.getElementById("area-lists");
  if (listEl) {
    byPref.forEach((g) => {
      const box = document.createElement("div");
      const h = document.createElement("h3"); h.className = "sub-title"; h.textContent = g.pref;
      const para = document.createElement("p");
      para.innerHTML = g.items.map((a) => a.full ? a.name : `${a.name}<small class="partial">（一部）</small>`).join("・");
      box.appendChild(h); box.appendChild(para); listEl.appendChild(box);
    });
  }
  const citySel = document.getElementById("city-select");
  if (citySel) {
    byPref.forEach((g) => {
      const og = document.createElement("optgroup");
      og.label = g.pref;
      g.items.forEach((a) => {
        const o = document.createElement("option");
        o.value = g.pref + " " + a.name; o.textContent = a.name + (a.full ? "" : "（一部）"); og.appendChild(o);
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
  // キー未設定時のフォールバック：OpenStreetMap（Leaflet）でピンと円を描画
  function initFallbackMap() {
    const { lat, lng } = C.center;
    const radius = (C.radiusKm || 30) * 1000;
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "assets/vendor/leaflet/leaflet.css";
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = "assets/vendor/leaflet/leaflet.js";
    js.onload = function () {
      const L = window.L;
      const map = L.map(mapEl, { scrollWheelZoom: false }).setView([lat, lng], 9);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      const circle = L.circle([lat, lng], { radius, color: "#2e6b43", weight: 2, fillColor: "#3f8f5a", fillOpacity: .15 }).addTo(map);
      L.marker([lat, lng]).addTo(map)
        .bindPopup(`<strong>${C.centerLabel || ""}</strong><br>ここを中心に ${C.radiusKm || 30}km 圏内が対応エリアです`).openPopup();
      map.fitBounds(circle.getBounds(), { padding: [10, 10] });
      if (mapNote) mapNote.textContent = "";
    };
    js.onerror = function () {
      // Leaflet も読めない場合は Google の埋め込み地図（ピンのみ）
      mapEl.innerHTML = `<iframe loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"
        src="https://maps.google.com/maps?q=${lat},${lng}&z=9&hl=ja&output=embed"></iframe>`;
    };
    document.head.appendChild(js);
    if (mapNote) mapNote.textContent = "";
  }
  const initEmbedMap = initFallbackMap;
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
  const jot = document.getElementById("jotform-embed");
  const status = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");

  // Jotform 埋め込み（config.js の jotformFormId が設定されている場合）
  if (jot && form && C.jotformFormId) {
    const id = String(C.jotformFormId).replace(/\D/g, "");
    const iframe = document.createElement("iframe");
    iframe.id = "JotFormIFrame-" + id;
    iframe.title = "お申し込みフォーム";
    iframe.src = `https://form.jotform.com/${id}`;
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("allow", "geolocation; microphone; camera; fullscreen");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("frameborder", "0");
    jot.appendChild(iframe);
    jot.hidden = false;
    form.hidden = true;
    // 高さ自動調整用のハンドラ
    const h = document.createElement("script");
    h.src = "https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js";
    h.onload = function () {
      if (window.jotformEmbedHandler) {
        window.jotformEmbedHandler("iframe[id='JotFormIFrame-" + id + "']", "https://form.jotform.com/");
      }
    };
    document.body.appendChild(h);
  }

  // 簡易フォーム（Jotform 未設定時のフォールバック：メーラー起動）
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
  if (form && !form.hidden) {
    form.addEventListener("submit", (e) => {
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
      const to = (C.business || {}).email || "";
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = "メールソフトが開きます。送信して完了です。開かない場合はお電話ください。";
      status.classList.add("ok");
      submitBtn.disabled = false;
    });
  }
})();
