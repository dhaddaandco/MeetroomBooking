const rooms = [
  { name: "Darshan", floor: "2nd Floor" },
  { name: "Jnan", floor: "2nd Floor" },
  { name: "Charitra", floor: "2nd Floor" },
  { name: "Setu", floor: "1st Floor" },
  { name: "Samvad", floor: "1st Floor" }
];

const bookingForm = document.querySelector("#bookingForm");
const roomGrid = document.querySelector("#roomGrid");
const formMessage = document.querySelector("#formMessage");
const clearBookingsButton = document.querySelector("#clearBookings");
const liveClock = document.querySelector("#liveClock");
const todayLabel = document.querySelector("#todayLabel");
const roomCardTemplate = document.querySelector("#roomCardTemplate");
const floorTabs = document.querySelectorAll(".floor-tab");

let activeFloor = "All";
let bookings = JSON.parse(localStorage.getItem("meetingRoomBookings") || "[]");

function saveBookings() {
  localStorage.setItem("meetingRoomBookings", JSON.stringify(bookings));
}

function formatTime(time) {
  const [hour, minute] = time.split(":");
  const date = new Date();
  date.setHours(Number(hour), Number(minute));
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function setMessage(message, type = "error") {
  formMessage.textContent = message;
  formMessage.classList.toggle("success", type === "success");
}

function bookingOverlaps(newBooking) {
  return bookings.some((booking) => {
    return booking.roomName === newBooking.roomName
      && newBooking.fromTime < booking.toTime
      && newBooking.toTime > booking.fromTime;
  });
}

function renderRooms() {
  roomGrid.innerHTML = "";

  rooms
    .filter((room) => activeFloor === "All" || room.floor === activeFloor)
    .forEach((room) => {
      const card = roomCardTemplate.content.firstElementChild.cloneNode(true);
      const roomBookings = bookings
        .filter((booking) => booking.roomName === room.name)
        .sort((a, b) => a.fromTime.localeCompare(b.fromTime));

      card.querySelector("h3").textContent = room.name;
      card.querySelector(".floor-label").textContent = room.floor;

      const status = card.querySelector(".room-status");
      status.textContent = roomBookings.length ? `${roomBookings.length} booked` : "Available";
      status.classList.toggle("busy", roomBookings.length > 0);

      const list = card.querySelector(".booking-list");
      if (!roomBookings.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "No bookings yet.";
        list.append(empty);
      }

      roomBookings.forEach((booking) => {
        const item = document.createElement("div");
        item.className = "booking-item";
        const time = document.createElement("strong");
        const team = document.createElement("span");
        const purpose = document.createElement("span");

        time.textContent = `${formatTime(booking.fromTime)} - ${formatTime(booking.toTime)}`;
        team.textContent = booking.teamName;
        purpose.textContent = booking.purpose;

        item.append(time, team, purpose);
        list.append(item);
      });

      roomGrid.append(card);
    });
}

function updateClock() {
  const now = new Date();
  liveClock.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  todayLabel.textContent = now.toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "short"
  });
}

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const roomSelect = document.querySelector("#roomName");
  const newBooking = {
    id: crypto.randomUUID(),
    roomName: roomSelect.value,
    floor: roomSelect.selectedOptions[0]?.dataset.floor,
    fromTime: document.querySelector("#fromTime").value,
    toTime: document.querySelector("#toTime").value,
    teamName: document.querySelector("#teamName").value.trim(),
    purpose: document.querySelector("#purpose").value.trim()
  };

  if (newBooking.toTime <= newBooking.fromTime) {
    setMessage("Please choose a To time after the From time.");
    return;
  }

  if (bookingOverlaps(newBooking)) {
    setMessage(`${newBooking.roomName} already has a booking during this time.`);
    return;
  }

  bookings = [...bookings, newBooking];
  saveBookings();
  renderRooms();
  bookingForm.reset();
  setMessage("Booking added successfully.", "success");
});

clearBookingsButton.addEventListener("click", () => {
  bookings = [];
  saveBookings();
  renderRooms();
  setMessage("All bookings cleared.", "success");
});

floorTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeFloor = tab.dataset.floor;
    floorTabs.forEach((button) => button.classList.toggle("active", button === tab));
    renderRooms();
  });
});

updateClock();
renderRooms();
setInterval(updateClock, 1000);
