// ============================================================
// receive.js
// ระบบรับข้าวสาร
// Rongkhem Rice Group
// Firebase Firestore
// ============================================================

import {
    saveData,
    loadData,
    updateData,
    subscribeData
} from "./database.js";


// ============================================================
// ตัวแปรข้อมูล
// ============================================================

let members = [];
let funerals = [];
let deliveries = [];


// ============================================================
// HTML ปลอดภัย
// ============================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// แจ้งเตือน
// ============================================================

function notify(message) {

    if (typeof window.showNotification === "function") {

        window.showNotification(message);

    } else {

        alert(message);

    }

}


// ============================================================
// หางานศพที่เปิดอยู่
// ============================================================

function getActiveFuneral() {

    return funerals.find(funeral =>
        funeral.active === true ||
        funeral.status === "active"
    );

}


// ============================================================
// ตรวจสอบว่าสมาชิกส่งข้าวแล้วหรือยัง
// ============================================================

function getDelivery(memberId, funeralId) {

    return deliveries.find(delivery =>

        String(delivery.memberId) === String(memberId) &&

        String(delivery.funeralId) === String(funeralId)

    );

}


// ============================================================
// โหลดตารางสมาชิก
// ============================================================

function loadReceiveMembers() {

    const tbody =
        document.getElementById("receiveTable");

    if (!tbody) return;


    const active =
        getActiveFuneral();


    tbody.innerHTML = "";


    // ==========================================
    // ไม่มีงานศพ
    // ==========================================

    if (!active) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >
                    ⚠️ ยังไม่มีงานศพที่เปิดอยู่
                </td>
            </tr>
        `;

        updateSummary();

        return;

    }


    // ==========================================
    // ไม่มีสมาชิก
    // ==========================================

    if (members.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >
                    👥 ยังไม่มีข้อมูลสมาชิก
                </td>
            </tr>
        `;

        updateSummary();

        return;

    }


    // ==========================================
    // เรียงสมาชิกตามบ้านเลขที่
    // ==========================================

    const sortedMembers =
        [...members].sort((a, b) => {

            const houseA =
                parseInt(
                    a.houseNo ||
                    a.address ||
                    999999
                );

            const houseB =
                parseInt(
                    b.houseNo ||
                    b.address ||
                    999999
                );

            return houseA - houseB;

        });


    // ==========================================
    // แสดงสมาชิก
    // ==========================================

    sortedMembers.forEach((member, index) => {

        const memberId =
            member.firestoreId || member.id;


        const received =
            getDelivery(
                memberId,
                active.firestoreId || active.id
            );


        const houseNo =
            member.houseNo ||
            member.address ||
            "-";


        const name =
            member.name ||
            member.fullName ||
            "-";


        const phone =
            member.phone ||
            "-";


        tbody.innerHTML += `

            <tr>

                <td>
                    ${index + 1}
                </td>


                <td>
                    ${escapeHtml(houseNo)}
                </td>


                <td>
                    ${escapeHtml(name)}
                </td>


                <td>
                    ${escapeHtml(phone)}
                </td>


                <td>

                    ${
                        received

                        ?

                        `
                        <span class="status normal">
                            🟢 ส่งแล้ว
                        </span>
                        `

                        :

                        `
                        <span class="status pending">
                            🔴 รอส่ง
                        </span>
                        `
                    }

                </td>


                <td>

                    ${
                        received

                        ?

                        `
                        <button
                            class="btn"
                            disabled
                        >
                            ✓ รับแล้ว
                        </button>
                        `

                        :

                        `
                        <button
                            class="btn btn-success"
                            onclick="receiveRice('${memberId}')"
                        >
                            🌾 รับข้าวสาร
                        </button>
                        `
                    }

                </td>

            </tr>

        `;

    });


    updateSummary();

}


// ============================================================
// รับข้าวสาร
// ============================================================

async function receiveRice(memberId) {

    const active =
        getActiveFuneral();


    // ไม่มีงานศพ

    if (!active) {

        notify(
            "⚠️ ไม่มีงานศพที่เปิดอยู่"
        );

        return;

    }


    const member =
        members.find(item =>

            String(
                item.firestoreId || item.id
            )

            ===

            String(memberId)

        );


    if (!member) {

        notify(
            "❌ ไม่พบข้อมูลสมาชิก"
        );

        return;

    }


    const funeralId =
        active.firestoreId ||
        active.id;


    // ==========================================
    // ป้องกันการกดซ้ำ
    // ==========================================

    const alreadyReceived =
        getDelivery(
            memberId,
            funeralId
        );


    if (alreadyReceived) {

        notify(
            "⚠️ สมาชิกคนนี้รับข้าวสารแล้ว"
        );

        return;

    }


    const name =
        member.name ||
        member.fullName ||
        "-";


    const houseNo =
        member.houseNo ||
        member.address ||
        "-";


    // ==========================================
    // ยืนยัน
    // ==========================================

    const confirmReceive =
        confirm(

            `ยืนยันการรับข้าวสาร\n\n` +

            `สมาชิก: ${name}\n` +

            `บ้านเลขที่: ${houseNo}\n\n` +

            `จำนวน 1 ถุง`

        );


    if (!confirmReceive) {

        return;

    }


    try {

        const result =
            await saveData(

                "deliveries",

                {

                    // งานศพ

                    funeralId:
                        funeralId,

                    funeralName:
                        active.name ||
                        active.deceasedName ||
                        "",


                    // สมาชิก

                    memberId:
                        memberId,

                    memberName:
                        name,

                    houseNo:
                        houseNo,

                    phone:
                        member.phone || "",


                    // จำนวนข้าว

                    quantity:
                        1,


                    // สถานะ

                    status:
                        "received",


                    // วันที่

                    receivedAt:
                        new Date()
                            .toISOString()

                }

            );


        if (!result.success) {

            throw new Error(
                result.error ||
                "ไม่สามารถบันทึกข้อมูลได้"
            );

        }


        notify(
            `✅ บันทึกการรับข้าวสารของ ${name} เรียบร้อย`
        );


        // Real-time จะโหลดใหม่เอง
        // แต่เรียกซ้ำเพื่อให้แสดงผลทันที

        deliveries =
            await loadData(
                "deliveries"
            );


        loadReceiveMembers();

        loadHistory();


    }

    catch (error) {

        console.error(
            "Receive Rice Error:",
            error
        );


        notify(
            "❌ เกิดข้อผิดพลาด: " +
            error.message
        );

    }

}


// ============================================================
// ค้นหาสมาชิก
// ============================================================

function searchReceive() {

    const input =
        document.getElementById(
            "searchReceive"
        );


    if (!input) return;


    const keyword =
        input.value
            .toLowerCase()
            .trim();


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
// โหลดประวัติ
// ============================================================

function loadHistory() {

    const tbody =
        document.getElementById(
            "historyTable"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    if (deliveries.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="5"
                    style="
                        text-align:center;
                        padding:25px;
                    "
                >
                    ยังไม่มีประวัติการรับข้าวสาร
                </td>

            </tr>

        `;

        return;

    }


    // ==========================================
    // เรียงล่าสุดก่อน
    // ==========================================

    const sortedDeliveries =
        [...deliveries].sort((a, b) => {

            const dateA =
                new Date(
                    a.receivedAt ||
                    a.createdAt ||
                    0
                );

            const dateB =
                new Date(
                    b.receivedAt ||
                    b.createdAt ||
                    0
                );

            return dateB - dateA;

        });


    sortedDeliveries.forEach(
        (delivery, index) => {

            const date =
                delivery.receivedAt ||
                delivery.createdAt;


            const dateText =
                date

                ?

                new Date(date)
                    .toLocaleDateString(
                        "th-TH"
                    )

                :

                "-";


            tbody.innerHTML += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>


                    <td>
                        ${escapeHtml(
                            delivery.memberName ||
                            "-"
                        )}
                    </td>


                    <td>
                        ${escapeHtml(
                            delivery.funeralName ||
                            "-"
                        )}
                    </td>


                    <td>
                        ${dateText}
                    </td>


                    <td>
                        ${delivery.quantity || 1}
                        ถุง
                    </td>

                </tr>

            `;

        }
    );

}


// ============================================================
// รายชื่อสมาชิกค้างส่ง
// ============================================================

function pendingMembers() {

    const active =
        getActiveFuneral();


    if (!active) {

        return [];

    }


    const funeralId =
        active.firestoreId ||
        active.id;


    return members.filter(member => {

        const memberId =
            member.firestoreId ||
            member.id;


        const delivery =
            getDelivery(
                memberId,
                funeralId
            );


        return !delivery;

    });

}


// ============================================================
// ปิดงานศพ
// ============================================================

async function finishFuneral() {

    const active =
        getActiveFuneral();


    if (!active) {

        notify(
            "⚠️ ไม่มีงานศพที่เปิดอยู่"
        );

        return;

    }


    const funeralName =
        active.name ||
        active.deceasedName ||
        "งานศพ";


    const pending =
        pendingMembers();


    const receivedCount =
        members.length -
        pending.length;


    const confirmFinish =
        confirm(

            `🔒 ปิดงานศพ\n\n` +

            `ผู้เสียชีวิต: ${funeralName}\n\n` +

            `👥 สมาชิกทั้งหมด: ${members.length} ครัวเรือน\n` +

            `🟢 ส่งแล้ว: ${receivedCount} ครัวเรือน\n` +

            `🔴 ค้างส่ง: ${pending.length} ครัวเรือน\n\n` +

            `ต้องการปิดงานศพหรือไม่?`

        );


    if (!confirmFinish) {

        return;

    }


    try {

        const funeralId =
            active.firestoreId ||
            active.id;


        const result =
            await updateData(

                "funerals",

                funeralId,

                {

                    active: false,

                    status: "finished",

                    finishedAt:
                        new Date()
                            .toISOString(),

                    totalMembers:
                        members.length,

                    receivedCount:
                        receivedCount,

                    pendingCount:
                        pending.length

                }

            );


        if (!result.success) {

            throw new Error(
                result.error ||
                "ไม่สามารถปิดงานศพได้"
            );

        }


        notify(
            "✅ ปิดงานศพเรียบร้อย"
        );


        loadReceiveMembers();


    }

    catch (error) {

        console.error(
            "Finish Funeral Error:",
            error
        );


        notify(
            "❌ " +
            error.message
        );

    }

}


// ============================================================
// สรุปข้อมูลด้านบน
// ============================================================

function updateSummary() {

    const totalMembers =
        members.length;


    const active =
        getActiveFuneral();


    let receivedCount = 0;


    if (active) {

        const funeralId =
            active.firestoreId ||
            active.id;


        receivedCount =
            deliveries.filter(delivery =>

                String(
                    delivery.funeralId
                )

                ===

                String(funeralId)

            ).length;

    }


    const pendingCount =
        Math.max(
            0,
            totalMembers -
            receivedCount
        );


    // ------------------------------------------
    // สมาชิกทั้งหมด
    // ------------------------------------------

    const totalElement =
        document.getElementById(
            "totalMembers"
        );


    if (totalElement) {

        totalElement.textContent =
            totalMembers;

    }


    // ------------------------------------------
    // รับข้าวแล้ว
    // ------------------------------------------

    const receivedElement =
        document.getElementById(
            "receivedCount"
        );


    if (receivedElement) {

        receivedElement.textContent =
            receivedCount;

    }


    // ------------------------------------------
    // ยังไม่ส่ง
    // ------------------------------------------

    const pendingElement =
        document.getElementById(
            "pendingCount"
        );


    if (pendingElement) {

        pendingElement.textContent =
            pendingCount;

    }

}


// ============================================================
// โหลดข้อมูลทั้งหมด
// ============================================================

async function loadAllData() {

    try {

        const results =
            await Promise.all([

                loadData("members"),

                loadData("funerals"),

                loadData("deliveries")

            ]);


        members =
            results[0] || [];

        funerals =
            results[1] || [];

        deliveries =
            results[2] || [];


        loadReceiveMembers();

        loadHistory();

        updateSummary();


    }

    catch (error) {

        console.error(
            "Load Data Error:",
            error
        );

    }

}


// ============================================================
// Firebase Real-time สมาชิก
// ============================================================

subscribeData(

    "members",

    data => {

        members = data || [];

        loadReceiveMembers();

        updateSummary();

    }

);


// ============================================================
// Firebase Real-time งานศพ
// ============================================================

subscribeData(

    "funerals",

    data => {

        funerals = data || [];

        loadReceiveMembers();

        updateSummary();

    }

);


// ============================================================
// Firebase Real-time การรับข้าว
// ============================================================

subscribeData(

    "deliveries",

    data => {

        deliveries = data || [];

        loadReceiveMembers();

        loadHistory();

        updateSummary();

    }

);


// ============================================================
// ปุ่ม HTML
// ============================================================

window.receiveRice =
    receiveRice;

window.searchReceive =
    searchReceive;

window.finishFuneral =
    finishFuneral;

window.loadReceiveMembers =
    loadReceiveMembers;

window.loadHistory =
    loadHistory;

window.loadAllData =
    loadAllData;


// ============================================================
// เริ่มระบบ
// ============================================================

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadAllData();

    }

);


console.log(
    "🌾 Rongkhem Rice Receive System Firebase Ready"
);
