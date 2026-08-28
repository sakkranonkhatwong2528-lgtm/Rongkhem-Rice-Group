/* =========================================================
   🌾 RONGKHEM RICE GROUP
   funeral.js
   ระบบจัดการงานศพ Firebase Firestore

   ใช้ข้อมูลกลางร่วมกัน:
   📱 มือถือ
   💻 คอมพิวเตอร์
   📲 แท็บเล็ต
========================================================= */

import {
    saveData,
    loadData,
    updateData,
    deleteData,
    subscribeData
} from "./database.js";


/* =========================================================
   ⚙️ ตั้งค่า Collection
========================================================= */

const FUNERALS_COLLECTION = "funerals";

let CURRENT_FUNERALS = [];

let unsubscribeFunerals = null;


/* =========================================================
   🔢 สร้าง ID งานศพ
========================================================= */

function generateFuneralId() {

    return "FUNERAL_" + Date.now();

}


/* =========================================================
   ⚰️ บันทึกงานศพใหม่
========================================================= */

export async function saveFuneralData(
    deceasedName,
    additionalInfo = {}
) {

    try {

        if (
            !deceasedName ||
            String(deceasedName).trim() === ""
        ) {

            showFuneralNotify(
                "กรุณาระบุชื่อผู้เสียชีวิต"
            );

            return {
                success: false,
                error: "Empty name"
            };

        }


        const cleanName =
            String(deceasedName).trim();


        /*
            ตรวจสอบว่ามีงานศพเปิดอยู่หรือไม่
        */

        const funerals =
            await loadData(
                FUNERALS_COLLECTION
            );


        const activeFuneral =
            funerals.find(funeral =>

                funeral.active === true ||

                funeral.status === "active" ||

                funeral.status === "กำลังดำเนินการ"

            );


        /*
            ป้องกันเปิดงานใหม่
            ถ้ายังมีงานเดิมไม่ปิด
        */

        if (activeFuneral) {

            showFuneralNotify(

                "⚠️ ขณะนี้มีงานศพที่กำลังดำเนินการอยู่\n\n" +

                `${activeFuneral.name ||
                activeFuneral.deceasedName ||
                ""}`

            );


            return {

                success: false,

                error:
                    "Active funeral already exists"

            };

        }


        /*
            สร้างข้อมูล
        */

        const funeralId =
            generateFuneralId();


        const funeralRecord = {

            /*
                ID สำหรับเชื่อมระบบ
            */

            id:
                funeralId,

            funeralId:
                funeralId,


            /*
                ชื่อผู้เสียชีวิต

                เก็บทั้ง name และ deceasedName
                เพื่อรองรับหน้าเว็บเดิม
            */

            name:
                cleanName,

            deceasedName:
                cleanName,


            /*
                บ้านเลขที่
            */

            houseNo:

                additionalInfo.houseNo ||

                additionalInfo.address ||

                "",


            /*
                อายุ
            */

            age:

                additionalInfo.age ||

                "",


            /*
                วันที่เสียชีวิต
            */

            deathDate:

                additionalInfo.deathDate ||

                additionalInfo.date ||

                new Date().toISOString(),


            /*
                วันที่ฌาปนกิจ
            */

            cremationDate:

                additionalInfo.cremationDate ||

                "",


            /*
                สถานะงานศพ
            */

            active:
                true,

            status:
                "active",


            /*
                หมายเหตุ
            */

            note:

                additionalInfo.note ||

                "",


            /*
                ยอดรับข้าว
            */

            receivedCount:
                0,

            pendingCount:
                0,


            /*
                วันที่สร้าง
            */

            createdAt:
                new Date().toISOString()

        };


        /*
            💾 บันทึก Firebase
        */

        const result =
            await saveData(

                FUNERALS_COLLECTION,

                funeralRecord

            );


        if (!result.success) {

            throw new Error(

                result.error ||

                "ไม่สามารถบันทึกข้อมูลได้"

            );

        }


        showFuneralNotify(

            "🕊️ บันทึกงานศพเรียบร้อยแล้ว\n\n" +

            cleanName

        );


        return {

            success:
                true,

            id:
                result.id,

            funeralId:
                funeralId,

            data:
                {

                    firestoreId:
                        result.id,

                    ...funeralRecord

                }

        };


    } catch (error) {

        console.error(
            "❌ บันทึกงานศพไม่สำเร็จ:",
            error
        );


        showFuneralNotify(

            "❌ เกิดข้อผิดพลาด\n\n" +

            error.message

        );


        return {

            success:
                false,

            error:
                error.message

        };

    }

}


/* =========================================================
   📥 ดึงงานศพทั้งหมด
========================================================= */

export async function getAllFunerals() {

    try {

        const funerals =
            await loadData(
                FUNERALS_COLLECTION
            );


        CURRENT_FUNERALS =
            sortFunerals(funerals);


        return CURRENT_FUNERALS;


    } catch (error) {

        console.error(
            "❌ ไม่สามารถดึงข้อมูลรายการงานศพ:",
            error
        );


        return [];

    }

}


/* =========================================================
   🔢 เรียงงานศพล่าสุดก่อน
========================================================= */

function sortFunerals(funerals) {

    return [...funerals].sort((a, b) => {

        const dateA =
            new Date(
                a.createdAt ||
                a.deathDate ||
                0
            );


        const dateB =
            new Date(
                b.createdAt ||
                b.deathDate ||
                0
            );


        return dateB - dateA;

    });

}


/* =========================================================
   🔥 ดึงงานศพที่กำลังดำเนินการ
========================================================= */

export async function getActiveFuneral() {

    try {

        const funerals =
            await getAllFunerals();


        return funerals.find(funeral =>

            funeral.active === true ||

            funeral.status === "active" ||

            funeral.status === "กำลังดำเนินการ"

        ) || null;


    } catch (error) {

        console.error(
            "❌ ไม่สามารถค้นหางานศพปัจจุบัน:",
            error
        );


        return null;

    }

}


/* =========================================================
   ✏️ แก้ไขข้อมูลงานศพ
========================================================= */

export async function updateFuneralData(
    firestoreId,
    funeralData
) {

    try {

        if (!firestoreId) {

            throw new Error(
                "ไม่พบ Firestore ID"
            );

        }


        if (!funeralData) {

            throw new Error(
                "ไม่พบข้อมูลที่ต้องการแก้ไข"
            );

        }


        const updateDataObject = {

            ...funeralData,

            updatedAt:
                new Date().toISOString()

        };


        /*
            ป้องกันเขียน ID ทับ
        */

        delete updateDataObject.firestoreId;


        const result =
            await updateData(

                FUNERALS_COLLECTION,

                firestoreId,

                updateDataObject

            );


        if (!result.success) {

            throw new Error(

                result.error ||

                "ไม่สามารถแก้ไขข้อมูลได้"

            );

        }


        showFuneralNotify(
            "✏️ แก้ไขข้อมูลเรียบร้อย"
        );


        return {

            success:
                true

        };


    } catch (error) {

        console.error(
            "❌ แก้ไขงานศพไม่สำเร็จ:",
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


/* =========================================================
   🏁 ปิดงานศพ
========================================================= */

export async function closeFuneralData(
    firestoreId,
    summaryData = {}
) {

    try {

        if (!firestoreId) {

            throw new Error(
                "ไม่พบ ID งานศพ"
            );

        }


        const result =
            await updateData(

                FUNERALS_COLLECTION,

                firestoreId,

                {

                    active:
                        false,

                    status:
                        "finished",

                    finishedDate:
                        new Date().toISOString(),

                    ...summaryData

                }

            );


        if (!result.success) {

            throw new Error(

                result.error ||

                "ไม่สามารถปิดงานศพได้"

            );

        }


        showFuneralNotify(
            "⚰️ ปิดงานศพเรียบร้อย"
        );


        return {

            success:
                true

        };


    } catch (error) {

        console.error(
            "❌ ปิดงานศพไม่สำเร็จ:",
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


/* =========================================================
   🗑️ ลบงานศพ
========================================================= */

export async function removeFuneralData(
    docId
) {

    try {

        if (!docId) {

            throw new Error(
                "ไม่พบ ID งานศพ"
            );

        }


        const confirmDelete =
            confirm(
                "ยืนยันการลบข้อมูลงานศพนี้หรือไม่?"
            );


        if (!confirmDelete) {

            return {

                success:
                    false,

                cancelled:
                    true

            };

        }


        const result =
            await deleteData(

                FUNERALS_COLLECTION,

                docId

            );


        if (!result.success) {

            throw new Error(

                result.error ||

                "ไม่สามารถลบข้อมูลได้"

            );

        }


        showFuneralNotify(
            "🗑️ ลบข้อมูลเรียบร้อยแล้ว"
        );


        return {

            success:
                true

        };


    } catch (error) {

        console.error(
            "❌ ลบงานศพไม่สำเร็จ:",
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


/* =========================================================
   🔄 REAL-TIME

   เมื่อมีการเพิ่ม/แก้ไขงานศพจากมือถือ
   คอมและแท็บเล็ตจะเห็นทันที
========================================================= */

export function subscribeFunerals(callback) {

    if (unsubscribeFunerals) {

        unsubscribeFunerals();

        unsubscribeFunerals = null;

    }


    unsubscribeFunerals =
        subscribeData(

            FUNERALS_COLLECTION,

            funerals => {

                CURRENT_FUNERALS =
                    sortFunerals(
                        funerals
                    );


                if (
                    typeof callback ===
                    "function"
                ) {

                    callback(
                        CURRENT_FUNERALS
                    );

                }


                /*
                    แจ้งหน้า Dashboard
                */

                window.dispatchEvent(

                    new CustomEvent(

                        "funeralsUpdated",

                        {

                            detail:
                                CURRENT_FUNERALS

                        }

                    )

                );

            }

        );


    return unsubscribeFunerals;

}


/* =========================================================
   🛑 หยุด Real-time
========================================================= */

export function stopFuneralRealtime() {

    if (unsubscribeFunerals) {

        unsubscribeFunerals();

        unsubscribeFunerals = null;

    }

}


/* =========================================================
   🔔 ระบบแจ้งเตือน
========================================================= */

function showFuneralNotify(message) {

    if (
        typeof window.notify ===
        "function"
    ) {

        window.notify(message);

    } else {

        alert(message);

    }

}


/* =========================================================
   🌍 รองรับ HTML และ JavaScript เดิม
========================================================= */

window.saveFuneralData =
    saveFuneralData;

window.getAllFunerals =
    getAllFunerals;

window.getActiveFuneral =
    getActiveFuneral;

window.updateFuneralData =
    updateFuneralData;

window.closeFuneralData =
    closeFuneralData;

window.removeFuneralData =
    removeFuneralData;

window.subscribeFunerals =
    subscribeFunerals;

window.stopFuneralRealtime =
    stopFuneralRealtime;


/* =========================================================
   🚀 เริ่มต้นระบบ
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "⚰️ funeral.js เชื่อม Firebase Firestore แล้ว"
        );


        /*
            เปิด Real-time
        */

        subscribeFunerals(
            function (funerals) {

                console.log(
                    "🔄 งานศพอัปเดต:",
                    funerals.length,
                    "รายการ"
                );

            }
        );


        /*
            รองรับปุ่มบันทึกเดิม
        */

        const btnSave =
            document.getElementById(
                "btnSaveFuneral"
            );


        if (btnSave) {

            btnSave.addEventListener(

                "click",

                async function (event) {

                    event.preventDefault();


                    const inputElement =
                        document.getElementById(
                            "inputDeceasedName"
                        );


                    if (!inputElement) {

                        return;

                    }


                    const deceasedName =
                        inputElement.value;


                    const result =
                        await saveFuneralData(
                            deceasedName
                        );


                    /*
                        บันทึกสำเร็จ
                        ล้างช่องกรอก
                    */

                    if (result.success) {

                        inputElement.value =
                            "";

                    }

                }

            );

        }

    }
);


/* =========================================================
   🛑 ปิดการเชื่อมต่อ
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        stopFuneralRealtime();

    }
);
