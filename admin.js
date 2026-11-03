// js/admin.js — Dashboard-ka admin-ka

const admin = Auth.require("admin");

if (admin) {
  const DEFAULT_IMG = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600";

  // ---------- Tabs ----------
  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".tab-panel").forEach(p => {
        p.hidden = p.id !== "tab-" + btn.dataset.tab;
      });
    });
  });

  // ---------- Stats ----------
  function renderStats() {
    const bookings = DB.get("bookings");
    const confirmed = bookings.filter(b => b.status === "confirmed");
    const revenue = confirmed.reduce((s, b) => s + b.totalPrice, 0);
    document.getElementById("stats").innerHTML = `
      <div class="stat"><span>${bookings.length}</span>Bookings guud</div>
      <div class="stat"><span>${bookings.filter(b => b.status === "pending").length}</span>Pending</div>
      <div class="stat"><span>${confirmed.length}</span>Confirmed</div>
      <div class="stat"><span>$${revenue}</span>Dakhli (confirmed)</div>
      <div class="stat"><span>${DB.get("rooms").length}</span>Qolal</div>
    `;
  }

  // ---------- Bookings ----------
  function renderBookings() {
    const rows = DB.get("bookings").sort((a, b) => b.id - a.id).map(b => {
      const room = DB.findById("rooms", b.roomId);
      return `
        <tr>
          <td>#${b.id}</td>
          <td>${esc(b.guestName)}<br><small class="muted">${esc(b.guestEmail)}<br>${esc(b.guestPhone)}</small></td>
          <td>${room ? esc(room.name) : "—"}</td>
          <td>${esc(b.checkIn)} → ${esc(b.checkOut)}</td>
          <td>$${b.totalPrice}</td>
          <td><span class="badge ${b.status}">${b.status}</span></td>
          <td class="actions">
            ${b.status === "pending" ? `<button class="btn btn-sm" data-act="confirm" data-id="${b.id}">Oggolow</button>` : ""}
            ${b.status !== "cancelled" ? `<button class="btn btn-sm btn-danger" data-act="cancel" data-id="${b.id}">Diid</button>` : ""}
          </td>
        </tr>`;
    }).join("");
    document.getElementById("bookingRows").innerHTML =
      rows || `<tr><td colspan="7" class="empty">Weli booking ma jiro.</td></tr>`;
  }

  document.getElementById("bookingRows").addEventListener("click", e => {
    const { act, id } = e.target.dataset;
    if (!act) return;
    DB.update("bookings", id, { status: act === "confirm" ? "confirmed" : "cancelled" });
    renderBookings(); renderStats();
  });

  // ---------- Rooms ----------
  const form = document.getElementById("roomForm");
  const f = id => document.getElementById(id);

  function renderRooms() {
    f("roomRows").innerHTML = DB.get("rooms").map(r => `
      <tr>
        <td>${esc(r.name)}</td>
        <td>${esc(r.type)}</td>
        <td>$${r.price}</td>
        <td>${r.capacity}</td>
        <td class="actions">
          <button class="btn btn-sm" data-act="edit" data-id="${r.id}">Wax ka beddel</button>
          <button class="btn btn-sm btn-danger" data-act="delete" data-id="${r.id}">Tirtir</button>
        </td>
      </tr>`).join("");
  }

  function resetForm() {
    form.reset();
    f("roomId").value = "";
    f("formTitle").textContent = "Ku dar qol cusub";
    f("cancelEdit").hidden = true;
    f("formError").textContent = "";
  }

  f("roomRows").addEventListener("click", e => {
    const { act, id } = e.target.dataset;
    if (!act) return;
    const room = DB.findById("rooms", id);

    if (act === "edit") {
      f("roomId").value = room.id;
      f("rName").value = room.name;
      f("rType").value = room.type;
      f("rPrice").value = room.price;
      f("rCap").value = room.capacity;
      f("rDesc").value = room.description;
      f("rAmen").value = room.amenities.join(", ");
      f("rImg").value = room.image;
      f("formTitle").textContent = "Wax ka beddel: " + room.name;
      f("cancelEdit").hidden = false;
      form.scrollIntoView({ behavior: "smooth" });
    }

    if (act === "delete") {
      const active = DB.get("bookings").some(b => b.roomId === room.id && b.status !== "cancelled");
      const msg = active
        ? "Qolkan wuxuu leeyahay bookings firfircoon. Weli ma tirtiraa?"
        : "Ma hubtaa inaad tirtirto qolkan?";
      if (confirm(msg)) {
        DB.remove("rooms", id);
        renderRooms(); renderStats(); renderBookings();
      }
    }
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const price = Number(f("rPrice").value);
    const capacity = Number(f("rCap").value);
    if (price <= 0 || capacity <= 0) {
      f("formError").textContent = "Qiimaha iyo dadka waa inay ka weyn yihiin 0.";
      return;
    }
    const data = {
      name: f("rName").value.trim(),
      type: f("rType").value,
      price,
      capacity,
      description: f("rDesc").value.trim(),
      amenities: f("rAmen").value.split(",").map(s => s.trim()).filter(Boolean),
      image: f("rImg").value.trim() || DEFAULT_IMG
    };
    if (f("roomId").value) DB.update("rooms", f("roomId").value, data);
    else DB.insert("rooms", data);

    resetForm(); renderRooms(); renderStats();
  });

  f("cancelEdit").addEventListener("click", resetForm);

  renderStats(); renderBookings(); renderRooms();
}
