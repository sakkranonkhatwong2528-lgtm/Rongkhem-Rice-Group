// ============================================================
// 🌾 receive.js
// ระบบรับข้าวสาร บ้านร่องเข็ม หมู่ที่ 6
// Firebase Firestore Cloud Database
//
// ใช้ข้อมูลร่วมกัน:
// 📱 มือถือ
// 💻 คอมพิวเตอร์
// 📲 แท็บเล็ต
// ============================================================

import {
    saveData,
    loadData,
    updateData,
    deleteData,
    subscribeData
} from "./js/database.js";


// ============================================================
// ⚙️ ชื่อ Collection
// ============================================================

const MEMBERS_COLLECTION = "members";
const FUNERALS_COLLECTION = "funerals";
const DELIVERIES_COLLECTION = "deliveries";
const ACTIVITIES_COLLECTION = "activities";


// ============================================================
// 📦 ตัวแปรข้อมูล
// ============================================================

let receiveMembers = [];
let receiveFunerals = [];
let receiveDeliveries = [];

let unsubscribeMembers = null;
let unsubscribeFunerals = null;
let unsubscribeDeliveries = null;


// ============================================================
// 🔄 โหลดข้อมูลทั้งหมด
// ============================================================

async function loadReceiveData() {

    try {

        const [
            members,
            funerals,
            deliveries
        ] = await Promise.all([

            loadData(MEMBERS_COLLECTION),

            loadData(FUNERALS_COLLECTION),

            loadData(DELIVERIES_COLLECTION)

        ]);


        receiveMembers = members;

        receiveFunerals = funerals;

        receiveDeliveries = deliveries;


        loadReceiveMembers();

        loadHistory();


    } catch (error) {

        console.error(
            "❌ โหลดข้อมูลระบบรับข้าวไม่สำเร็จ:",
            error
        );

    }

}


// ============================================================
// ⚰️ ค้นหางานศพที่กำลังดำเนินการ
// ============================================================

function getActiveReceiveFuneral() {

    return receiveFunerals.find(funeral =>

        funeral.active === true ||

        funeral.status === "active" ||

        funeral.status === "กำลังดำเนินการ"

    ) || null;

}


// ============================================================
// 👥 โหลดรายชื่อสมาชิกสำหรับรับข้าว
// ============================================================

function loadReceiveMembers() {

    const tbody =
        document.getElementById("receiveTable");


    if (!tbody) return;


    const active =
        getActiveReceiveFuneral();


    tbody.innerHTML = "";


    if (!active) {

        tbody.innerHTML = `

            <tr>
                <td colspan="6"
                    style="
                        text-align:center;
                        padding:20px;
                        color:#dc2626;
                    ">

                    ⚰️ ยังไม่มีงานศพที่เปิดอยู่

                </td>
            </tr>

        `;

        return;

    }


    /*
        เรียงสมาชิกตามรหัส
    */

    const members =
        [...receiveMembers].sort((a, b) => {

            const aId =
                String(
                    a.memberId ||
                    a.id ||
                    ""
                );

            const bId =
                String(
                    b.memberId ||
                    b.id ||
                    ""
                );

            return aId.localeCompare(
                bId,
                undefined,
                {
                    numeric: true
                }
            );

        });


    members.forEach((member, index) => {


        /*
            ตรวจสอบว่าส่งข้าวแล้วหรือยัง
        */

        const received =
            receiveDeliveries.find(delivery =>

                String(
                    delivery.funeralId
                ) ===
                String(active.id)

                &&

                String(
                    delivery.memberId
                ) ===
                String(
                    member.memberId ||
                    member.id
                )

            );


        /*
            Firestore ID
        */

        const memberId =
            member.memberId ||
            member.id;


        /*
            บ้านเลขที่
            รองรับทั้ง address และ houseNo
        */

        const houseNo =
            member.address ||
            member.houseNo ||
            "-";


        tbody.innerHTML += `

            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${houseNo}
                </td>

                <td>
                    ${member.name || "-"}
                </td>

                <td>
                    ${member.phone || "-"}
                </td>

                <td>

                    ${
                        received

                        ?

                        `
                        <span class="status normal">
                            ✓ ส่งแล้ว
                        </span>
                        `

                        :

                        `
                        <span class="status pending">
                            รอส่ง
                        </span>
                        `
                    }

                </td>

                <td>

                    ${
                        received

                        ?

                        `-`

                        :

                        `
                        <button
                            class="btn btn-success"
                            onclick="receiveRice('${memberId}')">

                            🌾 รับข้าวสาร

                        </button>
                        `
                    }

                </td>

            </tr>

        `;

    });

}


// ============================================================
// 🌾 รับข้าวสาร
// ============================================================

async function receiveRice(memberId) {

    try {

        const active =
            getActiveReceiveFuneral();


        /*
            ตรวจสอบงานศพ
        */

        if (!active) {

            showReceiveNotify(
                "❌ ไม่มีงานศพที่กำลังดำเนินการ"
            );

            return;

        }


        /*
            ค้นหาสมาชิก
        */

        const member =
            receiveMembers.find(item =>

                String(
                    item.memberId ||
                    item.id
                )
                ===
                String(memberId)

            );


        if (!member) {

            showReceiveNotify(
                "❌ ไม่พบข้อมูลสมาชิก"
            );

            return;

        }


        /*
            ตรวจสอบว่ารับข้าวแล้วหรือยัง
        */

        const alreadyReceived =
            receiveDeliveries.find(delivery =>

                String(
                    delivery.funeralId
                )
                ===
                String(active.id)

                &&

                String(
                    delivery.memberId
                )
                ===
                String(memberId)

            );


        if (alreadyReceived) {

            showReceiveNotify(
                "⚠️ สมาชิกคนนี้ส่งข้าวแล้ว"
            );

            return;

        }


        /*
            ป้องกันการกดซ้ำ
        */

        const confirmReceive =
            confirm(

                `ยืนยันการรับข้าวสาร\n\n` +

                `สมาชิก: ${member.name}\n` +

                `บ้านเลขที่: ` +

                `${member.address || member.houseNo || "-"}\n\n` +

                `จำนวน: 1 ถุง`

            );


        if (!confirmReceive) {

            return;

        }


        /*
            💾 บันทึกการรับข้าวลง Firebase
        */

        const deliveryData = {

            funeralId:
                active.id,

            memberId:
                member.memberId ||
                member.id,

            memberName:
                member.name || "",

            houseNo:
                member.address ||
                member.houseNo ||
                "",

            quantity:
                1,

            receivedDate:
                new Date().toISOString(),

            status:
                "received"

        };


        const result =
            await saveData(

                DELIVERIES_COLLECTION,

                deliveryData

            );


        if (!result.success) {

            throw new Error(

                result.error ||

                "ไม่สามารถบันทึกการรับข้าวได้"

            );

        }


        /*
            📝 บันทึกกิจกรรม
        */

        await addReceiveActivity(

            `${member.name} ส่งข้าวสาร ` +

            `งานศพ ${active.name || ""}`

        );


        /*
            โหลดข้อมูลใหม่
        */

        await loadReceiveData();


        /*
            อัปเดต Dashboard เดิม
            ถ้ามีฟังก์ชันอยู่
        */

        if (
            typeof window.updateDashboard ===
            "function"
        ) {

            window.updateDashboard();

        }


        showReceiveNotify(

            `✅ บันทึกรับข้าวสารสำเร็จ\n\n` +

            `${member.name}\n` +

            `จำนวน 1 ถุง`

        );


    } catch (error) {

        console.error(
            "❌ รับข้าวไม่สำเร็จ:",
            error
        );


        showReceiveNotify(

            "❌ บันทึกข้อมูลไม่สำเร็จ\n" +

            error.message

        );

    }

}


// ============================================================
// 🔍 ค้นหารายชื่อ
// ============================================================

function searchReceive() {

    const input =
        document.getElementById(
            "searchReceive"
        );


    if (!input) return;


    const keyword =
        input.value
            .trim()
            .toLowerCase();


    const rows =
        document.querySelectorAll(
            "#receiveTable tr"
        );


    rows.forEach(row => {

        const text =
            row.innerText
                .toLowerCase();


        row.style.display =

            text.includes(keyword)

            ?

            ""

            :

            "none";

    });

}


// ============================================================
// ⚠️ รายชื่อสมาชิกค้างส่ง
// ============================================================

function pendingMembers() {

    const active =
        getActiveReceiveFuneral();


    if (!active) {

        return [];

    }


    return receiveMembers.filter(member => {

        const memberId =
            member.memberId ||
            member.id;


        const delivered =
            receiveDeliveries.find(delivery =>

                String(
                    delivery.funeralId
                )
                ===
                String(active.id)

                &&

                String(
                    delivery.memberId
                )
                ===
                String(memberId)

            );


        return !delivered;

    });

}


// ============================================================
// ⚰️ ปิดงานศพ
// ============================================================

async function finishFuneral() {

    try {

        const active =
            getActiveReceiveFuneral();


        if (!active) {

            showReceiveNotify(
                "⚠️ ไม่มีงานศพที่เปิดอยู่"
            );

            return;

        }


        const pending =
            pendingMembers();


        const confirmFinish =
            confirm(

                `ยืนยันการปิดงานศพ\n\n` +

                `${active.name || ""}\n\n` +

                `สมาชิกส่งข้าวแล้ว: ` +

                `${receiveMembers.length - pending.length} คน\n` +

                `สมาชิกค้างส่ง: ` +

                `${pending.length} คน`

            );


        if (!confirmFinish) {

            return;

        }


        /*
            หารหัส Firestore ของงานศพ
        */

        const firestoreFuneralId =
            active.firestoreId ||
            active.id;


        /*
            ✏️ ปิดงานศพ
        */

        const funeralResult =
            await updateData(

                FUNERALS_COLLECTION,

                firestoreFuneralId,

                {

                    active:
                        false,

                    status:
                        "finished",

                    finishedDate:
                        new Date().toISOString(),

                    receivedCount:
                        receiveMembers.length -
                        pending.length,

                    pendingCount:
                        pending.length

                }

            );


        if (!funeralResult.success) {

            throw new Error(

                funeralResult.error ||

                "ไม่สามารถปิดงานศพได้"

            );

        }


        /*
            เพิ่มจำนวนค้างส่งสมาชิก

            ใช้ข้อมูล Firebase จริง
        */

        for (
            const member of pending
        ) {

            const firestoreMemberId =
                member.firestoreId;


            /*
                ถ้า id เป็น Firestore ID
                ให้ใช้ id ได้
            */

            const documentId =
                firestoreMemberId ||
                member.docId ||
                null;


            /*
                ถ้าไม่มี Firestore ID
                ข้ามเพื่อป้องกัน
                การแก้ข้อมูลผิดคน
            */

            if (!documentId) {

                console.warn(

                    "⚠️ ไม่พบ Firestore ID:",

                    member

                );

                continue;

            }


            const currentPending =
                Number(
                    member.pending || 0
                );


            await updateData(

                MEMBERS_COLLECTION,

                documentId,

                {

                    pending:
                        currentPending + 1

                }

            );

        }


        /*
            📝 บันทึกกิจกรรม
        */

        await addReceiveActivity(

            `ปิดงานศพ ${active.name || ""} ` +

            `สมาชิกค้างส่ง ${pending.length} ราย`

        );


        /*
            โหลดใหม่
        */

        await loadReceiveData();


        if (
            typeof window.updateDashboard ===
            "function"
        ) {

            window.updateDashboard();

        }


        showReceiveNotify(

            "✅ ปิดงานศพเรียบร้อย\n\n" +

            `ค้างส่ง ${pending.length} ราย`

        );


    } catch (error) {

        console.error(
            "❌ ปิดงานศพไม่สำเร็จ:",
            error
        );


        showReceiveNotify(

            "❌ ปิดงานศพไม่สำเร็จ\n" +

            error.message

        );

    }

}


// ============================================================
// 📜 โหลดประวัติรับข้าวสาร
// ============================================================

function loadHistory() {

    const tbody =
        document.getElementById(
            "historyTable"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    const history =
        [...receiveDeliveries]
            .sort((a, b) => {

                const dateA =
                    new Date(

                        a.receivedDate ||

                        a.createdAt?.toDate?.() ||

                        0

                    );


                const dateB =
                    new Date(

                        b.receivedDate ||

                        b.createdAt?.toDate?.() ||

                        0

                    );


                return dateB - dateA;

            });


    if (history.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center">

                    ยังไม่มีประวัติรับข้าวสาร

                </td>

            </tr>

        `;

        return;

    }


    history.forEach((delivery, index) => {


        /*
            ค้นหาสมาชิก
        */

        const member =
            receiveMembers.find(item =>

                String(
                    item.memberId ||
                    item.id
                )
                ===
                String(
                    delivery.memberId
                )

            );


        /*
            ค้นหางานศพ
        */

        const funeral =
            receiveFunerals.find(item =>

                String(item.id)
                ===
                String(
                    delivery.funeralId
                )

            );


        const date =
            delivery.receivedDate

            ?

            new Date(
                delivery.receivedDate
            )

            :

            new Date();


        tbody.innerHTML += `

            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${member?.name ||
                    delivery.memberName ||
                    "-"}
                </td>

                <td>
                    ${funeral?.name ||
                    "-"}
                </td>

                <td>

                    ${date.toLocaleDateString(
                        "th-TH"
                    )}

                </td>

                <td>
                    ${delivery.quantity || 1} ถุง
                </td>

            </tr>

        `;

    });

}


// ============================================================
// 🖨️ พิมพ์ใบรับข้าว
// ============================================================

function printReceipt(memberId) {

    const member =
        receiveMembers.find(item =>

            String(
                item.memberId ||
                item.id
            )
            ===
            String(memberId)

        );


    const funeral =
        getActiveReceiveFuneral();


    if (!member) {

        showReceiveNotify(
            "❌ ไม่พบข้อมูลสมาชิก"
        );

        return;

    }


    if (!funeral) {

        showReceiveNotify(
            "❌ ไม่มีงานศพที่กำลังดำเนินการ"
        );

        return;

    }


    const printWindow =
        window.open(
            "",
            "_blank"
        );


    if (!printWindow) {

        showReceiveNotify(
            "⚠️ เบราว์เซอร์บล็อกหน้าต่างพิมพ์"
        );

        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html lang="th">

        <head>

            <meta charset="UTF-8">

            <title>
                ใบรับข้าวสาร
            </title>

            <style>

                body {
                    font-family:
                        Arial,
                        sans-serif;

                    padding:40px;

                    color:#111;
                }

                h2 {
                    text-align:center;
                }

                p {
                    font-size:18px;
                }

            </style>

        </head>

        <body>

            <h2>
                🌾 ใบรับข้าวสาร
            </h2>

            <hr>

            <p>
                <strong>สมาชิก:</strong>
                ${member.name || "-"}
            </p>

            <p>
                <strong>บ้านเลขที่:</strong>
                ${member.address ||
                member.houseNo ||
                "-"}
            </p>

            <p>
                <strong>งานศพ:</strong>
                ${funeral.name || "-"}
            </p>

            <p>
                <strong>จำนวน:</strong>
                1 ถุง
            </p>

            <p>
                <strong>วันที่:</strong>

                ${new Date()
                    .toLocaleDateString(
                        "th-TH"
                    )}

            </p>

            <script>

                window.onload = function() {

                    window.print();

                };

            </script>

        </body>

        </html>

    `);


    printWindow.document.close();

}


// ============================================================
// 📝 บันทึกกิจกรรม
// ============================================================

async function addReceiveActivity(message) {

    try {

        await saveData(

            ACTIVITIES_COLLECTION,

            {

                message:
                    message,

                type:
                    "rice_delivery",

                date:
                    new Date()
                        .toISOString()

            }

        );

    } catch (error) {

        console.warn(
            "⚠️ บันทึกกิจกรรมไม่สำเร็จ:",
            error
        );

    }

}


// ============================================================
// 🔔 แจ้งเตือน
//
// รองรับระบบ notify() เดิม
// ถ้าไม่มีใช้ alert()
// ============================================================

function showReceiveNotify(message) {

    if (
        typeof window.notify ===
        "function"
    ) {

        window.notify(message);

    } else {

        alert(message);

    }

}


// ============================================================
// 🔴 REAL-TIME FIREBASE
//
// เมื่อมีการรับข้าวจากมือถือ
// คอมและแท็บเล็ตอัปเดตทันที
// ============================================================

function startReceiveRealtime() {

    /*
        สมาชิก
    */

    unsubscribeMembers =
        subscribeData(

            MEMBERS_COLLECTION,

            members => {

                receiveMembers =
                    members;

                loadReceiveMembers();

            }

        );


    /*
        งานศพ
    */

    unsubscribeFunerals =
        subscribeData(

            FUNERALS_COLLECTION,

            funerals => {

                receiveFunerals =
                    funerals;

                loadReceiveMembers();

            }

        );


    /*
        การรับข้าว
    */

    unsubscribeDeliveries =
        subscribeData(

            DELIVERIES_COLLECTION,

            deliveries => {

                receiveDeliveries =
                    deliveries;

                loadReceiveMembers();

                loadHistory();

            }

        );

}


// ============================================================
// 🛑 หยุด Real-time
// ============================================================

function stopReceiveRealtime() {

    if (unsubscribeMembers) {

        unsubscribeMembers();

        unsubscribeMembers = null;

    }


    if (unsubscribeFunerals) {

        unsubscribeFunerals();

        unsubscribeFunerals = null;

    }


    if (unsubscribeDeliveries) {

        unsubscribeDeliveries();

        unsubscribeDeliveries = null;

    }

}


// ============================================================
// 🌍 เปิดใช้กับ HTML เดิม
// ============================================================

window.loadReceiveMembers =
    loadReceiveMembers;

window.receiveRice =
    receiveRice;

window.searchReceive =
    searchReceive;

window.pendingMembers =
    pendingMembers;

window.finishFuneral =
    finishFuneral;

window.loadHistory =
    loadHistory;

window.printReceipt =
    printReceipt;

window.loadReceiveData =
    loadReceiveData;

window.startReceiveRealtime =
    startReceiveRealtime;

window.stopReceiveRealtime =
    stopReceiveRealtime;


// ============================================================
// 🚀 เริ่มต้นระบบ
// ============================================================

window.addEventListener(

    "DOMContentLoaded",

    async () => {

        console.log(
            "🌾 ระบบรับข้าวเชื่อม Firebase แล้ว"
        );


        /*
            โหลดครั้งแรก
        */

        await loadReceiveData();


        /*
            เปิด Real-time
        */

        startReceiveRealtime();

    }

);


// ============================================================
// 🛑 ปิดการเชื่อมต่อเมื่อออกจากหน้า
// ============================================================

window.addEventListener(

    "beforeunload",

    () => {

        stopReceiveRealtime();

    }

);
