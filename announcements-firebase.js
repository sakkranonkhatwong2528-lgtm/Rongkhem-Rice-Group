import { db } from "./firebase-config.js";
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const announceCol = collection(db, "announcements");
const q = query(announceCol, orderBy("createdAt", "desc"));

/* ===== Real-time listener ===== */
function listenAnnouncements(callback) {
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

/* ===== CRUD ===== */
async function addAnnouncement(data) {
  return await addDoc(announceCol, { ...data, createdAt: serverTimestamp() });
}
async function updateAnnouncement(id, data) {
  return await updateDoc(doc(db, "announcements", id), data);
}
async function deleteAnnouncement(id) {
  return await deleteDoc(doc(db, "announcements", id));
}

/* ===== เชื่อมกับ UI เดิม ===== */
listenAnnouncements((items) => {
  allAnnouncements = items;   // แทน mock array เดิมใน announcements.js
  renderAnnouncements();
});

export { addAnnouncement, updateAnnouncement, deleteAnnouncement };
