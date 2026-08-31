import { db, auth } from "./firebase-config.js";
import {
  collection, query, orderBy, limit, onSnapshot, doc, updateDoc, where
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const notifCol = collection(db, "notifications");

function listenNotifications(callback) {
  const q = query(notifCol, orderBy("createdAt", "desc"), limit(20));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

async function markAsRead(notifId) {
  await updateDoc(doc(db, "notifications", notifId), { read: true });
}

function renderNotifications(notifs) {
  const unreadCount = notifs.filter(n => !n.read).length;
  document.getElementById("notifBadge").style.display = unreadCount > 0 ? "flex" : "none";
  document.getElementById("notifBadge").textContent = unreadCount;

  const list = document.getElementById("notifList");
  list.innerHTML = notifs.length
    ? notifs.map(n => `
        <div class="notif-item ${n.read ? "" : "unread"}" data-id="${n.id}">
          <div class="notif-icon"><i class="fa-solid ${n.icon || "fa-bell"}"></i></div>
          <div class="notif-body">
            <p>${n.message}</p>
            <span>${n.createdAt?.toDate().toLocaleString("th-TH") || ""}</span>
          </div>
        </div>
      `).join("")
    : `<p class="notif-empty">ไม่มีการแจ้งเตือน</p>`;

  list.querySelectorAll(".notif-item").forEach(el => {
    el.addEventListener("click", () => markAsRead(el.dataset.id));
  });
}

listenNotifications(renderNotifications);

document.getElementById("notifBellBtn").addEventListener("click", () => {
  document.getElementById("notifDropdown").classList.toggle("show");
});
