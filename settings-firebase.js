import { db, auth } from "./firebase-config.js";
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const usersCol = collection(db, "systemUsers");
const settingsDoc = doc(db, "settings", "general");

/* ===== รายชื่อผู้ใช้งาน real-time ===== */
function listenUsers(callback) {
  return onSnapshot(usersCol, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

/* ===== เพิ่มผู้ใช้งาน (สร้างบัญชี Auth + บันทึกสิทธิ์ใน Firestore) ===== */
async function addSystemUser({ name, email, tempPassword, phone, role }) {
  // สร้างบัญชี Auth
  const cred = await createUserWithEmailAndPassword(auth, email, tempPassword);
  // บันทึกข้อมูลสิทธิ์เพิ่มเติมใน Firestore
  await addDoc(usersCol, {
    uid: cred.user.uid, name, email, phone, role,
    createdAt: new Date().toISOString()
  });
}

async function updateSystemUser(id, data) {
  return await updateDoc(doc(db, "systemUsers", id), data);
}
async function deleteSystemUser(id) {
  return await deleteDoc(doc(db, "systemUsers", id));
}

/* ===== ตั้งค่าทั่วไป (ราคาข้าว/โควตา) ===== */
import { getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

async function saveGeneralSettings(data) {
  return await setDoc(settingsDoc, data, { merge: true });
}
async function loadGeneralSettings() {
  const snap = await getDoc(settingsDoc);
  return snap.exists() ? snap.data() : null;
}

export {
  listenUsers, addSystemUser, updateSystemUser, deleteSystemUser,
  saveGeneralSettings, loadGeneralSettings
};
