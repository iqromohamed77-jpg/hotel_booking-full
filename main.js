// js/main.js — Header & Footer la wadaago

// Ka hortag XSS: nadiifi qoraalka
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function renderHeader() {
  const header = document.getElementById("header");
  if (!header) return;

  const user = Auth.current();
  const page = location.pathname.split("/").pop() || "index.html";
  const link = (href, text) =>
    `<li><a href="${href}" class="${page === href ? "active" : ""}">${text}</a></li>`;

  header.className = "header";
  header.innerHTML = `
    <nav class="navbar">
      <a href="index.html" class="logo">Hotel<span>Booking</span></a>
      <ul class="nav-links">
        ${link("index.html", "Home")}
        ${link("rooms.html", "Rooms")}
        ${user ? link("my-bookings.html", "My Bookings") : ""}
        ${user && user.role === "admin" ? link("admin.html", "Admin") : ""}
        ${user
          ? `<li class="nav-user">👤 ${esc(user.name)}</li><li><a href="#" id="logoutBtn">Logout</a></li>`
          : `${link("login.html", "Login")}${link("register.html", "Register")}`}
      </ul>
    </nav>
  `;

  const out = document.getElementById("logoutBtn");
  if (out) out.addEventListener("click", e => {
    e.preventDefault();
    Auth.logout();
    location.href = "index.html";
  });
}

function renderFooter() {
  const footer = document.getElementById("footer");
  if (!footer) return;

  footer.className = "footer";
  footer.innerHTML = `
    <p>&copy; ${new Date().getFullYear()} <strong>HotelBooking</strong>. Xuquuqda oo dhan waa dhowran tahay.</p>
  `;
}

renderHeader();
renderFooter();
