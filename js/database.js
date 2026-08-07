// Import สคริปต์ Firebase (เวอร์ชัน Web CDN ใช้งานบนมือถือได้ทันที)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// รหัสเชื่อมต่อ Firebase ของกลุ่มข้าวรงเขม
const firebaseConfig = {
  apiKey: "AIzaSyCme8E32QPySbSetpZP9_yAyiHpSGmlxlc",
  authDomain: "rongkhem-rice-group.firebaseapp.com",
  projectId: "rongkhem-rice-group",
  storageBucket: "rongkhem-rice-group.firebasestorage.app",
  messagingSenderId: "114954787725",
  appId: "1:114954787725:web:d18bb54ac53bc00db17bc4",
  measurementId: "G-70Z00XXB8Y"
};

// เริ่มต้นระบบ Firestore Database
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// -------------------------------------------------------------
// ฟังก์ชันบันทึก / ดึง / ลบ ข้อมูลผ่าน Cloud Database
// -------------------------------------------------------------

// 1. บันทึกข้อมูลใหม่ (เช่น บันทึกสมาชิก, บันทึกงานศพ)
export async function saveData(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString()
    });
    console.log("บันทึกขึ้น Cloud เรียบร้อย ID:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
    return { success: false, error };
  }
}

// 2. ดึงข้อมูลทั้งหมด
export async function loadData(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    let list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
    return [];
  }
}

// 3. ลบข้อมูล
export async function deleteData(collectionName, docId) {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return { success: true };
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลบ:", error);
    return { success: false, error };
  }
}
