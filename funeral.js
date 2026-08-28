// ============================================================
// funeral.js
// ระบบจัดการงานศพ
// Rongkhem Rice Group
// Firebase Firestore
// ============================================================

import {
    saveData,
    loadData,
    updateData,
    deleteData,
    subscribeData
} from "./database.js";


// ============================================================
// ตัวแปรระบบ
// ============================================================

let funerals = [];
let editingFuneralId = null;


// ============================================================
// ป้องกัน HTML
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
// ค้นหาชื่อ Element รองรับ ID หลายแบบ
// ============================================================

function getElement(...ids) {

    for (const id of ids) {

        const element =
            document.getElementById(id);

        if (element) return element;

    }

    return null;

}


// ============================================================
// อ่านชื่องานศพ
// ============================================================

function getFuneralNameInput() {

    return getElement(
        "funeralName",
        "deceasedName",
        "inputDeceasedName"
    );

}


// ============================================================
// แสดงรายการงานศพ
// ============================================================

function renderFunerals() {

    const container =
        getElement(
            "funeralList",
            "funeralTable",
            "funeralTableBody"
        );

    if (!container) return;


    const sortedFunerals =
        [...funerals].sort((a, b) => {

            const dateA =
                new Date(
                    a.createdAt ||
                    a.openedAt ||
                    a.date ||
                    0
                );

            const dateB =
                new Date(
                    b.createdAt ||
                    b.openedAt ||
                    b.date ||
                    0
                );

            return dateB - dateA;

        });


    // ถ้าเป็น TBODY
    if (container.tagName === "TBODY") {

        if (sortedFunerals.length === 0) {

            container.innerHTML = `
                <tr>
                    <td colspan="6"
                        style="text-align:center;padding:25px">
                        ยังไม่มีข้อมูลงานศพ
                    </td>
                </tr>
            `;

            return;

        }


        container.innerHTML =
            sortedFunerals.map((funeral, index) => {

                const name =
                    funeral.name ||
                    funeral.deceasedName ||
                    "-";


                const active =
                    funeral.active === true ||
                    funeral.status === "active";


                return `
                    <tr>

                        <td>${index + 1}</td>

                        <td>
                            ${escapeHtml(name)}
                        </td>

                        <td>
                            ${escapeHtml(
                                funeral.houseNo || "-"
                            )}
                        </td>

                        <td>
                            ${
                                active
                                    ? "🟢 กำลังดำเนินการ"
                                    : "⚪ ปิดงานแล้ว"
                            }
                        </td>

                        <td>
                            <button
                                onclick="editFuneral('${funeral.firestoreId}')"
                            >
                                ✏️ แก้ไข
                            </button>

                            <button
                                onclick="deleteFuneral('${funeral.firestoreId}')"
                            >
                                🗑️ ลบ
                            </button>
                        </td>

                    </tr>
                `;

            }).join("");

        return;

    }


    // ถ้าเป็น DIV
    if (sortedFunerals.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                ⚰️ ยังไม่มีรายการงานศพ
            </div>
        `;

        return;

    }


    container.innerHTML =
        sortedFunerals.map((funeral) => {

            const name =
                funeral.name ||
                funeral.deceasedName ||
                "-";


            const active =
                funeral.active === true ||
                funeral.status === "active";


            return `
                <div class="funeral-item">

                    <div>

                        <strong>
                            ⚰️ ${escapeHtml(name)}
                        </strong>

                        <br>

                        บ้านเลขที่:
                        ${escapeHtml(
                            funeral.houseNo || "-"
                        )}

                        <br>

                        ${
                            active
                                ? "🟢 กำลังดำเนินการ"
                                : "⚪ ปิดงานแล้ว"
                        }

                    </div>


                    <div>

                        <button
                            onclick="editFuneral('${funeral.firestoreId}')"
                        >
                            ✏️ แก้ไข
                        </button>

                        <button
                            onclick="deleteFuneral('${funeral.firestoreId}')"
                        >
                            🗑️ ลบ
                        </button>

                    </div>

                </div>
            `;

        }).join("");

}


// ============================================================
// เปิด / บันทึกงานศพ
// ============================================================

async function saveFuneral(event) {

    if (event) {
        event.preventDefault();
    }


    const nameInput =
        getFuneralNameInput();


    if (!nameInput) {

        alert(
            "❌ ไม่พบช่องกรอกชื่อผู้เสียชีวิต"
        );

        return;

    }


    const name =
        nameInput.value.trim();


    if (!name) {

        alert(
            "⚠️ กรุณาระบุชื่อผู้เสียชีวิต"
        );

        nameInput.focus();

        return;

    }


    const houseInput =
        getElement(
            "funeralHouseNo",
            "houseNo"
        );


    const deathDateInput =
        getElement(
            "deathDate",
            "funeralDate"
        );


    const cremationDateInput =
        getElement(
            "cremationDate"
        );


    const noteInput =
        getElement(
            "funeralNote",
            "note"
        );


    const funeralData = {

        name: name,

        deceasedName: name,

        houseNo:
            houseInput?.value.trim() || "",

        deathDate:
            deathDateInput?.value || "",

        cremationDate:
            cremationDateInput?.value || "",

        note:
            noteInput?.value.trim() || ""

    };


    try {

        // ==============================================
        // แก้ไขข้อมูลเดิม
        // ==============================================

        if (editingFuneralId) {

            const result =
                await updateData(

                    "funerals",

                    editingFuneralId,

                    funeralData

                );


            if (!result.success) {

                throw new Error(
                    result.error ||
                    "ไม่สามารถแก้ไขข้อมูลได้"
                );

            }


            alert(
                "✅ แก้ไขข้อมูลงานศพเรียบร้อย"
            );

        }


        // ==============================================
        // เพิ่มงานศพใหม่
        // ==============================================

        else {

            // ปิดงานศพเก่าที่กำลังเปิดอยู่ก่อน

            const activeFunerals =
                funerals.filter(

                    funeral =>

                        funeral.active === true ||

                        funeral.status === "active"

                );


            for (
                const oldFuneral
                of activeFunerals
            ) {

                await updateData(

                    "funerals",

                    oldFuneral.firestoreId,

                    {

                        active: false,

                        status: "finished",

                        finishedAt:
                            new Date()
                                .toISOString()

                    }

                );

            }


            // บันทึกงานศพใหม่

            const result =
                await saveData(

                    "funerals",

                    {

                        ...funeralData,

                        active: true,

                        status: "active",

                        openedAt:
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


            alert(
                "✅ เปิดงานศพใหม่เรียบร้อย\n\n" +
                "🌾 ระบบรับข้าวสารพร้อมใช้งาน"
            );

        }


        resetFuneralForm();

    }

    catch (error) {

        console.error(
            "Funeral Save Error:",
            error
        );


        alert(
            "❌ " +
            (
                error.message ||
                "เกิดข้อผิดพลาด"
            )
        );

    }

}


// ============================================================
// แก้ไขงานศพ
// ============================================================

function editFuneral(id) {

    const funeral =
        funerals.find(

            item =>

                String(item.firestoreId)

                ===

                String(id)

        );


    if (!funeral) {

        alert(
            "❌ ไม่พบข้อมูลงานศพ"
        );

        return;

    }


    editingFuneralId =
        funeral.firestoreId;


    const nameInput =
        getFuneralNameInput();


    if (nameInput) {

        nameInput.value =
            funeral.name ||
            funeral.deceasedName ||
            "";

    }


    const houseInput =
        getElement(
            "funeralHouseNo",
            "houseNo"
        );


    if (houseInput) {

        houseInput.value =
            funeral.houseNo || "";

    }


    const deathDateInput =
        getElement(
            "deathDate",
            "funeralDate"
        );


    if (deathDateInput) {

        deathDateInput.value =
            funeral.deathDate || "";

    }


    const cremationDateInput =
        getElement(
            "cremationDate"
        );


    if (cremationDateInput) {

        cremationDateInput.value =
            funeral.cremationDate || "";

    }


    const noteInput =
        getElement(
            "funeralNote",
            "note"
        );


    if (noteInput) {

        noteInput.value =
            funeral.note || "";

    }


    nameInput?.focus();

}


// ============================================================
// ลบงานศพ
// ============================================================

async function deleteFuneral(id) {

    const funeral =
        funerals.find(

            item =>

                String(item.firestoreId)

                ===

                String(id)

        );


    if (!funeral) {

        alert(
            "❌ ไม่พบข้อมูลงานศพ"
        );

        return;

    }


    const name =
        funeral.name ||
        funeral.deceasedName ||
        "";


    const confirmDelete =
        confirm(

            `ต้องการลบงานศพ\n\n${name}\n\nใช่หรือไม่?`

        );


    if (!confirmDelete) {

        return;

    }


    const result =
        await deleteData(

            "funerals",

            funeral.firestoreId

        );


    if (result.success) {

        alert(
            "✅ ลบข้อมูลงานศพเรียบร้อย"
        );

    }

    else {

        alert(
            "❌ ไม่สามารถลบข้อมูลได้\n" +
            (result.error || "")
        );

    }

}


// ============================================================
// รีเซ็ตฟอร์ม
// ============================================================

function resetFuneralForm() {

    editingFuneralId = null;


    const form =
        getElement(
            "funeralForm"
        );


    if (form) {

        form.reset();

    }

    else {

        const nameInput =
            getFuneralNameInput();

        if (nameInput) {

            nameInput.value = "";

        }

    }

}


// ============================================================
// โหลดข้อมูลครั้งแรก
// ============================================================

async function loadFunerals() {

    funerals =
        await loadData(
            "funerals"
        );


    renderFunerals();

}


// ============================================================
// Real-time Firebase
// ============================================================

subscribeData(

    "funerals",

    (data) => {

        funerals = data;

        renderFunerals();

    }

);


// ============================================================
// Export สำหรับ HTML
// ============================================================

window.saveFuneral =
    saveFuneral;

window.editFuneral =
    editFuneral;

window.deleteFuneral =
    deleteFuneral;

window.removeFuneral =
    deleteFuneral;

window.resetFuneralForm =
    resetFuneralForm;

window.loadFunerals =
    loadFunerals;


// ============================================================
// เริ่มระบบ
// ============================================================

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadFunerals();

    }

);


console.log(
    "⚰️ Rongkhem Funeral System Firebase Ready"
);
