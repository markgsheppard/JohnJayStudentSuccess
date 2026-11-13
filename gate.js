/* Simple password overlay for the draft site. Not real security: it hides the page from casual visitors. */
(function () {
  var PASSWORD = "johnjay2026";
  try { sessionStorage.removeItem("bc-econ-draft-unlocked"); } catch (e) {}

  var style = document.createElement("style");
  style.textContent =
    "#app,body>div:not(#gate){filter:blur(7px);pointer-events:none;user-select:none}" +
    "html.gate-on,html.gate-on body{overflow:hidden}";
  document.head.appendChild(style);
  document.documentElement.classList.add("gate-on");

  function build() {
    var gate = document.createElement("div");
    gate.id = "gate";
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-modal", "true");
    gate.setAttribute("aria-labelledby", "gate-title");
    gate.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(43,38,34,0.72);display:flex;align-items:center;justify-content:center;padding:20px;font-family:'Open Sans',Arial,sans-serif";
    gate.innerHTML =
      '<form id="gate-form" style="background:#fff;color:#1D242C;width:100%;max-width:440px;border-top:6px solid #232C64;padding:32px;display:flex;flex-direction:column;gap:14px;box-sizing:border-box">' +
        '<p style="margin:0;font-size:13px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#232C64">Draft for department review</p>' +
        '<h1 id="gate-title" style="margin:0;font-family:\'Nunito Sans\',Arial,sans-serif;font-size:26px;line-height:1.2">John Jay College Economics: Student Success &amp; Graduate Pathways</h1>' +
        '<p style="margin:0;font-size:16px;line-height:1.55;color:#3D4752">This prototype is being developed by <strong style="color:#1D242C">Mark G. Sheppard</strong>, Lecturer in Economics, CUNY. It’s an early draft shared for internal discussion only and is not for public distribution or comment.</p>' +
        '<label for="gate-pw" style="font-size:15px;font-weight:700;margin-top:4px">Password</label>' +
        '<input id="gate-pw" type="password" autocomplete="off" style="font:inherit;font-size:16px;min-height:46px;padding:8px 12px;border:1px solid #9FAAB6;box-sizing:border-box;width:100%">' +
        '<p id="gate-err" role="alert" style="margin:0;min-height:20px;font-size:14px;color:#A32D2D"></p>' +
        '<button type="submit" style="font:inherit;font-size:16px;font-weight:700;min-height:48px;background:#232C64;color:#fff;border:0;cursor:pointer">View the draft</button>' +
        '<p style="margin:0;font-size:13px;color:#525D69">Questions? <a href="mailto:msheppard@gradcenter.cuny.edu" style="color:#232C64">msheppard@gradcenter.cuny.edu</a></p>' +
      '</form>';
    document.body.appendChild(gate);
    var pw = document.getElementById("gate-pw");
    var err = document.getElementById("gate-err");
    pw.focus();
    pw.addEventListener("input", function () { err.textContent = ""; });
    document.getElementById("gate-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = pw.value.trim().toLowerCase();
      if (!v) { err.textContent = "Enter the password first."; return; }
      if (v !== PASSWORD) { err.textContent = "That password isn't right. Try again."; pw.select(); return; }
      gate.remove();
      style.remove();
      document.documentElement.classList.remove("gate-on");
    });
  }
  if (document.body) build(); else document.addEventListener("DOMContentLoaded", build);
})();
