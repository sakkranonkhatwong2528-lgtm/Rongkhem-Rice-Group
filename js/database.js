// ==========================================
// database.js
// Firebase Firestore Database
// ใช้ร่วมกันทั้งมือถือ คอมพิวเตอร์ และแท็บเล็ต
// ==========================================

import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp
} from
"https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


// ==========================================
// Firebase Config
// ==========================================

const firebaseConfig = {

  apiKey:
    "AIzaSyCme8E32QPySbSetpZP9_yAyiHpSGmlxlc",

  authDomain:
    "rongkhem-rice-group.firebaseapp.com",

  projectId:
    "rongkhem-rice-group",

  storageBucket:
    "rongkhem-rice-group.firebasestorage.app",

  messagingSenderId:
    "114954787725",

  appId:
    "1:114954787725:web:d18bb54ac53bc00db17bc4",

  measurementId:
    "G-70Z00XXB8Y"

};


// ==========================================
// เริ่มต้น Firebase
// ==========================================

const app =
  initializeApp(firebaseConfig);

export const db =
  getFirestore(app);

console.log(
  "🔥 Firebase Firestore พร้อมใช้งาน"
);


// ==========================================
// บันทึกข้อมูลใหม่
// ==========================================

export async function saveData(
  collectionName,
  data
) {

  try {

    const docRef =
      await addDoc(

        collection(
          db,
          collectionName
        ),

        {

          ...data,

          createdAt:
            data.createdAt ||
            new Date()
            .toISOString(),

          updatedAt:
            new Date()
            .toISOString()

        }

      );


    console.log(
      "✅ บันทึกข้อมูลสำเร็จ:",
      collectionName,
      docRef.id
    );


    return {

      success: true,

      id:
        docRef.id

    };

  } catch (error) {

    console.error(
      "❌ บันทึกข้อมูลไม่สำเร็จ:",
      error
    );


    return {

      success: false,

      error:
        error.message ||
        String(error)

    };

  }

}


// ==========================================
// โหลดข้อมูลทั้งหมด
// ==========================================

export async function loadData(
  collectionName
) {

  try {

    const snapshot =
      await getDocs(

        collection(
          db,
          collectionName
        )

      );


    const list = [];


    snapshot.forEach(
      item => {

        list.push({

          id:
            item.id,

          ...item.data()

        });

      }
    );


    console.log(
      "📥 โหลดข้อมูล:",
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


// ==========================================
// โหลดข้อมูล 1 รายการ
// ==========================================

export async function getData(
  collectionName,
  documentId
) {

  try {

    const documentRef =
      doc(
        db,
        collectionName,
        documentId
      );


    const snapshot =
      await getDoc(
        documentRef
      );


    if (
      !snapshot.exists()
    ) {

      return null;

    }


    return {

      id:
        snapshot.id,

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


// ==========================================
// แก้ไขข้อมูล
// ==========================================

export async function updateData(
  collectionName,
  documentId,
  data
) {

  try {

    if (
      !documentId
    ) {

      throw new Error(
        "ไม่พบ Document ID"
      );

    }


    const documentRef =
      doc(
        db,
        collectionName,
        documentId
      );


    await updateDoc(

      documentRef,

      {

        ...data,

        updatedAt:
          new Date()
          .toISOString()

      }

    );


    console.log(
      "✏️ แก้ไขข้อมูลสำเร็จ:",
      collectionName,
      documentId
    );


    return {

      success: true,

      id:
        documentId

    };

  } catch (error) {

    console.error(
      "❌ แก้ไขข้อมูลไม่สำเร็จ:",
      error
    );


    return {

      success: false,

      error:
        error.message ||
        String(error)

    };

  }

}


// ==========================================
// บันทึกแบบกำหนด Document ID
// ใช้สำหรับข้อมูลที่ต้องการ ID คงที่
// ==========================================

export async function saveDataWithId(
  collectionName,
  documentId,
  data
) {

  try {

    const documentRef =
      doc(
        db,
        collectionName,
        documentId
      );


    await setDoc(

      documentRef,

      {

        ...data,

        updatedAt:
          new Date()
          .toISOString()

      },

      {

        merge: true

      }

    );


    return {

      success: true,

      id:
        documentId

    };

  } catch (error) {

    console.error(
      "❌ บันทึกข้อมูลไม่สำเร็จ:",
      error
    );


    return {

      success: false,

      error:
        error.message ||
        String(error)

    };

  }

}


// ==========================================
// ลบข้อมูล
// ==========================================

export async function deleteData(
  collectionName,
  documentId
) {

  try {

    if (
      !documentId
    ) {

      throw new Error(
        "ไม่พบ Document ID"
      );

    }


    await deleteDoc(

      doc(
        db,
        collectionName,
        documentId
      )

    );


    console.log(
      "🗑️ ลบข้อมูลสำเร็จ:",
      collectionName,
      documentId
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

      error:
        error.message ||
        String(error)

    };

  }

}


// ==========================================
// ทดสอบการเชื่อมต่อ Firebase
// ==========================================

export async function testFirebase() {

  try {

    await getDocs(
      collection(
        db,
        "members"
      )
    );


    return {

      success: true,

      message:
        "เชื่อมต่อ Firebase สำเร็จ"

    };

  } catch (error) {

    console.error(error);


    return {

      success: false,

      message:
        error.message ||
        "ไม่สามารถเชื่อมต่อ Firebase"

    };

  }

}
