// firebase-config.js
// ใช้งานกับ GitHub Pages ได้ทันที

// ค่าคอนฟิก Firebase จริงจากโครงการของคุณ
const firebaseConfig = {
  apiKey: "*************************_*************",  // อย่าเปลี่ยน API Key
  authDomain: "rongkhem-rice-group.firebaseapp.com",
  projectId: "rongkhem-rice-group",
  storageBucket: "rongkhem-rice-group.firebasestorage.app",
  messagingSenderId: "114954787725",
  appId: "1:114954787725:web:d18bb54ac53bc00db17bc4",
  measurementId: "G-70Z00XXB8Y"
};

// ตรวจสอบว่า Firebase SDK โหลดแล้วหรือยัง
let app, auth, db, storage;

if (typeof firebase === 'undefined') {
  console.error("❌ ERROR: Firebase SDK ยังไม่ได้โหลด!");
  console.error("ตรวจสอบว่าไฟล์ firebase-app.js โหลดก่อนไฟล์นี้");
} else {
  try {
    // เริ่มต้นใช้งาน Firebase
    app = firebase.initializeApp(firebaseConfig);
    
    // เริ่มระบบ Authentication
    auth = firebase.auth();
    
    // เริ่มระบบฐานข้อมูล Firestore
    db = firebase.firestore();
    
    // เริ่มระบบเก็บไฟล์ Storage
    storage = firebase.storage();
    
    console.log("✅ Firebase เริ่มทำงานเรียบร้อยแล้ว");
    
  } catch (error) {
    console.error("🔥 Firebase เริ่มทำงานผิดพลาด:", error.message);
    
    // ถ้า Firebase เริ่มต้นแล้ว ให้ใช้ตัวเดิม
    if (error.code === 'app/duplicate-app') {
      app = firebase.app();
      auth = firebase.auth();
      db = firebase.firestore();
      storage = firebase.storage();
      console.log("ℹ️ ใช้ Firebase ที่เริ่มต้นไว้แล้ว");
    }
  }
}

// ทำให้ตัวแปรใช้งานได้ทั่วทั้งหน้าเว็บ
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseStorage = storage;
window.auth = auth;
window.db = db;
window.storage = storage;

// ฟังก์ชันตรวจสอบการล็อกอิน
window.isUserLoggedIn = function() {
  return auth && auth.currentUser !== null;
};

// ฟังก์ชันดึงข้อมูลผู้ใช้ปัจจุบัน
window.getCurrentUser = function() {
  return auth && auth.currentUser;
};

// ฟังก์ชันดึง UID
window.getCurrentUserId = function() {
  return auth && auth.currentUser ? auth.currentUser.uid : null;
};

// ฟังก์ชันดึงอีเมล
window.getCurrentUserEmail = function() {
  return auth && auth.currentUser ? auth.currentUser.email : null;
};

// ฟังก์ชันเช็คสถานะแอดมิน (ต้องสร้างระบบ Role ของคุณเอง)
window.isUserAdmin = async function() {
  if (!window.isUserLoggedIn()) return false;
  
  try {
    const userId = window.getCurrentUserId();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      return userData.role === 'admin' || userData.isAdmin === true;
    }
    return false;
  } catch (error) {
    console.error("Error checking admin:", error);
    return false;
  }
};

// ฟังก์ชันล็อกเอ้า
window.logoutUser = async function() {
  try {
    await auth.signOut();
    console.log("✅ ออกจากระบบสำเร็จ");
    return true;
  } catch (error) {
    console.error("❌ ออกจากระบบผิดพลาด:", error);
    return false;
  }
};

// แสดงสถานะ Firebase ใน Console (ตอนพัฒนา)
if (window.location.hostname.includes('localhost')) {
  setTimeout(() => {
    console.group("🔥 Firebase Status");
    console.log("App:", !!app ? "✅ ใช้งานได้" : "❌ ไม่พบ");
    console.log("Auth:", !!auth ? "✅ ใช้งานได้" : "❌ ไม่พบ");
    console.log("Firestore:", !!db ? "✅ ใช้งานได้" : "❌ ไม่พบ");
    console.log("Storage:", !!storage ? "✅ ใช้งานได้" : "❌ ไม่พบ");
    console.log("User:", window.isUserLoggedIn() ? "✅ ล็อกอินแล้ว" : "❌ ยังไม่ได้ล็อกอิน");
    if (window.isUserLoggedIn()) {
      console.log("Email:", window.getCurrentUserEmail());
    }
    console.groupEnd();
  }, 1000);
}
