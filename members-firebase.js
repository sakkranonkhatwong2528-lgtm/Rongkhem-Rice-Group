import { db } from "./firebase-config.js";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const membersCollection = collection(db, "members");

/* ===== ดึงข้อมูลแบบ Real-time ===== */
function listenMembers(callback) {
  return onSnapshot(membersCollection, (snapshot) => {
    const members = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(members);
  });
}

/* ===== เพิ่มสมาชิกใหม่ ===== */
async function addMember(data) {
  return await addDoc(membersCollection, {
    ...data,
    createdAt: new Date().toISOString()
  });
}

/* ===== แก้ไขสมาชิก ===== */
async function updateMember(id, data) {
  const ref = doc(db, "members", id);
  return await updateDoc(ref, data);
}

/* ===== ลบสมาชิก ===== */
async function deleteMember(id) {
  const ref = doc(db, "members", id);
  return await deleteDoc(ref);
}

/* ===== ใช้งานแทน mock data เดิม ===== */
listenMembers((members) => {
  allMembers = members;  // แทนที่ตัวแปร mock เดิมในไฟล์ members.js
  renderMembers();
  renderSummary();
});

export { addMember, updateMember, deleteMember };
