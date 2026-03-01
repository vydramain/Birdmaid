(function () {
  const e = document.createElement("link").relList;
  if (e && e.supports && e.supports("modulepreload")) return;
  for (const n of document.querySelectorAll('link[rel="modulepreload"]')) o(n);
  new MutationObserver((n) => {
    for (const r of n)
      if (r.type === "childList")
        for (const i of r.addedNodes) i.tagName === "LINK" && i.rel === "modulepreload" && o(i);
  }).observe(document, { childList: !0, subtree: !0 });
  function l(n) {
    const r = {};
    return (
      n.integrity && (r.integrity = n.integrity),
      n.referrerPolicy && (r.referrerPolicy = n.referrerPolicy),
      n.crossOrigin === "use-credentials"
        ? (r.credentials = "include")
        : n.crossOrigin === "anonymous"
          ? (r.credentials = "omit")
          : (r.credentials = "same-origin"),
      r
    );
  }
  function o(n) {
    if (n.ep) return;
    n.ep = !0;
    const r = l(n);
    fetch(n.href, r);
  }
})();
function O(t, e) {
  return e <= 0 ? 0 : (t + 1) % e;
}
function I(t, e) {
  return e <= 0 ? 0 : (t - 1 + e) % e;
}
let s = [],
  c = 0,
  f = null;
function x(t, e) {
  if (window.parent !== window)
    try {
      window.parent.postMessage({ type: t, payload: e, timestamp: Date.now() }, "*");
    } catch {}
}
function d(t) {
  return document.getElementById(t);
}
const P = 1e4;
let p = null;
function w() {
  p && (URL.revokeObjectURL(p), (p = null));
}
function y(t) {
  const e = d("viewer-img"),
    l = d("viewer-loading"),
    o = d("viewer-error");
  if (!e || !l || !o) return;
  (w(),
    (e.src = ""),
    (l.style.display = "block"),
    (o.style.display = "none"),
    (e.style.display = "none"));
  let n = !1;
  const r = () => {
      n || ((n = !0), (l.style.display = "none"));
    },
    i = setTimeout(() => {
      n ||
        (typeof console < "u" &&
          console.error &&
          console.error("[ImageViewer] Load timeout (CORS/network?):", t),
        r(),
        (o.style.display = "block"),
        (o.textContent = "Unable to load image"),
        (e.style.display = "none"));
    }, P);
  fetch(t, { mode: "cors" })
    .then((a) => {
      if (!a.ok) throw new Error(`HTTP ${a.status}`);
      const u = a.headers.get("Content-Type") ?? "";
      if (!u.toLowerCase().startsWith("image/")) throw new Error(`Invalid Content-Type: ${u}`);
      return a.blob();
    })
    .then((a) => {
      if (n) return;
      clearTimeout(i);
      const u = URL.createObjectURL(a);
      ((p = u),
        (e.onerror = () => {
          (w(),
            r(),
            (o.style.display = "block"),
            (o.textContent = "Unable to load image"),
            (e.style.display = "none"));
        }),
        (e.onload = () => {
          (r(), (o.style.display = "none"), (e.style.display = "block"));
        }),
        (e.src = u));
    })
    .catch((a) => {
      n ||
        (clearTimeout(i),
        typeof console < "u" &&
          console.error &&
          console.error("[ImageViewer] Failed to load image:", t, a),
        r(),
        (o.style.display = "block"),
        (o.textContent = "Unable to load image"),
        (e.style.display = "none"));
    });
}
function m() {
  var n;
  const t = d("viewer-status");
  if (!t) return;
  const e = s.length;
  if (e <= 0) {
    t.textContent = "";
    return;
  }
  const l = s[c],
    o = ((n = l == null ? void 0 : l.path) == null ? void 0 : n.split("/").pop()) ?? "";
  t.textContent = e > 1 ? `${c + 1} of ${e}` : o;
}
function g(t) {
  x("WINDOW_TITLE", { title: t || "Picture Viewer" });
}
function h() {
  if (s.length <= 1) return;
  c = I(c, s.length);
  const t = s[c];
  t && (y(t.url), m(), g(t.path.split("/").pop() ?? ""));
}
function b() {
  if (s.length <= 1) return;
  c = O(c, s.length);
  const t = s[c];
  t && (y(t.url), m(), g(t.path.split("/").pop() ?? ""));
}
function L(t) {
  const e = t.playlist ?? [],
    l = t.initialPath ?? "",
    o = t.initialUrl ?? "";
  ((s = e.length > 0 ? e : o ? [{ path: l, url: o }] : []),
    (c = s.findIndex((i) => i.path === l || i.url === o)),
    c < 0 && (c = 0));
  const n = d("btn-prev"),
    r = d("btn-next");
  (n && ((n.disabled = s.length <= 1), (n.onclick = h)),
    r && ((r.disabled = s.length <= 1), (r.onclick = b)),
    o && y(o),
    m(),
    g(l.split("/").pop() ?? "Picture Viewer"),
    f && document.removeEventListener("keydown", f),
    (f = (i) => {
      i.key === "ArrowLeft"
        ? (i.preventDefault(), h())
        : i.key === "ArrowRight" && (i.preventDefault(), b());
    }),
    document.addEventListener("keydown", f));
}
window.addEventListener("message", (t) => {
  const e = t.data;
  (e == null ? void 0 : e.type) === "OPEN_FILE" && e.payload && L(e.payload);
});
const v = window.__fp4PendingOpenFile;
v && ((window.__fp4PendingOpenFile = null), L(v));
