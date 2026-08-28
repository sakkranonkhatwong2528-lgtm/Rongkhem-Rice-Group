// ==========================================
// receive.js
// ระบบรับข้าวสาร
// Rongkhem Rice Group
// Firebase Firestore Version
// ==========================================

import {
    saveData,
    loadDataWithFirestoreId,
    updateData,
    subscribeData
} from "./database.js";

import {
    getRongkhemMembers,
    subscribeMembers
} from "./members.js";


// ==========================================
// COLLECTION
// ==========================================

const FUNERALS_COLLECTION = "funerals";

const DELIVERIES_COLLECTION = "deliveries";


// ==========================================
// ตัวแปรข้อมูล
// ==========================================

let members = [];

let funerals = [];

let deliveries = [];

let unsubscribeMembers = null;

let unsubscribeFunerals = null;

let unsubscribeDeliveries = null;


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
// แจ้งข้อความ
// ==========================================

function notify(message) {

    alert(message);

}


// ==========================================
// ดึงงานศพที่กำลังดำเนินการ
// ==========================================

function getActiveFuneral() {

    return funerals.find(funeral => {

        return funeral.active === true ||
               funeral.status === "active";

    }) || null;

}


// ==========================================
// โหลดข้อมูลเริ่มต้น
// ==========================================

async function loadReceiveData() {

    try {

        members =
            await getRongkhemMembers();

        funerals =
            await loadDataWithFirestoreId(
                FUNERALS_COLLECTION
            );

        deliveries =
            await loadDataWithFirestoreId(
                DELIVERIES_COLLECTION
            );

        renderAll();

    }

    catch (error) {

        console.error(
            "โหลดข้อมูลรับข้าวไม่สำเร็จ:",
            error
        );

        notify(
            "❌ ไม่สามารถโหลดข้อมูลได้"
        );

    }

}


// ==========================================
// ตรวจสอบว่าสมาชิกส่งข้าวแล้วหรือยัง
// ==========================================

function getDelivery(member) {

    const active =
        getActiveFuneral();

    if (!active) {

        return null;

    }

    return deliveries.find(delivery => {

        return String(
            delivery.funeralId
        ) === String(
            active.firestoreId
        )

        &&

        String(
            delivery.memberFirestoreId
        ) === String(
            member.firestoreId
        );

    }) || null;

}


// ==========================================
// แสดงตารางสมาชิก
// ==========================================

function loadReceiveMembers() {

    const tbody =
        document.getElementById(
            "receiveTable"
        );

    if (!tbody) return;


    const active =
        getActiveFuneral();


    tbody.innerHTML = "";


    if (!active) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#dc2626;
                    "
                >

                    ⚠️ ยังไม่มีงานศพที่เปิดอยู่

                </td>

            </tr>

        `;

        return;

    }


    if (members.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >

                    ไม่พบข้อมูลสมาชิก

                </td>

            </tr>

        `;

        return;

    }


    members.forEach(

        (member, index) => {

            const delivery =
                getDelivery(member);


            const received =
                !!delivery;


            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td>
                    ${escapeHtml(

                        member.houseNo ||
                        member.address ||
                        "-"

                    )}
                </td>


                <td>
                    ${escapeHtml(
                        member.name || "-"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        member.phone || "-"
                    )}
                </td>


                <td>

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


                <td>

                    ${
                        received

                        ?

                        `-`

                        :

                        `<button
                            class="btn btn-success receive-button"
                            data-member-id="${member.firestoreId}"
                        >
                            🌾 รับข้าวสาร
                        </button>`
                    }

                </td>

            `;


            tbody.appendChild(
                tr
            );

        }

    );

}


// ==========================================
// รับข้าวสาร
// ==========================================

async function receiveRice(
    memberFirestoreId
) {

    try {

        const active =
            getActiveFuneral();


        if (!active) {

            notify(
                "⚠️ ไม่มีงานศพที่เปิดอยู่"
            );

            return;

        }


        const member =
            members.find(

                item =>
                    item.firestoreId ===
                    memberFirestoreId

            );


        if (!member) {

            notify(
                "❌ ไม่พบข้อมูลสมาชิก"
            );

            return;

        }


        // ป้องกันการบันทึกซ้ำ

        const existingDelivery =
            deliveries.find(

                delivery =>

                    String(
                        delivery.funeralId
                    )

                    ===

                    String(
                        active.firestoreId
                    )

                    &&

                    String(
                        delivery.memberFirestoreId
                    )

                    ===

                    String(
                        member.firestoreId
                    )

            );


        if (existingDelivery) {

            notify(
                "⚠️ สมาชิกท่านนี้ส่งข้าวสารแล้ว"
            );

            return;

        }


        const confirmed =
            confirm(

                `ยืนยันรับข้าวสาร\n\n` +

                `สมาชิก: ${member.name}\n` +

                `บ้านเลขที่: ${
                    member.houseNo ||
                    member.address ||
                    "-"
                }\n\n` +

                `จำนวน 1 ถุง`

            );


        if (!confirmed) {

            return;

        }


        // ==================================
        // บันทึกรายการรับข้าวลง Firebase
        // ==================================

        const result =
            await saveData(

                DELIVERIES_COLLECTION,

                {

                    funeralId:
                        active.firestoreId,

                    memberFirestoreId:
                        member.firestoreId,

                    memberId:
                        member.memberId || "",

                    memberName:
                        member.name || "",

                    houseNo:
                        member.houseNo ||
                        member.address ||
                        "",

                    quantity:
                        1,

                    receivedAt:
                        new Date()
                        .toISOString()

                }

            );


        if (!result.success) {

            throw new Error(

                result.error ||
                "ไม่สามารถบันทึกรายการรับข้าว"

            );

        }


        // ==================================
        // อัปเดตจำนวนครั้งที่ส่งของสมาชิก
        // ==================================

        const newSentCount =
            Number(
                member.sent || 0
            ) + 1;


        const updateResult =
            await updateData(

                "members",

                member.firestoreId,

                {

                    sent:
                        newSentCount,

                    status:
                        "sent"

                }

            );


        if (!updateResult.success) {

            console.warn(
                "บันทึกรายการรับข้าวแล้ว แต่สถานะสมาชิกอัปเดตไม่สำเร็จ"
            );

        }


        notify(

            `✅ บันทึกรับข้าวสารเรียบร้อย\n\n` +

            `${member.name}\n` +

            `จำนวน 1 ถุง`

        );


        await loadReceiveData();

    }

    catch (error) {

        console.error(
            "❌ รับข้าวสารไม่สำเร็จ:",
            error
        );


        notify(

            "❌ บันทึกข้อมูลไม่สำเร็จ\n\n" +

            (
                error.message ||
                error
            )

        );

    }

}


// ==========================================
// ค้นหาสมาชิก
// ==========================================

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

            text.includes(
                keyword
            )

            ?

            ""

            :

            "none";

    });

}


// ==========================================
// รายชื่อสมาชิกที่ยังไม่ส่ง
// ==========================================

function pendingMembers() {

    const active =
        getActiveFuneral();


    if (!active) {

        return [];

    }


    return members.filter(member => {

        const delivery =
            deliveries.find(

                item =>

                    String(
                        item.funeralId
                    )

                    ===

                    String(
                        active.firestoreId
                    )

                    &&

                    String(
                        item.memberFirestoreId
                    )

                    ===

                    String(
                        member.firestoreId
                    )

            );


        return !delivery;

    });

}


// ==========================================
// ปิดงานศพ
// ==========================================

async function finishFuneral() {

    try {

        const active =
            getActiveFuneral();


        if (!active) {

            notify(
                "⚠️ ไม่มีงานศพที่กำลังดำเนินการ"
            );

            return;

        }


        const pending =
            pendingMembers();


        const confirmed =
            confirm(

                `ยืนยันปิดงานศพ\n\n` +

                `${active.name ||
                  active.deceasedName ||
                  "ไม่ระบุชื่อ"}\n\n` +

                `รับข้าวแล้ว: ${
                    members.length -
                    pending.length
                } คน\n` +

                `ค้างส่ง: ${
                    pending.length
                } คน`

            );


        if (!confirmed) {

            return;

        }


        // ==================================
        // เพิ่มจำนวนค้างส่ง
        // ==================================

        for (
            const member
            of pending
        ) {

            await updateData(

                "members",

                member.firestoreId,

                {

                    pending:

                        Number(
                            member.pending || 0
                        ) + 1,

                    status:
                        "pending"

                }

            );

        }


        // ==================================
        // ปิดงานศพ
        // ==================================

        const funeralResult =
            await updateData(

                FUNERALS_COLLECTION,

                active.firestoreId,

                {

                    active:
                        false,

                    status:
                        "finished",

                    finishedAt:
                        new Date()
                        .toISOString(),

                    receivedCount:

                        members.length -
                        pending.length,

                    pendingCount:
                        pending.length

                }

            );


        if (!funeralResult.success) {

            throw new Error(
                "ไม่สามารถปิดงานศพได้"
            );

        }


        notify(

            "✅ ปิดงานศพเรียบร้อย\n\n" +

            `รับข้าวแล้ว ${
                members.length -
                pending.length
            } ถุง\n` +

            `ค้างส่ง ${
                pending.length
            } ครัวเรือน`

        );


        await loadReceiveData();

    }

    catch (error) {

        console.error(
            "❌ ปิดงานศพไม่สำเร็จ:",
            error
        );


        notify(
            "❌ ไม่สามารถปิดงานศพได้"
        );

    }

}


// ==========================================
// ประวัติรับข้าว
// ==========================================

function loadHistory() {

    const tbody =
        document.getElementById(
            "historyTable"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    const sortedDeliveries =
        [...deliveries]
        .sort(

            (a, b) =>

                new Date(
                    b.receivedAt ||
                    b.createdAt ||
                    0
                )

                -

                new Date(
                    a.receivedAt ||
                    a.createdAt ||
                    0
                )

        );


    if (
        sortedDeliveries.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >

                    ยังไม่มีประวัติการรับข้าวสาร

                </td>

            </tr>

        `;

        return;

    }


    sortedDeliveries.forEach(

        (
            delivery,
            index
        ) => {

            const member =
                members.find(

                    item =>

                        item.firestoreId ===
                        delivery.memberFirestoreId

                );


            const funeral =
                funerals.find(

                    item =>

                        item.firestoreId ===
                        delivery.funeralId

                );


            const dateValue =
                delivery.receivedAt ||
                delivery.createdAt;


            const date =
                dateValue

                ?

                new Date(
                    dateValue
                )
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

                            member?.name ||

                            "-"

                        )}

                    </td>


                    <td>

                        ${escapeHtml(

                            funeral?.name ||

                            funeral?.deceasedName ||

                            "-"

                        )}

                    </td>


                    <td>
                        ${date}
                    </td>


                    <td>
                        ${Number(
                            delivery.quantity || 1
                        )} ถุง
                    </td>

                </tr>

            `;

        }

    );

}


// ==========================================
// แสดงผลทั้งหมด
// ==========================================

function renderAll() {

    loadReceiveMembers();

    loadHistory();

    updateReceiveSummary();

}


// ==========================================
// สรุปยอดรับข้าว
// ==========================================

function updateReceiveSummary() {

    const active =
        getActiveFuneral();


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


    if (!active) {

        if (totalElement) {

            totalElement.textContent =
                members.length;

        }


        if (receivedElement) {

            receivedElement.textContent =
                "0";

        }


        if (pendingElement) {

            pendingElement.textContent =
                "0";

        }

        return;

    }


    const received =
        deliveries.filter(

            delivery =>

                String(
                    delivery.funeralId
                )

                ===

                String(
                    active.firestoreId
                )

        ).length;


    const pending =
        Math.max(

            0,

            members.length -
            received

        );


    if (totalElement) {

        totalElement.textContent =
            members.length;

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
// Real-time Firebase
// ==========================================

function startRealtime() {

    // สมาชิก

    unsubscribeMembers =
        subscribeMembers(

            updatedMembers => {

                members =
                    updatedMembers;

                renderAll();

            }

        );


    // งานศพ

    unsubscribeFunerals =
        subscribeData(

            FUNERALS_COLLECTION,

            updatedFunerals => {

                funerals =
                    updatedFunerals;

                renderAll();

            }

        );


    // การรับข้าว

    unsubscribeDeliveries =
        subscribeData(

            DELIVERIES_COLLECTION,

            updatedDeliveries => {

                deliveries =
                    updatedDeliveries;

                renderAll();

            }

        );

}


// ==========================================
// Event Click
// ==========================================

document.addEventListener(

    "click",

    async event => {

        const receiveButton =
            event.target.closest(
                ".receive-button"
            );


        if (receiveButton) {

            await receiveRice(

                receiveButton.dataset.memberId

            );

            return;

        }

    }

);


// ==========================================
// เปิดให้ HTML เดิมเรียกใช้ได้
// ==========================================

window.receiveRice =
    receiveRice;

window.searchReceive =
    searchReceive;

window.pendingMembers =
    pendingMembers;

window.finishFuneral =
    finishFuneral;

window.loadReceiveMembers =
    loadReceiveMembers;

window.loadHistory =
    loadHistory;


// ==========================================
// เริ่มระบบ
// ==========================================

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await loadReceiveData();

        startRealtime();

        console.log(
            "🌾 Receive System Ready"
        );

    }

);


// ==========================================
// ปิดการเชื่อมต่อเมื่อออกจากหน้า
// ==========================================

window.addEventListener(

    "beforeunload",

    () => {

        if (unsubscribeMembers) {

            unsubscribeMembers();

        }

        if (unsubscribeFunerals) {

            unsubscribeFunerals();

        }

        if (unsubscribeDeliveries) {

            unsubscribeDeliveries();

        }

    }

);
