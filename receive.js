// ==========================================
// receive.js
// ระบบรับข้าวสาร บ้านร่องเข็ม หมู่ที่ 6
// Firebase Firestore Version
// ==========================================

import {
    saveData,
    loadDataWithFirestoreId,
    updateData,
    subscribeData
} from "./database.js";


// ==========================================
// ตัวแปรข้อมูล
// ==========================================

let members = [];

let funerals = [];

let deliveries = [];


// ==========================================
// Escape HTML
// ==========================================

function escapeHtml(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// แสดงข้อความ
// ==========================================

function notify(message) {

    alert(message);

}


// ==========================================
// หางานศพที่กำลังเปิดอยู่
// ==========================================

function getActiveFuneral() {

    return funerals.find(

        funeral =>

            funeral.active === true ||

            funeral.status === "active" ||

            funeral.status === "กำลังดำเนินการ"

    ) || null;

}


// ==========================================
// ตรวจสอบสมาชิกส่งข้าวแล้วหรือยัง
// ==========================================

function hasReceived(memberId) {

    const active =
        getActiveFuneral();


    if (!active) {

        return false;

    }


    return deliveries.some(

        delivery => {

            const funeralId =

                delivery.funeralId ||
                delivery.funeralFirestoreId;


            const deliveryMemberId =

                delivery.memberId ||
                delivery.memberFirestoreId;


            return

                String(funeralId)

                ===

                String(active.firestoreId)

                &&

                String(deliveryMemberId)

                ===

                String(memberId);

        }

    );

}


// ==========================================
// โหลดตารางสมาชิก
// ==========================================

function loadReceiveMembers() {

    const tbody =
        document.getElementById(
            "receiveTable"
        );


    if (!tbody) {

        return;

    }


    const active =
        getActiveFuneral();


    tbody.innerHTML = "";


    if (!active) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#b91c1c;
                    "
                >

                    ⚠️ ยังไม่มีงานศพที่เปิดอยู่

                </td>

            </tr>

        `;


        updateSummary();

        return;

    }


    if (members.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#777;
                    "
                >

                    ไม่พบข้อมูลสมาชิก

                </td>

            </tr>

        `;


        updateSummary();

        return;

    }


    members.forEach(

        (member, index) => {

            const memberId =
                member.firestoreId;


            const received =
                hasReceived(memberId);


            tbody.innerHTML += `

                <tr>

                    <td
                        class="px-4 py-3 text-center"
                    >

                        ${index + 1}

                    </td>


                    <td
                        class="px-4 py-3"
                    >

                        ${escapeHtml(
                            member.houseNo ||
                            member.house ||
                            "-"
                        )}

                    </td>


                    <td
                        class="px-4 py-3 font-medium"
                    >

                        ${escapeHtml(
                            member.name ||
                            member.fullName ||
                            "-"
                        )}

                    </td>


                    <td
                        class="px-4 py-3"
                    >

                        ${escapeHtml(
                            member.phone ||
                            "-"
                        )}

                    </td>


                    <td
                        class="px-4 py-3 text-center"
                    >

                        ${
                            received

                            ?

                            `<span class="status normal">
                                ส่งแล้ว
                            </span>`

                            :

                            `<span class="status pending">
                                รอส่ง
                            </span>`
                        }

                    </td>


                    <td
                        class="px-4 py-3 text-center"
                    >

                        ${
                            received

                            ?

                            `-`

                            :

                            `<button
                                class="btn btn-success"
                                onclick="receiveRice('${memberId}')"
                            >

                                รับข้าวสาร

                            </button>`
                        }

                    </td>

                </tr>

            `;

        }

    );


    updateSummary();

}


// ==========================================
// รับข้าวสาร
// ==========================================

async function receiveRice(memberId) {

    const active =
        getActiveFuneral();


    if (!active) {

        notify(
            "⚠️ ยังไม่มีงานศพที่เปิดอยู่"
        );

        return;

    }


    const member =
        members.find(

            item =>

                String(item.firestoreId)

                ===

                String(memberId)

        );


    if (!member) {

        notify(
            "❌ ไม่พบข้อมูลสมาชิก"
        );

        return;

    }


    if (
        hasReceived(memberId)
    ) {

        notify(
            "⚠️ สมาชิกคนนี้ส่งข้าวสารแล้ว"
        );

        return;

    }


    const confirmed =
        confirm(

            `ยืนยันการรับข้าวสาร\n\n` +

            `สมาชิก: ${member.name || "-"}\n` +

            `บ้านเลขที่: ${member.houseNo || "-"}\n\n` +

            `จำนวน 1 ถุง`

        );


    if (!confirmed) {

        return;

    }


    const result =
        await saveData(

            "deliveries",

            {

                funeralId:
                    active.firestoreId,

                memberId:
                    member.firestoreId,

                memberName:
                    member.name || "",

                houseNo:
                    member.houseNo || "",

                quantity:
                    1,

                date:
                    new Date()
                    .toISOString(),

                status:
                    "received"

            }

        );


    if (!result.success) {

        notify(
            "❌ บันทึกข้อมูลไม่สำเร็จ"
        );

        return;

    }


    notify(
        "✅ บันทึกการรับข้าวสารเรียบร้อย"
    );

}


// ทำให้ onclick ใน HTML เรียกใช้ได้

window.receiveRice =
    receiveRice;


// ==========================================
// ค้นหาสมาชิก
// ==========================================

function searchReceive() {

    const keyword =
        document
            .getElementById(
                "searchReceive"
            )
            ?.value
            .toLowerCase()
            .trim() || "";


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


window.searchReceive =
    searchReceive;


// ==========================================
// รายชื่อสมาชิกค้างส่ง
// ==========================================

function pendingMembers() {

    const active =
        getActiveFuneral();


    if (!active) {

        return [];

    }


    return members.filter(

        member =>

            !hasReceived(
                member.firestoreId
            )

    );

}


// ==========================================
// ปิดงานศพ
// ==========================================

async function finishFuneral() {

    const active =
        getActiveFuneral();


    if (!active) {

        notify(
            "⚠️ ไม่มีงานศพที่กำลังเปิดอยู่"
        );

        return;

    }


    const pending =
        pendingMembers();


    const confirmed =
        confirm(

            `ต้องการปิดงานศพ\n\n` +

            `${
                active.name ||
                active.deceasedName ||
                "-"
            }\n\n` +

            `สมาชิกทั้งหมด: ${members.length} คน\n` +

            `ส่งแล้ว: ${
                members.length -
                pending.length
            } คน\n` +

            `ค้างส่ง: ${pending.length} คน`

        );


    if (!confirmed) {

        return;

    }


    const result =
        await updateData(

            "funerals",

            active.firestoreId,

            {

                active:
                    false,

                status:
                    "finished",

                finishedAt:
                    new Date()
                    .toISOString()

            }

        );


    if (!result.success) {

        notify(
            "❌ ไม่สามารถปิดงานศพได้"
        );

        return;

    }


    notify(
        "✅ ปิดงานศพเรียบร้อย"
    );

}


window.finishFuneral =
    finishFuneral;


// ==========================================
// โหลดประวัติการรับข้าวสาร
// ==========================================

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
        [...deliveries]
        .sort(

            (a, b) => {

                const dateA =
                    new Date(
                        a.date ||
                        a.createdAt ||
                        0
                    );


                const dateB =
                    new Date(
                        b.date ||
                        b.createdAt ||
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
                    class="
                        text-center
                        py-10
                        text-gray-400
                    "
                >

                    ยังไม่มีประวัติการรับข้าวสาร

                </td>

            </tr>

        `;

        return;

    }


    history.forEach(

        (delivery, index) => {

            const member =

                members.find(

                    item =>

                        String(
                            item.firestoreId
                        )

                        ===

                        String(
                            delivery.memberId ||
                            delivery.memberFirestoreId
                        )

                );


            const funeral =

                funerals.find(

                    item =>

                        String(
                            item.firestoreId
                        )

                        ===

                        String(
                            delivery.funeralId ||
                            delivery.funeralFirestoreId
                        )

                );


            const dateValue =

                delivery.date ||

                delivery.createdAt ||

                "";


            let formattedDate =
                "-";


            if (dateValue) {

                const date =
                    new Date(
                        dateValue
                    );


                if (
                    !isNaN(
                        date.getTime()
                    )
                ) {

                    formattedDate =
                        date.toLocaleDateString(
                            "th-TH",
                            {

                                year:
                                    "numeric",

                                month:
                                    "2-digit",

                                day:
                                    "2-digit"

                            }
                        );

                }

            }


            tbody.innerHTML += `

                <tr>

                    <td
                        class="px-4 py-3 text-center"
                    >

                        ${index + 1}

                    </td>


                    <td
                        class="px-4 py-3"
                    >

                        ${escapeHtml(

                            member?.name ||

                            delivery.memberName ||

                            "-"

                        )}

                    </td>


                    <td
                        class="px-4 py-3"
                    >

                        ${escapeHtml(

                            funeral?.name ||

                            funeral?.deceasedName ||

                            "-"

                        )}

                    </td>


                    <td
                        class="px-4 py-3 text-center"
                    >

                        ${formattedDate}

                    </td>


                    <td
                        class="px-4 py-3 text-center"
                    >

                        ${
                            delivery.quantity ||
                            1
                        }

                        ถุง

                    </td>

                </tr>

            `;

        }

    );

}


// ==========================================
// อัปเดตสรุปด้านบน
// ==========================================

function updateSummary() {

    const active =
        getActiveFuneral();


    const total =
        members.length;


    let received =
        0;


    if (active) {

        received =
            members.filter(

                member =>

                    hasReceived(
                        member.firestoreId
                    )

            ).length;

    }


    const pending =
        active

        ?

        total - received

        :

        0;


    const totalElement =
        document.getElementById(
            "totalMembers"
        );


    const receivedElement =
        document.getElementById(
            "receivedCount"
        );


    const pendingElement =
        document.getElementById(
            "pendingCount"
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


// ==========================================
// โหลดข้อมูลครั้งแรก
// ==========================================

async function loadAllData() {

    try {

        members =
            await loadDataWithFirestoreId(
                "members"
            );


        funerals =
            await loadDataWithFirestoreId(
                "funerals"
            );


        deliveries =
            await loadDataWithFirestoreId(
                "deliveries"
            );


        loadReceiveMembers();

        loadHistory();

        updateSummary();

    }

    catch (error) {

        console.error(
            "โหลดข้อมูลไม่สำเร็จ:",
            error
        );


        notify(
            "❌ ไม่สามารถโหลดข้อมูลจาก Firebase ได้"
        );

    }

}


// ==========================================
// REALTIME สมาชิก
// ==========================================

subscribeData(

    "members",

    data => {

        members = data;

        loadReceiveMembers();

        loadHistory();

        updateSummary();

    }

);


// ==========================================
// REALTIME งานศพ
// ==========================================

subscribeData(

    "funerals",

    data => {

        funerals = data;

        loadReceiveMembers();

        loadHistory();

        updateSummary();

    }

);


// ==========================================
// REALTIME การรับข้าว
// ==========================================

subscribeData(

    "deliveries",

    data => {

        deliveries = data;

        loadReceiveMembers();

        loadHistory();

        updateSummary();

    }

);


// ==========================================
// เริ่มระบบ
// ==========================================

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadAllData();

    }

);


console.log(
    "🌾 Receive System Firebase Ready"
);
