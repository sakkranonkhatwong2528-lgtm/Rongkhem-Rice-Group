// ==========================================
// database.js
// Rongkhem Rice Group
// Firebase Firestore Cloud Database
// ใช้ร่วมกันทั้งมือถือ / คอม / แท็บเล็ต
// ==========================================


// ==========================================
// IMPORT FIREBASE
// ==========================================

import {
    initializeApp
}

from
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

    onSnapshot,

    serverTimestamp,

    query,

    orderBy

}

from
"https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";



// ==========================================
// FIREBASE CONFIG
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
// INITIALIZE FIREBASE
// ==========================================

const app =
    initializeApp(
        firebaseConfig
    );


const db =
    getFirestore(
        app
    );



// ==========================================
// EXPORT DATABASE
// ==========================================

export {
    db
};



// ==========================================
// SAVE DATA
// เพิ่มข้อมูลใหม่
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

            success:
                true,

            id:
                docRef.id

        };

    }

    catch (error) {

        console.error(

            "❌ บันทึกข้อมูลไม่สำเร็จ:",

            error

        );


        return {

            success:
                false,

            error:
                error.message ||
                String(error)

        };

    }

}



// ==========================================
// LOAD DATA
// ดึงข้อมูลทั้งหมด
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


        const list =
            [];


        snapshot.forEach(

            document => {

                list.push(

                    {

                        id:
                            document.id,

                        ...document.data()

                    }

                );

            }

        );


        return list;

    }

    catch (error) {

        console.error(

            "❌ โหลดข้อมูลไม่สำเร็จ:",

            collectionName,

            error

        );


        return [];

    }

}



// ==========================================
// LOAD DATA
// พร้อม firestoreId
// ==========================================

export async function loadDataWithFirestoreId(

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


        const list =
            [];


        snapshot.forEach(

            document => {

                list.push(

                    {

                        firestoreId:
                            document.id,

                        ...document.data()

                    }

                );

            }

        );


        return list;

    }

    catch (error) {

        console.error(

            "❌ โหลดข้อมูลไม่สำเร็จ:",

            collectionName,

            error

        );


        return [];

    }

}



// ==========================================
// GET ONE DOCUMENT
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

            return {

                success:
                    false,

                data:
                    null

            };

        }


        return {

            success:
                true,

            data:

                {

                    firestoreId:
                        snapshot.id,

                    ...snapshot.data()

                }

        };

    }

    catch (error) {

        console.error(

            "❌ ดึงข้อมูลไม่สำเร็จ:",

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



// ==========================================
// UPDATE DATA
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

            success:
                true

        };

    }

    catch (error) {

        console.error(

            "❌ แก้ไขข้อมูลไม่สำเร็จ:",

            error

        );


        return {

            success:
                false,

            error:
                error.message ||
                String(error)

        };

    }

}



// ==========================================
// DELETE DATA
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

            success:
                true

        };

    }

    catch (error) {

        console.error(

            "❌ ลบข้อมูลไม่สำเร็จ:",

            error

        );


        return {

            success:
                false,

            error:
                error.message ||
                String(error)

        };

    }

}



// ==========================================
// REALTIME DATABASE
// ติดตามข้อมูลแบบทันที
// ==========================================

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

                    const list =
                        [];


                    snapshot.forEach(

                        document => {

                            list.push(

                                {

                                    firestoreId:
                                        document.id,

                                    ...document.data()

                                }

                            );

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

            "❌ ไม่สามารถเชื่อม Realtime ได้:",

            error

        );


        return () => {};

    }

}



// ==========================================
// REALTIME SORTED DATA
// ใช้กรณีต้องการเรียงตาม field
// ==========================================

export function subscribeSortedData(

    collectionName,

    orderField,

    direction,

    callback

) {

    try {

        const collectionRef =
            collection(

                db,

                collectionName

            );


        const q =
            query(

                collectionRef,

                orderBy(

                    orderField,

                    direction || "desc"

                )

            );


        return onSnapshot(

            q,

            snapshot => {

                const list =
                    [];


                snapshot.forEach(

                    document => {

                        list.push(

                            {

                                firestoreId:
                                    document.id,

                                ...document.data()

                            }

                        );

                    }

                );


                callback(
                    list
                );

            },

            error => {

                console.error(

                    "❌ Sorted Realtime Error:",

                    error

                );

            }

        );

    }

    catch (error) {

        console.error(
            error
        );

        return () => {};

    }

}



// ==========================================
// COUNT DATA
// นับจำนวนเอกสาร
// ==========================================

export async function countData(

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


        return {

            success:
                true,

            count:
                snapshot.size

        };

    }

    catch (error) {

        return {

            success:
                false,

            count:
                0,

            error:
                error.message

        };

    }

}



// ==========================================
// CHECK FIREBASE CONNECTION
// ตรวจสอบการเชื่อมต่อ
// ==========================================

export async function checkFirebaseConnection() {

    try {

        await getDocs(

            collection(
                db,
                "members"
            )

        );


        return {

            success:
                true,

            message:
                "เชื่อมต่อ Firebase สำเร็จ"

        };

    }

    catch (error) {

        console.error(
            error
        );


        return {

            success:
                false,

            message:
                error.message ||
                "ไม่สามารถเชื่อมต่อ Firebase"

        };

    }

}



// ==========================================
// LOG SYSTEM READY
// ==========================================

console.log(

    "🔥 Rongkhem Rice Group Firebase Ready"

);
