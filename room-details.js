// js/room-details.js — Faahfaahinta hal qol

const params = new URLSearchParams(window.location.search);
const room = DB.findById("rooms", params.get("id"));
const box = document.getElementById("roomDetails");

if (!room) {
  box.innerHTML = `<p class="empty">Qolkan lama helin. <a href="rooms.html"><u>Ku laabo Rooms</u></a></p>`;
} else {
  const today = new Date().toISOString().split("T")[0];

  box.innerHTML = `
    <div class="details">
      <img src="${room.image}" alt="${room.name}" class="details-img">

      <div class="details-info">
        <h1>${room.name}</h1>
        <p class="muted">${room.type} • 👥 ${room.capacity} qof ugu badnaan</p>
        <p class="price big">$${room.price} <small>/ habeen</small></p>
        <p class="desc">${room.description}</p>

        <h3>Adeegyada</h3>
        <div class="tags">
          ${room.amenities.map(a => `<span class="tag">${a}</span>`).join("")}
        </div>

        <div class="book-box">
          <div class="field">
            <label for="checkIn">Gelitaan</label>
            <input type="date" id="checkIn" min="${today}" value="${params.get("checkIn") || ""}">
          </div>
          <div class="field">
            <label for="checkOut">Ka bixitaan</label>
            <input type="date" id="checkOut" min="${today}" value="${params.get("checkOut") || ""}">
          </div>
          <div class="field">
            <label for="guests">Dadka</label>
            <select id="guests">
              ${Array.from({ length: room.capacity }, (_, i) =>
                `<option value="${i + 1}">${i + 1} qof</option>`).join("")}
            </select>
          </div>

          <p class="total" id="total"></p>
          <p class="error" id="error"></p>
          <button class="btn" id="bookBtn">Buug hadda</button>
        </div>
      </div>
    </div>
  `;

  const checkIn = document.getElementById("checkIn");
  const checkOut = document.getElementById("checkOut");
  const guests = document.getElementById("guests");
  const total = document.getElementById("total");
  const error = document.getElementById("error");

  const g = Number(params.get("guests"));
  if (g && g <= room.capacity) guests.value = g;

  function nights() {
    if (!checkIn.value || !checkOut.value) return 0;
    const diff = (new Date(checkOut.value) - new Date(checkIn.value)) / 86400000;
    return diff > 0 ? diff : 0;
  }

  function updateTotal() {
    error.textContent = "";
    const n = nights();
    total.textContent = n
      ? `${n} habeen × $${room.price} = $${n * room.price}`
      : "Dooro taariikhaha si aad u aragto qiimaha";
  }

  checkIn.addEventListener("change", () => {
    checkOut.min = checkIn.value;
    if (checkOut.value && checkOut.value <= checkIn.value) checkOut.value = "";
    updateTotal();
  });
  checkOut.addEventListener("change", updateTotal);

  document.getElementById("bookBtn").addEventListener("click", () => {
    if (!nights()) {
      error.textContent = "Fadlan dooro taariikho sax ah.";
      return;
    }
    const q = new URLSearchParams({
      roomId: room.id,
      checkIn: checkIn.value,
      checkOut: checkOut.value,
      guests: guests.value
    });
    window.location.href = "booking.html?" + q.toString();
  });

  updateTotal();
}
