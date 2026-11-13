/* dc-lite: a tiny standalone renderer for the page templates (sc-for, sc-if, {{holes}}, events). */
(function () {
  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(p) {
      Object.assign(this.state, typeof p === "function" ? p(this.state) : p);
      if (this.__render) this.__render();
    }
    forceUpdate() { if (this.__render) this.__render(); }
  }
  window.DCLogic = DCLogic;

  const HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  const WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;

  function lookup(path, scope) {
    path = path.trim();
    if (path === "true") return true;
    if (path === "false") return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return +path;
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), scope);
  }
  function interp(s, scope) {
    return s.replace(HOLE, (m, p) => { const v = lookup(p, scope); return v == null ? "" : String(v); });
  }
  function holeOf(node, attr) {
    const m = (node.getAttribute(attr) || "").match(WHOLE);
    return m ? m[1] : "";
  }

  function build(node, scope, out) {
    if (node.nodeType === 3) { out.appendChild(document.createTextNode(interp(node.nodeValue, scope))); return; }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    if (tag === "sc-for") {
      const list = lookup(holeOf(node, "list"), scope) || [];
      const as = node.getAttribute("as") || "item";
      list.forEach((it, i) => {
        const s = Object.create(scope); s[as] = it; s.$index = i;
        node.childNodes.forEach(c => build(c, s, out));
      });
      return;
    }
    if (tag === "sc-if") {
      if (lookup(holeOf(node, "value"), scope)) node.childNodes.forEach(c => build(c, scope, out));
      return;
    }
    const el = document.createElement(tag);
    let pendingValue;
    for (const a of Array.from(node.attributes)) {
      const n = a.name, val = a.value;
      if (n.indexOf("hint-") === 0) continue;
      const w = val.match(WHOLE);
      if (/^on[a-z]/i.test(n) && w) {
        const fn = lookup(w[1], scope);
        if (typeof fn === "function") {
          let ev = n.slice(2).toLowerCase();
          if (ev === "change") ev = (tag === "select" || node.getAttribute("type") === "checkbox") ? "change" : "input";
          el.addEventListener(ev, fn);
        }
        continue;
      }
      if (w) {
        const v = lookup(w[1], scope);
        if (n === "checked") { el.checked = !!v; continue; }
        if (n === "value") { pendingValue = v == null ? "" : v; continue; }
        if (v === false || v == null) continue;
        el.setAttribute(n, v === true ? "" : String(v));
        continue;
      }
      el.setAttribute(n, interp(val, scope));
    }
    node.childNodes.forEach(c => build(c, scope, el));
    if (pendingValue !== undefined) el.value = pendingValue;
    out.appendChild(el);
  }

  window.DCLite = {
    mount(Component, props) {
      const tpl = document.getElementById("tpl").content;
      const app = document.getElementById("app");
      const c = new Component(props || {});
      c.__render = () => {
        const act = document.activeElement;
        const id = act && act.id;
        let ss = null, se = null;
        try { ss = act.selectionStart; se = act.selectionEnd; } catch (_) {}
        const vals = c.renderVals();
        const frag = document.createDocumentFragment();
        tpl.childNodes.forEach(n => build(n, vals, frag));
        app.replaceChildren(frag);
        if (id) {
          const e = document.getElementById(id);
          if (e) { e.focus(); try { if (ss != null) e.setSelectionRange(ss, se); } catch (_) {} }
        }
      };
      c.__render();
      if (location.hash) {
        const t = document.getElementById(location.hash.slice(1));
        if (t) t.scrollIntoView();
      }
    }
  };
})();
