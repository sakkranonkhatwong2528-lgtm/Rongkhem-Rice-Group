// ============================================================
// database.js
// Rongkhem Rice Group
// Firebase Firestore - Cloud Database
// ============================================================


// ============================================================
// IMPORT FIREBASE
// ============================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";


import {

    getFirestore,

    collection,

    addDoc,

    getDocs,

    doc,

    updateDoc,

    deleteDoc,

    onSnapshot

} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

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


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

const app =
    initializeApp(
        firebaseConfig
    );


const db =
    getFirestore(
        app
    );


// ============================================================
// EXPORT DATABASE
// ============================================================

export {
    db
};


// ============================================================
// SAVE DATA
// ============================================================

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
                        new Date()
                        .toISOString()

                }

            );


        console.log(

            "✅ Firebase Save:",

            collectionName,

            docRef.id

        );


        return {

            success:
                true,

            id:
                docRef.id

        };

    }

    catch (error) {

        console.error(

            "❌ Firebase Save Error:",

            collectionName,

            error

        );


        return {

            success:
                false,

            error:
                error.message

        };

    }

}


// ============================================================
// LOAD DATA
//
// คืนค่า:
// [
//   {
//     id: Firestore ID,
//     firestoreId: Firestore ID,
//     ...ข้อมูล
//   }
// ]
//
// รองรับทั้ง members.js
// receive.js
// index.html
// ============================================================

export async function loadData(
    collectionName
) {

    try {

        const querySnapshot =
            await getDocs(

                collection(
                    db,
                    collectionName
                )

            );


        const list = [];


        querySnapshot.forEach(
            item => {

                list.push({

                    id:
                        item.id,

                    firestoreId:
                        item.id,

                    ...item.data()

                });

            }
        );


        console.log(

            "📥 Firebase Load:",

            collectionName,

            list.length,

            "รายการ"

        );


        return list;

    }

    catch (error) {

        console.error(

            "❌ Firebase Load Error:",

            collectionName,

            error

        );


        return [];

    }

}


// ============================================================
// LOAD DATA
//
// ชื่อสำรองสำหรับโค้ดเดิม
// ============================================================

export async function loadDataWithFirestoreId(
    collectionName
) {

    return await loadData(
        collectionName
    );

}


// ============================================================
// UPDATE DATA
// ============================================================

export async function updateData(

    collectionName,

    docId,

    data

) {

    try {

        if (!docId) {

            throw new Error(
                "ไม่พบ Firestore Document ID"
            );

        }


        const cleanData = {

            ...data

        };


        // ป้องกันการเขียน ID ทับข้อมูลเดิม

        delete cleanData.id;

        delete cleanData.firestoreId;


        const documentRef =
            doc(

                db,

                collectionName,

                docId

            );


        await updateDoc(

            documentRef,

            {

                ...cleanData,

                updatedAt:
                    new Date()
                    .toISOString()

            }

        );


        console.log(

            "✏️ Firebase Update:",

            collectionName,

            docId

        );


        return {

            success:
                true

        };

    }

    catch (error) {

        console.error(

            "❌ Firebase Update Error:",

            collectionName,

            error

        );


        return {

            success:
                false,

            error:
                error.message

        };

    }

}


// ============================================================
// DELETE DATA
// ============================================================

export async function deleteData(

    collectionName,

    docId

) {

    try {

        if (!docId) {

            throw new Error(
                "ไม่พบ Firestore Document ID"
            );

        }


        await deleteDoc(

            doc(

                db,

                collectionName,

                docId

            )

        );


        console.log(

            "🗑️ Firebase Delete:",

            collectionName,

            docId

        );


        return {

            success:
                true

        };

    }

    catch (error) {

        console.error(

            "❌ Firebase Delete Error:",

            collectionName,

            error

        );


        return {

            success:
                false,

            error:
                error.message

        };

    }

}


// ============================================================
// REALTIME SUBSCRIBE
//
// เมื่อข้อมูลเปลี่ยน:
// มือถือ
// คอมพิวเตอร์
// แท็บเล็ต
//
// จะอัปเดตข้อมูลใหม่ทันที
// ============================================================

export function subscribeData(

    collectionName,

    callback

) {

    try {

        const collectionRef =
            collection(

                db,

                collectionName

            );


        const unsubscribe =
            onSnapshot(

                collectionRef,

                snapshot => {

                    const list = [];


                    snapshot.forEach(
                        item => {

                            list.push({

                                id:
                                    item.id,

                                firestoreId:
                                    item.id,

                                ...item.data()

                            });

                        }
                    );


                    console.log(

                        "🔄 Firebase Real-time:",

                        collectionName,

                        list.length,

                        "รายการ"

                    );


                    callback(
                        list
                    );

                },


                error => {

                    console.error(

                        "❌ Firebase Real-time Error:",

                        collectionName,

                        error

                    );

                }

            );


        return unsubscribe;

    }

    catch (error) {

        console.error(

            "❌ ไม่สามารถเปิด Real-time ได้:",

            collectionName,

            error

        );


        return () => {};

    }

}


// ============================================================
// DATABASE READY
// ============================================================

console.log(
    "☁️ Rongkhem Rice Group Firebase Ready"
);
