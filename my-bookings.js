// js/my-bookings.js — Bookings-ka isticmaalaha

const user = Auth.require();
const list = document.getElementById("list");

function render() {
  const bookings = DB.get("bookings")
    .filter(b => b.userId === user.id)
    .sort((a, b) => b.id - a.id);

  if (!bookings.length) {
    list.innerHTML = `<p class="empty">Weli booking ma lihid. <a href="rooms.html"><u>Dooro qol</u></a></p>`;
    return;
  }

  list.innerHTML = bookings.map(b => {
    const room = DB.findById("rooms", b.roomId);
    const canCancel = b.status !== "cancelled" && b.checkIn > new Date().toISOString().split("T")[0];
    return `
      <div class="booking-item">
        <img src="${room ? room.image : ""}" alt="">
        <div class="bi-info">
          <h3>${room ? esc(room.name) : "Qol la tirtiray"} <span class="badge ${b.status}">${b.status}</span></h3>
          <p>📅 ${esc(b.checkIn)} → ${esc(b.checkOut)} • 👥 ${b.guests} qof</p>
          <p class="muted">Booking #${b.id} • La sameeyay ${esc(b.createdAt.split("T")[0])}</p>
        </div>
        <div class="bi-side">
          <div class="price">$${b.totalPrice}</div>
          ${canCancel ? `<button class="btn btn-danger" data-cancel="${b.id}">Kansal</button>` : ""}
        </div>
      </div>`;
  }).join("");
}

if (user) {
  list.addEventListener("click", e => {
    const id = e.target.dataset.cancel;
    if (!id) return;
    if (confirm("Ma hubtaa inaad kansasho booking-kan?")) {
      DB.update("bookings", id, { status: "cancelled" });
      render();
    }
  });
  render();
}
