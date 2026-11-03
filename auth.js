// js/auth.js — Register / Login / Logout (demo: password plain text)

const Auth = {
  current() {
    try { return JSON.parse(localStorage.getItem("currentUser")); }
    catch { return null; }
  },

  _setSession(u) {
    localStorage.setItem("currentUser",
      JSON.stringify({ id: u.id, name: u.name, email: u.email, role: u.role }));
  },

  login(email, password) {
    const u = DB.get("users").find(
      x => x.email.toLowerCase() === email.toLowerCase() && x.password === password
    );
    if (!u) return null;
    this._setSession(u);
    return u;
  },

  register(name, email, password) {
    const exists = DB.get("users").some(x => x.email.toLowerCase() === email.toLowerCase());
    if (exists) return { error: "Email-kan hore ayaa loo isticmaalay." };
    const u = DB.insert("users", { name, email, password, role: "guest" });
    this._setSession(u);
    return { user: u };
  },

  logout() {
    localStorage.removeItem("currentUser");
  },

  // Xir bogga: haddii aan la gelin, u gudbi login.html
  require(role) {
    const u = this.current();
    if (!u) {
      const here = location.pathname.split("/").pop() + location.search;
      location.href = "login.html?next=" + encodeURIComponent(here);
      return null;
    }
    if (role && u.role !== role) {
      location.href = "index.html";
      return null;
    }
    return u;
  },

  // Ka hortag redirect khatar ah: oggolow magac fayl .html oo keliya
  safeNext(next) {
    return /^[\w-]+\.html(\?[\w=&%.\-]*)?$/.test(next || "") ? next : "index.html";
  }
};
