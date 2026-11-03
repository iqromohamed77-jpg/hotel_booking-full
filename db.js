// js/db.js — Database layer (localStorage)

const DB = {
  get(table) {
    return JSON.parse(localStorage.getItem(table)) || [];
  },

  save(table, data) {
    localStorage.setItem(table, JSON.stringify(data));
  },

  insert(table, record) {
    const data = this.get(table);
    record.id = data.length ? Math.max(...data.map(r => r.id)) + 1 : 1;
    data.push(record);
    this.save(table, data);
    return record;
  },

  findById(table, id) {
    return this.get(table).find(r => r.id === Number(id));
  },

  update(table, id, changes) {
    const data = this.get(table).map(r =>
      r.id === Number(id) ? { ...r, ...changes } : r
    );
    this.save(table, data);
  },

  remove(table, id) {
    this.save(table, this.get(table).filter(r => r.id !== Number(id)));
  },

  // Hubi in qolku bannaan yahay taariikhahaas
  isAvailable(roomId, checkIn, checkOut) {
    return !this.get("bookings").some(b =>
      b.roomId === Number(roomId) &&
      b.status !== "cancelled" &&
      checkIn < b.checkOut &&
      checkOut > b.checkIn
    );
  },

  // Xog bilow ah (mar keliya ayay shaqeysaa)
  seed() {
    if (this.get("rooms").length) return;

    this.save("users", [
      { id: 1, name: "Admin", email: "admin@hotel.com", password: "admin123", role: "admin" }
    ]);

    this.save("rooms", [
      { id: 1, name: "Standard Single", type: "Single", price: 40, capacity: 1,
        description: "Qol raaxo leh oo hal qof ku habboon.",
        amenities: ["WiFi", "AC", "TV"],
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600" },
      { id: 2, name: "Deluxe Double", type: "Double", price: 70, capacity: 2,
        description: "Sariir weyn iyo muuqaal quruxsan.",
        amenities: ["WiFi", "AC", "TV", "Mini Bar"],
        image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600" },
      { id: 3, name: "Royal Suite", type: "Suite", price: 150, capacity: 4,
        description: "Suite weyn oo qoys ama VIP ah.",
        amenities: ["WiFi", "AC", "TV", "Mini Bar", "Balcony", "Breakfast"],
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600" }
    ]);

    this.save("bookings", []);
  }
};

DB.seed();
