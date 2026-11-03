// js/rooms.js — Liiska qolalka + filter

const params = new URLSearchParams(window.location.search);

const els = {
  checkIn: document.getElementById("checkIn"),
  checkOut: document.getElementById("checkOut"),
  guests: document.getElementById("guests"),
  type: document.getElementById("type"),
  maxPrice: document.getElementById("maxPrice"),
  priceLabel: document.getElementById("priceLabel"),
  grid: document.getElementById("roomGrid"),
  count: document.getElementById("resultCount"),
  reset: document.getElementById("resetBtn")
};

els.checkIn.value = params.get("checkIn") || "";
els.checkOut.value = params.get("checkOut") || "";
els.guests.value = params.get("guests") || "1";

const today = new Date().toISOString().split("T")[0];
els.checkIn.min = today;
els.checkOut.min = els.checkIn.value || today;

function renderRooms() {
  const guests = Number(els.guests.value);
  const type = els.type.value;
  const maxPrice = Number(els.maxPrice.value);

  els.priceLabel.textContent = "$" + maxPrice;

  const rooms = DB.get("rooms").filter(r =>
    r.capacity >= guests &&
    (type === "all" || r.type === type) &&
    r.price <= maxPrice
  );

  els.count.textContent = rooms.length + " qol ayaa la helay";

  if (!rooms.length) {
    els.grid.innerHTML = `<p class="empty">Qol ku habboon lama helin. Isku day filter kale.</p>`;
    return;
  }

  const dates = els.checkIn.value && els.checkOut.value
    ? `&checkIn=${els.checkIn.value}&checkOut=${els.checkOut.value}&guests=${guests}`
    : "";

  els.grid.innerHTML = rooms.map(room => `
    <div class="room-card">
      <img src="${room.image}" alt="${room.name}">
      <div class="info">
        <h3>${room.name}</h3>
        <p class="desc">${room.description}</p>
        <div class="tags">
          <span class="tag">👥 ${room.capacity} qof</span>
          ${room.amenities.map(a => `<span class="tag">${a}</span>`).join("")}
        </div>
        <div class="bottom">
          <span class="price">$${room.price} <small>/ habeen</small></span>
          <a href="room-details.html?id=${room.id}${dates}" class="btn">Arag</a>
        </div>
      </div>
    </div>
  `).join("");
}

els.checkIn.addEventListener("change", () => {
  els.checkOut.min = els.checkIn.value;
  if (els.checkOut.value && els.checkOut.value <= els.checkIn.value) els.checkOut.value = "";
  renderRooms();
});
[els.checkOut, els.guests, els.type].forEach(el => el.addEventListener("change", renderRooms));
els.maxPrice.addEventListener("input", renderRooms);

els.reset.addEventListener("click", () => {
  els.checkIn.value = "";
  els.checkOut.value = "";
  els.guests.value = "1";
  els.type.value = "all";
  els.maxPrice.value = els.maxPrice.max;
  renderRooms();
});

renderRooms();
