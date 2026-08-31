import { db } from "./firebase-config.js";
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const riceCol = collection(db, "riceRecords");

/* ===== ดึงรายการรับข้าวเฉพาะงานศพที่กำลังดำเนินอยู่ ===== */
function listenRiceRecords(funeralId, callback) {
  const q = query(riceCol, where("funeralId", "==", funeralId), orderBy("receivedAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

/* ===== บันทึกรับข้าวใหม่ ===== */
async function addRiceRecord(data) {
  return await addDoc(riceCol, {
    ...data,
    receivedAt: serverTimestamp()
  });
}

/* ===== แก้ไข / ลบ ===== */
async function updateRiceRecord(id, data) {
  return await updateDoc(doc(db, "riceRecords", id), data);
}
async function deleteRiceRecord(id) {
  return await deleteDoc(doc(db, "riceRecords", id));
}

/* ===== อัปเดตสถานะสมาชิกอัตโนมัติเมื่อบันทึกรับข้าว ===== */
import { doc as docRef, updateDoc as updateMemberStatus } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

async function markMemberAsPaid(memberId, funeralId) {
  const ref = docRef(db, "members", memberId);
  await updateMemberStatus(ref, {
    [`riceStatus.${funeralId}`]: "received"
  });
}

export { listenRiceRecords, addRiceRecord, updateRiceRecord, deleteRiceRecord, markMemberAsPaid };
