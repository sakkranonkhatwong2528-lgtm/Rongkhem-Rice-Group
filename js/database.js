// =============================================================
// 🌾 Rongkhem Rice Group - Cloud Database
// ใช้ Firebase Firestore เป็นฐานข้อมูลกลาง
// มือถือ / คอมพิวเตอร์ / แท็บเล็ต ใช้ข้อมูลชุดเดียวกัน
// =============================================================

import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from
"https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


// =============================================================
// 🔥 Firebase Configuration
// =============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCme8E32QPySbSetpZP9_yAyiHpSGmlxlc",
  authDomain: "rongkhem-rice-group.firebaseapp.com",
  projectId: "rongkhem-rice-group",
  storageBucket: "rongkhem-rice-group.firebasestorage.app",
  messagingSenderId: "114954787725",
  appId: "1:114954787725:web:d18bb54ac53bc00db17bc4",
  measurementId: "G-70Z00XXB8Y"
};


// =============================================================
// 🚀 เริ่มต้น Firebase
// =============================================================

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);


// =============================================================
// 💾 บันทึกข้อมูลใหม่
// =============================================================

export async function saveData(collectionName, data) {

  try {

    const docRef = await addDoc(
      collection(db, collectionName),
      {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    );

    console.log(
      "✅ บันทึกข้อมูลสำเร็จ:",
      collectionName,
      docRef.id
    );

    return {
      success: true,
      id: docRef.id
    };

  } catch (error) {

    console.error(
      "❌ บันทึกข้อมูลไม่สำเร็จ:",
      error
    );

    return {
      success: false,
      error: error.message
    };

  }

}


// =============================================================
// 📥 โหลดข้อมูลทั้งหมด
// =============================================================

export async function loadData(
  collectionName,
  orderField = null
) {

  try {

    let ref = collection(
      db,
      collectionName
    );

    let snapshot;

    if (orderField) {

      const q = query(
        ref,
        orderBy(orderField, "desc")
      );

      snapshot = await getDocs(q);

    } else {

      snapshot = await getDocs(ref);

    }


    const list = [];

    snapshot.forEach((item) => {

      list.push({
        id: item.id,
        ...item.data()
      });

    });


    console.log(
      "📥 โหลดข้อมูลสำเร็จ:",
      collectionName,
      list.length,
      "รายการ"
    );


    return list;

  } catch (error) {

    console.error(
      "❌ โหลดข้อมูลไม่สำเร็จ:",
      collectionName,
      error
    );

    return [];

  }

}


// =============================================================
// 🔎 โหลดข้อมูล 1 รายการ
// =============================================================

export async function loadOneData(
  collectionName,
  docId
) {

  try {

    const docRef = doc(
      db,
      collectionName,
      docId
    );

    const snapshot = await getDoc(
      docRef
    );


    if (!snapshot.exists()) {

      return null;

    }


    return {
      id: snapshot.id,
      ...snapshot.data()
    };

  } catch (error) {

    console.error(
      "❌ โหลดข้อมูลไม่สำเร็จ:",
      error
    );

    return null;

  }

}


// =============================================================
// ✏️ แก้ไขข้อมูล
// =============================================================

export async function updateData(
  collectionName,
  docId,
  data
) {

  try {

    const docRef = doc(
      db,
      collectionName,
      docId
    );


    await updateDoc(
      docRef,
      {
        ...data,
        updatedAt: serverTimestamp()
      }
    );


    console.log(
      "✏️ แก้ไขข้อมูลสำเร็จ:",
      collectionName,
      docId
    );


    return {
      success: true
    };

  } catch (error) {

    console.error(
      "❌ แก้ไขข้อมูลไม่สำเร็จ:",
      error
    );


    return {
      success: false,
      error: error.message
    };

  }

}


// =============================================================
// 🔁 บันทึกหรืออัปเดตข้อมูลตาม ID
// =============================================================

export async function setData(
  collectionName,
  docId,
  data
) {

  try {

    const docRef = doc(
      db,
      collectionName,
      docId
    );


    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: serverTimestamp()
      },
      {
        merge: true
      }
    );


    return {
      success: true,
      id: docId
    };

  } catch (error) {

    console.error(
      "❌ บันทึกข้อมูลไม่สำเร็จ:",
      error
    );


    return {
      success: false,
      error: error.message
    };

  }

}


// =============================================================
// 🗑️ ลบข้อมูล
// =============================================================

export async function deleteData(
  collectionName,
  docId
) {

  try {

    await deleteDoc(
      doc(
        db,
        collectionName,
        docId
      )
    );


    console.log(
      "🗑️ ลบข้อมูลสำเร็จ:",
      collectionName,
      docId
    );


    return {
      success: true
    };

  } catch (error) {

    console.error(
      "❌ ลบข้อมูลไม่สำเร็จ:",
      error
    );


    return {
      success: false,
      error: error.message
    };

  }

}


// =============================================================
// 🔴 ติดตามข้อมูลแบบ Real-time
// ข้อมูลเปลี่ยนจากมือถือ → คอม/แท็บเล็ตอัปเดตตาม
// =============================================================

export function subscribeData(
  collectionName,
  callback,
  orderField = null
) {

  try {

    let ref = collection(
      db,
      collectionName
    );


    if (orderField) {

      ref = query(
        ref,
        orderBy(orderField, "desc")
      );

    }


    return onSnapshot(
      ref,

      (snapshot) => {

        const list = [];

        snapshot.forEach((item) => {

          list.push({
            id: item.id,
            ...item.data()
          });

        });


        console.log(
          "🔄 ข้อมูลอัปเดต:",
          collectionName,
          list.length,
          "รายการ"
        );


        callback(list);

      },

      (error) => {

        console.error(
          "❌ Real-time error:",
          error
        );

      }

    );

  } catch (error) {

    console.error(
      "❌ Subscribe error:",
      error
    );

    return null;

  }

}
