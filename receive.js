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

const MEMBERS_COLLECTION = "members";
const FUNERALS_COLLECTION = "funerals";
const DELIVERIES_COLLECTION = "deliveries";
const ACTIVITIES_COLLECTION = "activities";

let receiveMembers = [];
let receiveFunerals = [];
let receiveDeliveries = [];

let unsubscribeMembers = null;
let unsubscribeFunerals = null;
let unsubscribeDeliveries = null;

function safeArray(data) {
    return Array.isArray(data) ? data : [];
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

// สำคัญ: เปิดฟังก์ชันให้ปุ่ม onclick ใช้งานได้
window.receiveRice = receiveRice;

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
// 📜 ประวัติการรับข้าวสาร
// ============================================================

function loadHistory() {

    const tbody =
        document.getElementById(
            "historyTable"
        )

        ||

        document.getElementById(
            "receiveHistory"
        );

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    if (
        receiveDeliveries.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    style="
                        text-align:center;
                        padding:25px;
                        color:#777;
                    "
                >
                    ยังไม่มีประวัติการรับข้าวสาร
                </td>
            </tr>
        `;

        return;

    }

    const history =
        [...receiveDeliveries]
            .sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.receivedDate ||
                            a.createdAt ||
                            0
                        );

                    const dateB =
                        new Date(
                            b.receivedDate ||
                            b.createdAt ||
                            0
                        );

                    return dateB - dateA;

                }
            );

    history.forEach(
        (item, index) => {

            const date =
                formatReceiveDate(
                    item.receivedDate ||
                    item.createdAt
                );

            tbody.innerHTML += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${item.memberName || "-"}
                    </td>

                    <td>
                        ${item.funeralName || "-"}
                    </td>

                    <td>
                        ${date}
                    </td>

                    <td>
                        ${item.quantity || 1}
                    </td>

                </tr>

            `;

        }
    );

}

// ============================================================
// 📅 แปลงวันที่
// ============================================================

function formatReceiveDate(value) {

    if (!value) {
        return "-";
    }

    try {

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "-";
        }

        return date.toLocaleDateString(
            "th-TH",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    } catch (error) {

        return "-";

    }

}

// ============================================================
// 📢 แสดงข้อความแจ้งเตือน
// ============================================================

function showReceiveNotify(message) {

    const notify =
        document.getElementById(
            "receiveNotify"
        );

    if (notify) {

        notify.textContent =
            message;

        notify.style.display =
            "block";

        setTimeout(
            () => {

                notify.style.display =
                    "none";

            },
            4000
        );

    } else {

        alert(message);

    }

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
                    "rice",

                createdAt:
                    new Date()
                        .toISOString()

            }
        );

    } catch (error) {

        console.warn(
            "⚠️ ไม่สามารถบันทึกกิจกรรม:",
            error
        );

    }

}

// ============================================================
// 🔄 โหลดข้อมูลใหม่
// ============================================================

async function reloadReceiveData() {

    try {

        await loadReceiveData();

        showReceiveNotify(
            "🔄 โหลดข้อมูลล่าสุดเรียบร้อย"
        );

    } catch (error) {

        console.error(
            error
        );

        showReceiveNotify(
            "❌ ไม่สามารถโหลดข้อมูลใหม่ได้"
        );

    }

}

// ============================================================
// 🔒 ปิดงานศพ
// ============================================================

async function closeReceiveFuneral() {

    try {

        const active =
            getActiveReceiveFuneral();

        if (!active) {

            showReceiveNotify(
                "⚠️ ไม่มีงานศพที่กำลังดำเนินการ"
            );

            return;

        }

        const confirmClose =
            confirm(

                `ยืนยันการปิดงานศพ\n\n` +

                `${active.name || active.deceasedName || ""}`

            );

        if (!confirmClose) {
            return;
        }

        const funeralDocumentId =
            active.firestoreId ||
            active.docId ||
            active.id;

        if (!funeralDocumentId) {

            throw new Error(
                "ไม่พบรหัสงานศพ"
            );

        }

        const result =
            await updateData(
                FUNERALS_COLLECTION,
                funeralDocumentId,
                {

                    active:
                        false,

                    status:
                        "completed",

                    closedAt:
                        new Date()
                            .toISOString()

                }
            );

        if (
            result &&
            result.success === false
        ) {

            throw new Error(
                result.error ||
                "ไม่สามารถปิดงานศพได้"
            );

        }

        await loadReceiveData();

        showReceiveNotify(
            "🔒 ปิดงานศพเรียบร้อย"
        );

    } catch (error) {

        console.error(
            "❌ ปิดงานศพไม่สำเร็จ:",
            error
        );

        showReceiveNotify(

            "❌ ไม่สามารถปิดงานศพได้\n" +

            error.message

        );

    }

}

// ============================================================
// ⚡ ระบบ Real-time สมาชิก
// ============================================================

function startReceiveRealtime() {

    try {

        if (
            typeof unsubscribeMembers ===
            "function"
        ) {

            unsubscribeMembers();

        }

        unsubscribeMembers =
            subscribeMembers(
                members => {

                    receiveMembers =
                        sortMembers(
                            safeArray(members)
                        );

                    loadReceiveMembers();

                }
            );

    } catch (error) {

        console.warn(
            "⚠️ ไม่สามารถเชื่อม Real-time สมาชิก:",
            error
        );

    }

    try {

        if (
            typeof unsubscribeFunerals ===
            "function"
        ) {

            unsubscribeFunerals();

        }

        unsubscribeFunerals =
            subscribeData(
                FUNERALS_COLLECTION,
                funerals => {

                    receiveFunerals =
                        safeArray(
                            funerals
                        );

                    loadReceiveMembers();

                    updateReceiveSummary();

                }
            );

    } catch (error) {

        console.warn(
            "⚠️ ไม่สามารถเชื่อม Real-time งานศพ:",
            error
        );

    }

    try {

        if (
            typeof unsubscribeDeliveries ===
            "function"
        ) {

            unsubscribeDeliveries();

        }

        unsubscribeDeliveries =
            subscribeData(
                DELIVERIES_COLLECTION,
                deliveries => {

                    receiveDeliveries =
                        safeArray(
                            deliveries
                        );

                    loadReceiveMembers();

                    loadHistory();

                    updateReceiveSummary();

                }
            );

    } catch (error) {

        console.warn(
            "⚠️ ไม่สามารถเชื่อม Real-time การรับข้าว:",
            error
        );

    }

}

// ============================================================
// 🧹 ปิดการเชื่อมต่อ
// ============================================================

function stopReceiveRealtime() {

    if (
        typeof unsubscribeMembers ===
        "function"
    ) {

        unsubscribeMembers();

        unsubscribeMembers =
            null;

    }

    if (
        typeof unsubscribeFunerals ===
        "function"
    ) {

        unsubscribeFunerals();

        unsubscribeFunerals =
            null;

    }

    if (
        typeof unsubscribeDeliveries ===
        "function"
    ) {

        unsubscribeDeliveries();

        unsubscribeDeliveries =
            null;

    }

}

// ============================================================
// 🌐 เปิดฟังก์ชันให้ HTML ใช้งาน
// ============================================================

window.receiveRice =
    receiveRice;

window.reloadReceiveData =
    reloadReceiveData;

window.closeReceiveFuneral =
    closeReceiveFuneral;

window.searchReceive =
    searchReceive;

window.loadReceiveData =
    loadReceiveData;

window.loadReceiveMembers =
    loadReceiveMembers;

// ============================================================
// 🚀 เริ่มระบบ
// ============================================================

document.addEventListener(
    "DOMContentLoaded",

    async function () {

        console.log(
            "🌾 เริ่มระบบรับข้าวสาร"
        );

        try {

            await loadReceiveData();

            startReceiveRealtime();

            console.log(
                "✅ ระบบรับข้าวสารพร้อมใช้งาน"
            );

        } catch (error) {

            console.error(
                "❌ เริ่มระบบไม่สำเร็จ:",
                error
            );

            showReceiveNotify(
                "❌ ไม่สามารถเริ่มระบบได้"
            );

        }

    }
);

// ============================================================
// 🧹 ปิดการเชื่อมต่อเมื่อออกจากหน้า
// ============================================================

window.addEventListener(
    "beforeunload",

    function () {

        stopReceiveRealtime();

    }
);
