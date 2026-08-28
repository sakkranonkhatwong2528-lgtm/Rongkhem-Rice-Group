// ==========================================
// dashboard.js
// ระบบหน้าหลักกลุ่มข้าวสาร
// ดึงข้อมูลจาก Firebase Firestore
// ==========================================

import {
    loadDataWithFirestoreId,
    subscribeData
} from "./database.js";

import {
    getRongkhemMembers
} from "./members.js";


// ==========================================
// ตัวแปรข้อมูล
// ==========================================

let members = [];

let funerals = [];

let deliveries = [];


// ==========================================
// แปลงตัวเลข
// ==========================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }

}


// ==========================================
// หางานศพที่กำลังดำเนินการ
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
// คำนวณสมาชิกค้างส่ง
// ==========================================

function getPendingMembers() {

    const active =
        getActiveFuneral();


    if (!active) {

        return [];

    }


    return members.filter(
        member => {

            const received =
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


            return !received;

        }
    );

}


// ==========================================
// จำนวนรับข้าวของงานปัจจุบัน
// ==========================================

function getCurrentReceivedCount() {

    const active =
        getActiveFuneral();


    if (!active) {

        return 0;

    }


    return deliveries.filter(
        delivery =>

            String(
                delivery.funeralId
            )

            ===

            String(
                active.firestoreId
            )

    ).length;

}


// ==========================================
// แสดงยอด Dashboard
// ==========================================

function updateDashboard() {

    const totalMembers =
        members.length;


    const activeFuneral =
        getActiveFuneral();


    const currentReceived =
        getCurrentReceivedCount();


    const pending =
        getPendingMembers();


    // สมาชิกทั้งหมด

    setText(
        "totalMembers",
        totalMembers
    );


    setText(
        "memberCount",
        totalMembers
    );


    // งานศพทั้งหมด

    setText(
        "totalFunerals",
        funerals.length
    );


    setText(
        "funeralCount",
        funerals.length
    );


    // รับข้าวสารจริง

    setText(
        "receivedRice",
        currentReceived
    );


    setText(
        "receivedCount",
        currentReceived
    );


    // สมาชิกค้างส่ง

    setText(
        "pendingMembers",
        pending.length
    );


    setText(
        "pendingCount",
        pending.length
    );


    // จำนวนสมาชิกทั้งหมดของงานปัจจุบัน

    setText(
        "currentTotalMembers",
        totalMembers
    );


    // เปอร์เซ็นต์

    const percent =

        totalMembers > 0

        ?

        Math.round(
            (
                currentReceived /
                totalMembers
            ) * 100
        )

        :

        0;


    setText(
        "receivePercent",
        percent + "%"
    );


    // แสดงงานศพปัจจุบัน

    updateActiveFuneral(
        activeFuneral,
        currentReceived,
        totalMembers,
        percent
    );


    // แสดงรายชื่อค้างส่ง

    updatePendingList(
        pending
    );


    // แสดงข้อความไว้อาลัย

    updateCondolence(
        activeFuneral
    );

}


// ==========================================
// แสดงงานศพปัจจุบัน
// ==========================================

function updateActiveFuneral(

    funeral,

    received,

    total,

    percent

) {

    const container =
        document.getElementById(
            "activeFuneral"
        );


    if (!container) {

        return;

    }


    if (!funeral) {

        container.innerHTML = `

            <div
                style="
                    text-align:center;
                    padding:25px;
                    color:#777;
                "
            >

                ⚰️ ขณะนี้ไม่มีงานศพที่กำลังดำเนินการ

            </div>

        `;

        return;

    }


    const name =

        funeral.name ||

        funeral.deceasedName ||

        "ไม่ระบุชื่อ";


    const age =
        funeral.age || "-";


    const houseNo =

        funeral.houseNo ||

        funeral.address ||

        "-";


    const deathDate =

        funeral.deathDate ||

        funeral.date ||

        "-";


    const cremationDate =

        funeral.cremationDate ||

        funeral.funeralDate ||

        "-";


    container.innerHTML = `

        <div class="funeral-card">

            <h3>

                ${escapeHtml(name)}

            </h3>

            <p>

                อายุ:
                <strong>
                    ${escapeHtml(age)}
                </strong>

                |

                บ้านเลขที่:
                <strong>
                    ${escapeHtml(houseNo)}
                </strong>

            </p>

            <p>

                🔴
                <strong>
                    กำลังดำเนินการ
                </strong>

            </p>

            <p>

                ✝️ เสียชีวิต:

                <strong>
                    ${escapeHtml(deathDate)}
                </strong>

            </p>

            <p>

                🔥 ฌาปนกิจ:

                <strong>
                    ${escapeHtml(cremationDate)}
                </strong>

            </p>

            <p>

                🌾 รับจริงต่องาน:

                <strong>

                    ${received}

                    /

                    ${total}

                    ถุง

                    (${percent}%)

                </strong>

            </p>

        </div>

    `;

}


// ==========================================
// รายชื่อสมาชิกค้างส่ง
// ==========================================

function updatePendingList(
    pending
) {

    const container =
        document.getElementById(
            "pendingList"
        );


    if (!container) {

        return;

    }


    if (pending.length === 0) {

        container.innerHTML = `

            <div
                style="
                    text-align:center;
                    padding:20px;
                    color:#15803d;
                "
            >

                ✅ ไม่มีสมาชิกค้างส่งข้าวสาร

            </div>

        `;

        return;

    }


    container.innerHTML =
        pending.map(
            (
                member,
                index
            ) => `

                <div class="pending-member">

                    ${index + 1}.

                    ${escapeHtml(
                        member.name || "-"
                    )}

                    -

                    บ้านเลขที่

                    ${escapeHtml(
                        member.houseNo ||
                        member.address ||
                        "-"
                    )}

                </div>

            `
        ).join("");

}


// ==========================================
// ข้อความไว้อาลัย
// ==========================================

function updateCondolence(
    funeral
) {

    const nameElement =
        document.getElementById(
            "deceasedName"
        );


    if (!nameElement) {

        return;

    }


    if (!funeral) {

        nameElement.textContent =

            "ทีมผู้นำหมู่บ้านร่องเข็ม หมู่ 6 " +

            "ร่วมกับสมาชิกกลุ่มข้าวสาร " +

            "ขอแสดงความเสียใจอย่างสุดซึ้งต่อครอบครัวผู้วายชนม์ " +

            "ขอวิญญาณของท่านจงไปสู่สุขคติในสัมปรายภพด้วยเทอญ 🤍";

        return;

    }


    const name =

        funeral.name ||

        funeral.deceasedName ||

        "";


    nameElement.textContent =

        "ทีมผู้นำหมู่บ้านร่องเข็ม หมู่ 6 " +

        "ร่วมกับสมาชิกกลุ่มข้าวสาร " +

        "ขอแสดงความเสียใจอย่างสุดซึ้งต่อครอบครัวของ " +

        name +

        " ขอวิญญาณของท่านจงไปสู่สุขคติในสัมปรายภพด้วยเทอญ 🤍";

}


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
// โหลดข้อมูลทั้งหมดครั้งแรก
// ==========================================

async function loadDashboard() {

    try {

        members =
            await getRongkhemMembers();


        funerals =
            await loadDataWithFirestoreId(
                "funerals"
            );


        deliveries =
            await loadDataWithFirestoreId(
                "deliveries"
            );


        updateDashboard();


    } catch (error) {

        console.error(
            "โหลด Dashboard ไม่สำเร็จ:",
            error
        );

    }

}


// ==========================================
// REALTIME MEMBERS
// ==========================================

subscribeData(

    "members",

    data => {

        members = data;

        updateDashboard();

    }

);


// ==========================================
// REALTIME FUNERALS
// ==========================================

subscribeData(

    "funerals",

    data => {

        funerals = data;

        updateDashboard();

    }

);


// ==========================================
// REALTIME DELIVERIES
// ==========================================

subscribeData(

    "deliveries",

    data => {

        deliveries = data;

        updateDashboard();

    }

);


// ==========================================
// START SYSTEM
// ==========================================

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadDashboard();

    }

);


console.log(
    "📊 Dashboard Firebase Ready"
);
// ==========================================
// บันทึกงานศพใหม่
// ==========================================

import {
    saveData,
    updateData
} from "./database.js";


async function createNewFuneral(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("funeralName")
            ?.value
            .trim();


    const age =
        document
            .getElementById("funeralAge")
            ?.value
            .trim();


    const houseNo =
        document
            .getElementById("funeralHouseNo")
            ?.value
            .trim();


    const deathDate =
        document
            .getElementById("deathDate")
            ?.value;


    const cremationDate =
        document
            .getElementById("cremationDate")
            ?.value;


    const note =
        document
            .getElementById("funeralNote")
            ?.value
            .trim();


    if (!name) {

        alert("⚠️ กรุณาระบุชื่อผู้เสียชีวิต");

        return;

    }


    // ตรวจสอบว่ามีงานที่เปิดอยู่หรือไม่

    const activeFuneral =
        getActiveFuneral();


    if (activeFuneral) {

        const confirmed =
            confirm(

                `ขณะนี้มีงานศพที่กำลังดำเนินการอยู่\n\n` +
                `${activeFuneral.name || activeFuneral.deceasedName}\n\n` +
                `ต้องการปิดงานเดิมและเปิดงานใหม่หรือไม่?`

            );


        if (!confirmed) {

            return;

        }


        // ปิดงานเดิม

        await updateData(

            "funerals",

            activeFuneral.firestoreId,

            {
                active: false,
                status: "finished",
                finishedAt: new Date().toISOString()
            }

        );

    }


    // บันทึกงานใหม่

    const result =
        await saveData(

            "funerals",

            {

                name: name,

                deceasedName: name,

                age: age || "",

                houseNo: houseNo || "",

                deathDate: deathDate || "",

                cremationDate: cremationDate || "",

                note: note || "",

                active: true,

                status: "active",

                openedAt:
                    new Date()
                    .toISOString()

            }

        );


    if (!result.success) {

        alert(
            "❌ ไม่สามารถบันทึกงานศพได้\n\n" +
            (result.error || "")
        );

        return;

    }


    alert(
        "✅ บันทึกงานศพเรียบร้อย\n\n" +
        "ระบบเปิดรอบรับข้าวสารแล้ว"
    );


    document
        .getElementById("funeralForm")
        ?.reset();

}


// ==========================================
// ผูกฟอร์มแจ้งงานศพ
// ==========================================

document.addEventListener(

    "DOMContentLoaded",

    () => {

        const funeralForm =
            document.getElementById(
                "funeralForm"
            );


        if (funeralForm) {

            funeralForm.addEventListener(

                "submit",

                createNewFuneral

            );

        }

    }

);
