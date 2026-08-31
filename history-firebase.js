import { db } from "./firebase-config.js";
import {
  collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, where
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const funeralCol = collection(db, "funerals");

/* ===== งานศพย้อนหลัง (สถานะ = closed) ===== */
function listenFuneralHistory(callback) {
  const q = query(funeralCol, where("status", "==", "closed"), orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

/* ===== ปิดงานศพปัจจุบัน -> ย้ายเข้าประวัติ ===== */
async function closeFuneral(funeralId, summary) {
  const ref = doc(db, "funerals", funeralId);
  return await updateDoc(ref, {
    status: "closed",
    closedAt: new Date().toISOString(),
    summary
  });
}

listenFuneralHistory((items) => {
  allFuneralHistory = items;   // แทน mock data เดิมใน history.js
  renderHistory();
});

export { closeFuneral };
