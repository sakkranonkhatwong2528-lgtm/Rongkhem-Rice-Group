// ============================================================
// 🌾 receive.js
// ระบบรับข้าวสาร บ้านร่องเข็ม หมู่ที่ 6
// ใช้ Firebase + รายชื่อสำรองจาก members.js
// ============================================================

import {
    saveData,
    loadData,
    updateData,
    subscribeData
} from "./js/database.js";

import {
    getRongkhemMembers,
    subscribeMembers
} from "./members.js";


// ============================================================
// ⚙️ COLLECTION
// ============================================================

const MEMBERS_COLLECTION = "members";
const FUNERALS_COLLECTION = "funerals";
const DELIVERIES_COLLECTION = "deliveries";
const ACTIVITIES_COLLECTION = "activities";


// ============================================================
// 📦 ตัวแปรระบบ
// ============================================================

let receiveMembers = [];
let receiveFunerals = [];
let receiveDeliveries = [];

let unsubscribeMembers = null;
let unsubscribeFunerals = null;
let unsubscribeDeliveries = null;


// ============================================================
// 🔧 ฟังก์ชันช่วย
// ============================================================

function safeArray(data) {

    return Array.isArray(data)
        ? data
        : [];

}


function getMemberId(member) {

    return String(
        member?.memberId ||
        member?.id ||
        ""
    );

}


function getMemberDocumentId(member) {

    const firestoreId =
        member?.firestoreId ||
        member?.docId;

    if (
        firestoreId &&
        !String(firestoreId).startsWith("local-")
    ) {
        return firestoreId;
    }

    return null;

}


function getFuneralId(funeral) {

    return String(
        funeral?.id ||
        funeral?.funeralId ||
        funeral?.firestoreId ||
        ""
    );

}


function getHouseNo(member) {

    return (
        member?.address ||
        member?.houseNo ||
        "-"
    );

}


function sortMembers(members) {

    return [...safeArray(members)].sort(
        (a, b) => {

            return getMemberId(a).localeCompare(
                getMemberId(b),
                undefined,
                {
                    numeric: true,
                    sensitivity: "base"
                }
            );

        }
    );

}


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

            // สำคัญ:
            // โหลดผ่าน members.js
            // ถ้า Firebase ไม่มีสมาชิก
            // จะใช้รายชื่อสำรอง RK001-RK176

            getRongkhemMembers(),

            loadData(FUNERALS_COLLECTION),

            loadData(DELIVERIES_COLLECTION)

        ]);


        receiveMembers =
            sortMembers(members);

        receiveFunerals =
            safeArray(funerals);

        receiveDeliveries =
            safeArray(deliveries);


        console.log(
            "👥 สมาชิก:",
            receiveMembers.length
        );


        loadReceiveMembers();

        loadHistory();

        updateReceiveSummary();


    } catch (error) {

        console.error(
            "❌ โหลดข้อมูลระบบรับข้าวไม่สำเร็จ:",
            error
        );


        // ถึง Firebase มีปัญหา
        // ยังพยายามโหลดรายชื่อจาก members.js

        try {

            receiveMembers =
                sortMembers(
                    await getRongkhemMembers()
                );

        } catch (memberError) {

            console.error(
                "❌ โหลดสมาชิกสำรองไม่สำเร็จ:",
                memberError
            );

            receiveMembers = [];

        }


        loadReceiveMembers();

        loadHistory();

        updateReceiveSummary();

    }

}


// ============================================================
// ⚰️ งานศพที่กำลังเปิด
// ============================================================

function getActiveReceiveFuneral() {

    return receiveFunerals.find(
        funeral =>

            funeral.active === true ||

            funeral.status === "active" ||

            funeral.status === "กำลังดำเนินการ"

    ) || null;

}


// ============================================================
// 🌾 ตรวจสอบว่าสมาชิกส่งข้าวแล้วหรือยัง
// ============================================================

function hasReceivedRice(
    memberId,
    funeral
) {

    if (!funeral) {
        return false;
    }


    const funeralId =
        getFuneralId(funeral);


    return receiveDeliveries.some(
        delivery =>

            String(
                delivery.funeralId || ""
            )
            ===
            funeralId

            &&

            String(
                delivery.memberId || ""
            )
            ===
            String(memberId)

    );

}


// ============================================================
// 📊 อัปเดตตัวเลขสรุป
// ============================================================

function updateReceiveSummary() {

    const active =
        getActiveReceiveFuneral();


    const total =
        receiveMembers.length;


    let received = 0;


    if (active) {

        received =
            receiveMembers.filter(
                member =>

                    hasReceivedRice(
                        getMemberId(member),
                        active
                    )

            ).length;

    }


    const pending =
        Math.max(
            0,
            total - received
        );


    const totalElement =

        document.getElementById(
            "totalMembers"
        )

        ||

        document.getElementById(
            "totalCount"
        );


    const receivedElement =

        document.getElementById(
            "receivedCount"
        )

        ||

        document.getElementById(
            "receivedMembers"
        );


    const pendingElement =

        document.getElementById(
            "pendingCount"
        )

        ||

        document.getElementById(
            "pendingMembers"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (receivedElement) {

        receivedElement.textContent =
            received;

    }


    if (pendingElement) {

        pendingElement.textContent =
            pending;

    }

}


// ============================================================
// 👥 โหลดตารางสมาชิก
// ============================================================

function loadReceiveMembers() {

    const tbody =
        document.getElementById(
            "receiveTable"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    // สำคัญ:
    // แสดงรายชื่อสมาชิกได้
    // แม้ยังไม่มีงานศพเปิดอยู่

    if (
        receiveMembers.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="
                        text-align:center;
                        padding:25px;
                    "
                >
                    ⚠️ ไม่พบรายชื่อสมาชิก
                </td>
            </tr>
        `;

        return;

    }


    const active =
        getActiveReceiveFuneral();


    receiveMembers.forEach(
        (member, index) => {

            const memberId =
                getMemberId(member);


            const received =
                active

                    ?

                    hasReceivedRice(
                        memberId,
                        active
                    )

                    :

                    false;


            let statusHtml = "";

            let actionHtml = "";


            if (!active) {

                statusHtml = `
                    <span
                        class="status pending"
                    >
                        รอเปิดงานศพ
                    </span>
                `;


                actionHtml = `
                    <span style="
                        color:#777;
                    ">
                        -
                    </span>
                `;

            }

            else if (received) {

                statusHtml = `
                    <span
                        class="status normal"
                    >
                        ✓ ส่งแล้ว
                    </span>
                `;


                actionHtml = `
                    <span style="
                        color:#15803d;
                        font-weight:bold;
                    ">
                        ✓ รับแล้ว
                    </span>
                `;

            }

            else {

                statusHtml = `
                    <span
                        class="status pending"
                    >
                        รอส่ง
                    </span>
                `;


                actionHtml = `
                    <button
                        class="btn btn-success"
                        onclick="receiveRice('${memberId}')"
                    >
                        🌾 รับข้าวสาร
                    </button>
                `;

            }


            tbody.innerHTML += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${getHouseNo(member)}
                    </td>

                    <td>
                        ${member.name || "-"}
                    </td>

                    <td>
                        ${member.phone || "-"}
                    </td>

                    <td>
                        ${statusHtml}
                    </td>

                    <td>
                        ${actionHtml}
                    </td>

                </tr>

            `;

        }
    );


    updateReceiveSummary();

}


// ============================================================
// 🌾 รับข้าวสาร
// ============================================================

async function receiveRice(memberId) {

    try {

        const active =
            getActiveReceiveFuneral();


        if (!active) {

            showReceiveNotify(
                "⚠️ กรุณาเปิดงานศพก่อนรับข้าวสาร"
            );

            return;

        }


        const member =
            receiveMembers.find(
                item =>

                    getMemberId(item)
                    ===
                    String(memberId)

            );


        if (!member) {

            showReceiveNotify(
                "❌ ไม่พบข้อมูลสมาชิก"
            );

            return;

        }


        if (
            hasReceivedRice(
                memberId,
                active
            )
        ) {

            showReceiveNotify(
                "⚠️ สมาชิกคนนี้ส่งข้าวแล้ว"
            );

            return;

        }


        const confirmReceive =
            confirm(

                `ยืนยันการรับข้าวสาร\n\n` +

                `สมาชิก: ${member.name}\n` +

                `บ้านเลขที่: ${getHouseNo(member)}\n\n` +

                `จำนวน: 1 ถุง`

            );


        if (!confirmReceive) {
            return;
        }


        const deliveryData = {

            funeralId:
                getFuneralId(active),

            memberId:
                getMemberId(member),

            memberName:
                member.name || "",

            houseNo:
                getHouseNo(member),

            quantity:
                1,

            receivedDate:
                new Date()
                    .toISOString(),

            status:
                "received"

        };


        const result =
            await saveData(
                DELIVERIES_COLLECTION,
                deliveryData
            );


        if (!result?.success) {

            throw new Error(

                result?.error ||

                "ไม่สามารถบันทึกการรับข้าวได้"

            );

        }


        await addReceiveActivity(

            `${member.name} ส่งข้าวสาร ` +

            `งานศพ ${active.name || ""}`

        );


        await loadReceiveData();


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


    if (!input) {
        return;
    }


    const keyword =
        input.value
            .trim()
            .toLowerCase();


    const rows =
        document.querySelectorAll(
            "#receiveTable tr"
        );


    rows.forEach(
        row => {

            const text =
                row.innerText
                    .toLowerCase();


            row.style.display =

                text.includes(keyword)

                    ?

                    ""

                    :

                    "none";

        }
    );

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


    return receiveMembers.filter(
        member =>

            !hasReceivedRice(
                getMemberId(member),
                active
            )

    );

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


        const receivedCount =
            receiveMembers.length -
            pending.length;


        const confirmFinish =
            confirm(

                `ยืนยันการปิดงานศพ\n\n` +

                `${active.name || ""}\n\n` +

                `สมาชิกส่งข้าวแล้ว: ${receivedCount} คน\n` +

                `สมาชิกค้างส่ง: ${pending.length} คน`

            );


        if (!confirmFinish) {
            return;
        }


        const funeralDocumentId =

            active.firestoreId ||

            active.docId ||

            active.id;


        const funeralResult =
            await updateData(

                FUNERALS_COLLECTION,

                funeralDocumentId,

                {

                    active:
                        false,

                    status:
                        "finished",

                    finishedDate:
                        new Date()
                            .toISOString(),

                    receivedCount:
                        receivedCount,

                    pendingCount:
                        pending.length

                }

            );


        if (!funeralResult?.success) {

            throw new Error(

                funeralResult?.error ||

                "ไม่สามารถปิดงานศพได้"

            );

        }


        // เพิ่มจำนวนค้างส่ง
        // เฉพาะสมาชิกที่มีอยู่จริงใน Firebase

        for (
            const member
            of pending
        ) {

            const documentId =
                getMemberDocumentId(member);


            if (!documentId) {

                // สมาชิกสำรอง local
                // ข้ามไว้เพื่อไม่ให้แก้ผิด document

                continue;

            }


            await updateData(

                MEMBERS_COLLECTION,

                documentId,

                {

                    pending:

                        Number(
                            member.pending || 0
                        )

                        +

                        1

                }

            );

        }


        await addReceiveActivity(

            `ปิดงานศพ ${active.name || ""} ` +

            `สมาชิกค้างส่ง ${pending.length} ราย`

        );


        await loadReceiveData();


        showReceiveNotify(

            "✅ ปิดงานศพเรียบร้อย\n\n" +

            `รับข้าวแล้ว ${receivedCount} ราย\n` +

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


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    const history =
        [...receiveDeliveries]
            .sort(
                (a, b) => {

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

                }
            );


    if (history.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center;padding:20px"
                >

                    ยังไม่มีประวัติรับข้าวสาร

                </td>

            </tr>

        `;

        return;

    }


    history.forEach(
        (delivery, index) => {

            const member =
                receiveMembers.find(
                    item =>

                        getMemberId(item)

                        ===

                        String(
                            delivery.memberId
                        )

                );


            const funeral =
                receiveFunerals.find(
                    item =>

                        getFuneralId(item)

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
                        ${

                            member?.name ||

                            delivery.memberName ||

                            "-"

                        }
                    </td>

                    <td>
                        ${funeral?.name || "-"}
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

        }
    );

}


// ============================================================
// 🖨️ พิมพ์ใบรับข้าว
// ============================================================

function printReceipt(memberId) {

    const member =
        receiveMembers.find(
            item =>

                getMemberId(item)

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
                ${getHouseNo(member)}
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

                window.onload =
                    function() {

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
// 🔴 REAL-TIME
// ============================================================

function startReceiveRealtime() {

    stopReceiveRealtime();


    // สมาชิก
    // ใช้ subscribe จาก members.js
    // เพื่อรองรับรายชื่อสำรอง

    try {

        unsubscribeMembers =
            subscribeMembers(
                members => {

                    receiveMembers =
                        sortMembers(members);

                    loadReceiveMembers();

                    updateReceiveSummary();

                }
            );

    } catch (error) {

        console.warn(
            "⚠️ Real-time สมาชิกไม่พร้อม:",
            error
        );

    }


    // งานศพ

    try {

        unsubscribeFunerals =
            subscribeData(

                FUNERALS_COLLECTION,

                funerals => {

                    receiveFunerals =
                        safeArray(funerals);

                    loadReceiveMembers();

                    updateReceiveSummary();

                }

            );

    } catch (error) {

        console.warn(
            "⚠️ Real-time งานศพไม่พร้อม:",
            error
        );

    }


    // ประวัติรับข้าว

    try {

        unsubscribeDeliveries =
            subscribeData(

                DELIVERIES_COLLECTION,

                deliveries => {

                    receiveDeliveries =
                        safeArray(deliveries);

                    loadReceiveMembers();

                    loadHistory();

                    updateReceiveSummary();

                }

            );

    } catch (error) {

        console.warn(
            "⚠️ Real-time การรับข้าวไม่พร้อม:",
            error
        );

    }

}


// ============================================================
// 🛑 หยุด REAL-TIME
// ============================================================

function stopReceiveRealtime() {

    if (
        typeof unsubscribeMembers ===
        "function"
    ) {

        unsubscribeMembers();

    }


    if (
        typeof unsubscribeFunerals ===
        "function"
    ) {

        unsubscribeFunerals();

    }


    if (
        typeof unsubscribeDeliveries ===
        "function"
    ) {

        unsubscribeDeliveries();

    }


    unsubscribeMembers = null;

    unsubscribeFunerals = null;

    unsubscribeDeliveries = null;

}


// ============================================================
// 🌍 เปิดใช้กับ HTML
// ============================================================

window.loadReceiveData =
    loadReceiveData;

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

window.startReceiveRealtime =
    startReceiveRealtime;

window.stopReceiveRealtime =
    stopReceiveRealtime;

window.updateReceiveSummary =
    updateReceiveSummary;


// ============================================================
// 🚀 เริ่มระบบ
// ============================================================

window.addEventListener(

    "DOMContentLoaded",

    async () => {

        console.log(
            "🌾 ระบบรับข้าวสารเริ่มทำงาน"
        );


        await loadReceiveData();


        startReceiveRealtime();

    }

);


// ============================================================
// 🛑 ออกจากหน้า
// ============================================================

window.addEventListener(

    "beforeunload",

    () => {

        stopReceiveRealtime();

    }

);
