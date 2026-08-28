// ==========================================
// database.js
// Rongkhem Rice Group
// Firebase Firestore Database
// ==========================================

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
    onSnapshot
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

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

console.log("🔥 Rongkhem Rice Group Firebase Ready");


// ==========================================
// บันทึกข้อมูลใหม่
// ==========================================

export async function saveData(
    collectionName,
    data
) {

    try {

        const docRef = await addDoc(

            collection(
                db,
                collectionName
            ),

            {
                ...data,

                createdAt:
                    data.createdAt ||
                    new Date().toISOString(),

                updatedAt:
                    new Date().toISOString()
            }

        );


        return {

            success: true,

            id: docRef.id

        };

    }

    catch (error) {

        console.error(
            "❌ Save Error:",
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
// บันทึกข้อมูลแบบกำหนด ID
// ==========================================

export async function saveDataWithId(
    collectionName,
    documentId,
    data
) {

    try {

        await setDoc(

            doc(
                db,
                collectionName,
                documentId
            ),

            {
                ...data,

                updatedAt:
                    new Date().toISOString()
            },

            {
                merge: true
            }

        );


        return {

            success: true,

            id: documentId

        };

    }

    catch (error) {

        console.error(
            "❌ Save With ID Error:",
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

        const snapshot = await getDocs(

            collection(
                db,
                collectionName
            )

        );


        const list = [];


        snapshot.forEach(

            item => {

                list.push({

                    id: item.id,

                    ...item.data()

                });

            }

        );


        return list;

    }

    catch (error) {

        console.error(
            "❌ Load Error:",
            collectionName,
            error
        );

        return [];

    }

}


// ==========================================
// โหลดข้อมูลพร้อม firestoreId
// ใช้สำหรับสมาชิก งานศพ และรายการรับข้าว
// ==========================================

export async function loadDataWithFirestoreId(
    collectionName
) {

    try {

        const snapshot = await getDocs(

            collection(
                db,
                collectionName
            )

        );


        const list = [];


        snapshot.forEach(

            item => {

                list.push({

                    ...item.data(),

                    firestoreId:
                        item.id

                });

            }

        );


        return list;

    }

    catch (error) {

        console.error(
            "❌ Load Firebase Error:",
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

        const snapshot = await getDoc(

            doc(
                db,
                collectionName,
                documentId
            )

        );


        if (!snapshot.exists()) {

            return null;

        }


        return {

            firestoreId:
                snapshot.id,

            ...snapshot.data()

        };

    }

    catch (error) {

        console.error(
            "❌ Get Error:",
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

        if (!documentId) {

            throw new Error(
                "ไม่พบ Firebase Document ID"
            );

        }


        await updateDoc(

            doc(
                db,
                collectionName,
                documentId
            ),

            {
                ...data,

                updatedAt:
                    new Date().toISOString()
            }

        );


        return {

            success: true,

            id:
                documentId

        };

    }

    catch (error) {

        console.error(
            "❌ Update Error:",
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

        if (!documentId) {

            throw new Error(
                "ไม่พบ Firebase Document ID"
            );

        }


        await deleteDoc(

            doc(
                db,
                collectionName,
                documentId
            )

        );


        return {

            success: true

        };

    }

    catch (error) {

        console.error(
            "❌ Delete Error:",
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
// Real-time Firebase
//
// เมื่อมือถือบันทึกข้อมูล
// คอมและแท็บเล็ตจะเห็นทันที
// ==========================================

export function subscribeData(
    collectionName,
    callback
) {

    try {

        const unsubscribe = onSnapshot(

            collection(
                db,
                collectionName
            ),

            snapshot => {

                const list = [];


                snapshot.forEach(

                    item => {

                        list.push({

                            ...item.data(),

                            firestoreId:
                                item.id

                        });

                    }

                );


                callback(
                    list
                );

            },

            error => {

                console.error(

                    "❌ Realtime Error:",

                    collectionName,

                    error

                );

            }

        );


        return unsubscribe;

    }

    catch (error) {

        console.error(
            "❌ Subscribe Error:",
            error
        );


        return () => {};

    }

}
