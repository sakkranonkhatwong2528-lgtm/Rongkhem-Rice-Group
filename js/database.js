// นำเข้าฟังก์ชันที่จำเป็นจาก Firebase SDK ผ่าน CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. นำค่า Configuration จาก Firebase Console มาใส่ที่นี่
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "rongkhem-rice-group.firebaseapp.com",
  projectId: "rongkhem-rice-group",
  storageBucket: "rongkhem-rice-group.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 2. เริ่มต้นการทำงานของ Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// -------------------------------------------------------------
// ฟังก์ชันจัดการข้อมูลสมาชิกกลุ่มข้าว (Members)
// -------------------------------------------------------------

// ดึงรายชื่อสมาชิกทั้งหมด
export async function getMembers() {
  try {
    const querySnapshot = await getDocs(collection(db, "members"));
    const members = [];
    querySnapshot.forEach((doc) => {
      members.push({ id: doc.id, ...doc.data() });
    });
    return members;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก: ", error);
    return [];
  }
}

// เพิ่มสมาชิกใหม่
export async function addMember(memberData) {
  try {
    const docRef = await addDoc(collection(db, "members"), {
      ...memberData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเพิ่มสมาชิก: ", error);
    throw error;
  }
}

// -------------------------------------------------------------
// ฟังก์ชันจัดการข้อมูลคลังข้าว (Rice Stock / Receive)
// -------------------------------------------------------------

// เพิ่มรายการรับเข้า/เบิกจ่ายข้าว
export async function addRiceTransaction(transactionData) {
  try {
    const docRef = await addDoc(collection(db, "rice_transactions"), {
      ...transactionData,
      timestamp: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการบันทึกรายการข้าว: ", error);
    throw error;
  }
}

// ส่งออกตัวแปรหลัก db เพื่อให้นำไปใช้ในไฟล์อื่นได้สะดวก
export { db };
