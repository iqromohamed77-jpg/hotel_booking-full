// js/booking.js — Foomka booking-ka (login looga baahan yahay)

const user = Auth.require();
const params = new URLSearchParams(window.location.search);
const room = DB.findById("rooms", params.get("roomId"));
const checkIn = params.get("checkIn");
const checkOut = params.get("checkOut");
const guests = Number(params.get("guests"));
const box = document.getElementById("bookingBox");

const nights = checkIn && checkOut
  ? (new Date(checkOut) - new Date(checkIn)) / 86400000
  : 0;

if (user) {
  if (!room || nights <= 0 || !guests) {
    box.innerHTML = `<p class="empty">Xog aan dhammays ahayn. <a href="rooms.html"><u>Dooro qol</u></a></p>`;
  } else {
    const totalPrice = nights * room.price;

    box.innerHTML = `
      <div class="booking-layout">
        <div class="summary">
          <img src="${room.image}" alt="${esc(room.name)}">
          <h2>${esc(room.name)}</h2>
          <p class="muted">${esc(room.type)}</p>
          <ul class="summary-list">
            <li><span>Gelitaan</span><strong>${esc(checkIn)}</strong></li>
            <li><span>Ka bixitaan</span><strong>${esc(checkOut)}</strong></li>
            <li><span>Habeennada</span><strong>${nights}</strong></li>
            <li><span>Dadka</span><strong>${guests}</strong></li>
            <li><span>Qiimo habeenkii</span><strong>$${room.price}</strong></li>
            <li class="grand"><span>Wadarta</span><strong>$${totalPrice}</strong></li>
          </ul>
        </div>

        <div class="form-card">
          <h2>Xogtaada</h2>
          <div class="field">
            <label for="name">Magaca oo dhan</label>
            <input type="text" id="name" value="${esc(user.name)}">
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input type="email" id="email" value="${esc(user.email)}">
          </div>
          <div class="field">
            <label for="phone">Taleefan</label>
            <input type="tel" id="phone" placeholder="+252 ...">
          </div>
          <p class="error" id="error"></p>
          <button class="btn" id="confirmBtn">Xaqiiji Booking-ka</button>
        </div>
      </div>
    `;

    const error = document.getElementById("error");

    document.getElementById("confirmBtn").addEventListener("click", () => {
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();

      if (!name || !email || !phone) {
        error.textContent = "Fadlan buuxi dhammaan meelaha.";
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        error.textContent = "Email-ku sax ma aha.";
        return;
      }
      if (!DB.isAvailable(room.id, checkIn, checkOut)) {
        error.textContent = "Waan ka xunnahay, qolkan taariikhahaas waa la qabsaday. Dooro taariikho kale.";
        return;
      }

      const booking = DB.insert("bookings", {
        userId: user.id,
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        roomId: room.id,
        checkIn,
        checkOut,
        guests,
        totalPrice,
        status: "pending",
        createdAt: new Date().toISOString()
      });

      box.innerHTML = `
        <div class="success">
          <div class="check">✅</div>
          <h2>Booking-ku waa guuleystay!</h2>
          <p>Lambarka booking-ka: <strong>#${booking.id}</strong></p>
          <p>${esc(room.name)} • ${esc(checkIn)} → ${esc(checkOut)} • $${totalPrice}</p>
          <p class="muted">Xaaladda: pending (admin ayaa xaqiijin doona)</p>
          <a href="my-bookings.html" class="btn">Arag Bookings-kayga</a>
        </div>
      `;
    });
  }
}
