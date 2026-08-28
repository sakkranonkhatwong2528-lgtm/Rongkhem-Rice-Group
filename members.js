<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        รายชื่อสมาชิก - ระบบกลุ่มข้าวสาร บ้านร่องเข็ม หมู่ที่ 6
    </title>

    <script src="https://cdn.tailwindcss.com"></script>

    <link
        href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
    >

    <style>

        body {
            font-family: "Sarabun", sans-serif;
        }

        .loading-row {
            text-align: center;
            padding: 40px;
            color: #6b7280;
        }

    </style>

</head>


<body class="bg-amber-50 min-h-screen p-4 sm:p-6">

<div class="max-w-6xl mx-auto space-y-6">


    <!-- =====================================
         HEADER
    ====================================== -->

    <div
        class="
            bg-white
            rounded-2xl
            shadow-sm
            border
            border-amber-200
            p-5
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
        "
    >

        <div>

            <h1
                class="
                    text-2xl
                    font-bold
                    text-gray-800
                "
            >
                👥 รายชื่อสมาชิกกลุ่มข้าวสาร
            </h1>

            <p class="text-gray-500 text-sm mt-1">
                บ้านร่องเข็ม หมู่ที่ 6
            </p>

        </div>


        <div
            class="
                flex
                flex-wrap
                gap-2
            "
        >

            <button
                id="reloadButton"
                class="
                    px-4
                    py-2
                    rounded-lg
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    text-sm
                "
            >
                🔄 โหลดข้อมูลใหม่
            </button>


            <button
                id="resetButton"
                class="
                    px-4
                    py-2
                    rounded-lg
                    bg-rose-600
                    hover:bg-rose-700
                    text-white
                    text-sm
                "
            >
                🔄 เริ่มรอบใหม่
            </button>


            <a
                href="index.html"
                class="
                    px-4
                    py-2
                    rounded-lg
                    bg-gray-100
                    hover:bg-gray-200
                    text-gray-700
                    text-sm
                "
            >
                ← กลับหน้าหลัก
            </a>

        </div>

    </div>



    <!-- =====================================
         SUMMARY
    ====================================== -->

    <div
        class="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            gap-4
        "
    >

        <div
            class="
                bg-white
                rounded-xl
                p-5
                border
                border-amber-200
                shadow-sm
            "
        >

            <div class="text-sm text-gray-500">
                👥 สมาชิกทั้งหมด
            </div>

            <div
                id="totalCount"
                class="
                    text-3xl
                    font-bold
                    text-gray-800
                    mt-2
                "
            >
                0
            </div>

            <div class="text-xs text-gray-400">
                ครัวเรือน
            </div>

        </div>


        <div
            class="
                bg-white
                rounded-xl
                p-5
                border
                border-green-200
                shadow-sm
            "
        >

            <div class="text-sm text-green-600">
                🟢 ส่งแล้ว
            </div>

            <div
                id="sentCount"
                class="
                    text-3xl
                    font-bold
                    text-green-600
                    mt-2
                "
            >
                0
            </div>

            <div class="text-xs text-gray-400">
                คน
            </div>

        </div>


        <div
            class="
                bg-white
                rounded-xl
                p-5
                border
                border-red-200
                shadow-sm
            "
        >

            <div class="text-sm text-red-600">
                🔴 ยังไม่ส่ง
            </div>

            <div
                id="pendingCount"
                class="
                    text-3xl
                    font-bold
                    text-red-600
                    mt-2
                "
            >
                0
            </div>

            <div class="text-xs text-gray-400">
                คน
            </div>

        </div>


        <div
            class="
                bg-white
                rounded-xl
                p-5
                border
                border-orange-200
                shadow-sm
            "
        >

            <div class="text-sm text-orange-600">
                ⚠️ ค้างส่งสะสม
            </div>

            <div
                id="overdueCount"
                class="
                    text-3xl
                    font-bold
                    text-orange-600
                    mt-2
                "
            >
                0
            </div>

            <div class="text-xs text-gray-400">
                ครัวเรือน
            </div>

        </div>

    </div>



    <!-- =====================================
         ADD MEMBER
    ====================================== -->

    <div
        class="
            bg-white
            rounded-2xl
            shadow-sm
            border
            border-amber-200
            p-5
        "
    >

        <h2
            class="
                text-lg
                font-bold
                text-gray-800
                mb-4
            "
        >
            ➕ เพิ่มสมาชิกใหม่
        </h2>


        <form
            id="memberForm"
            class="
                grid
                grid-cols-1
                md:grid-cols-4
                gap-3
            "
        >

            <input
                id="memberId"
                type="text"
                placeholder="รหัส เช่น RK177 (เว้นว่างได้)"
                class="
                    border
                    rounded-lg
                    px-4
                    py-3
                    text-sm
                "
            >


            <input
                id="memberName"
                type="text"
                required
                placeholder="ชื่อ - นามสกุล"
                class="
                    border
                    rounded-lg
                    px-4
                    py-3
                    text-sm
                "
            >


            <input
                id="memberHouse"
                type="text"
                required
                placeholder="บ้านเลขที่"
                class="
                    border
                    rounded-lg
                    px-4
                    py-3
                    text-sm
                "
            >


            <button
                type="submit"
                class="
                    bg-amber-600
                    hover:bg-amber-700
                    text-white
                    rounded-lg
                    px-4
                    py-3
                    font-medium
                "
            >
                💾 เพิ่มสมาชิก
            </button>

        </form>

    </div>



    <!-- =====================================
         SEARCH / FILTER
    ====================================== -->

    <div
        class="
            bg-white
            rounded-xl
            border
            border-amber-200
            p-4
            flex
            flex-col
            md:flex-row
            gap-3
            md:items-center
            md:justify-between
        "
    >

        <input
            id="searchInput"
            type="text"
            placeholder="🔍 ค้นหาชื่อ รหัสสมาชิก หรือบ้านเลขที่..."
            class="
                border
                rounded-lg
                px-4
                py-2
                w-full
                md:max-w-md
            "
        >


        <div class="flex flex-wrap gap-2">

            <button
                class="
                    filter-button
                    px-4
                    py-2
                    rounded-lg
                    bg-amber-600
                    text-white
                    text-sm
                "
                data-filter="all"
            >
                ทั้งหมด
            </button>


            <button
                class="
                    filter-button
                    px-4
                    py-2
                    rounded-lg
                    bg-gray-100
                    text-gray-700
                    text-sm
                "
                data-filter="sent"
            >
                🟢 ส่งแล้ว
            </button>


            <button
                class="
                    filter-button
                    px-4
                    py-2
                    rounded-lg
                    bg-gray-100
                    text-gray-700
                    text-sm
                "
                data-filter="pending"
            >
                🔴 ยังไม่ส่ง
            </button>


            <button
                class="
                    filter-button
                    px-4
                    py-2
                    rounded-lg
                    bg-gray-100
                    text-gray-700
                    text-sm
                "
                data-filter="overdue"
            >
                ⚠️ ค้างส่ง
            </button>

        </div>

    </div>



    <!-- =====================================
         TABLE
    ====================================== -->

    <div
        class="
            bg-white
            rounded-2xl
            shadow-sm
            border
            border-amber-200
            overflow-hidden
        "
    >

        <div class="overflow-x-auto">

            <table
                class="
                    min-w-full
                    text-sm
                "
            >

                <thead
                    class="
                        bg-amber-100
                        text-gray-700
                    "
                >

                    <tr>

                        <th class="px-4 py-3 text-center">
                            #
                        </th>

                        <th class="px-4 py-3 text-left">
                            รหัสสมาชิก
                        </th>

                        <th class="px-4 py-3 text-left">
                            ชื่อ - นามสกุล
                        </th>

                        <th class="px-4 py-3 text-left">
                            บ้านเลขที่
                        </th>

                        <th class="px-4 py-3 text-center">
                            ส่ง
                        </th>

                        <th class="px-4 py-3 text-center">
                            ค้างส่ง
                        </th>

                        <th class="px-4 py-3 text-center">
                            สถานะ
                        </th>

                        <th class="px-4 py-3 text-center">
                            จัดการ
                        </th>

                    </tr>

                </thead>


                <tbody id="memberTableBody">

                    <tr>

                        <td
                            colspan="8"
                            class="
                                loading-row
                            "
                        >
                            🔄 กำลังโหลดข้อมูลสมาชิก...
                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

    </div>


</div>



<!-- =========================================
     JAVASCRIPT MODULE
========================================== -->

<script type="module">

import {

    getRongkhemMembers,
    addRongkhemMember,
    updateRongkhemMember,
    deleteRongkhemMember,
    resetAllMembersStatus,
    subscribeMembers,
    getMemberSummary

}

from "./members.js";



let members = [];

let currentFilter = "all";

let searchKeyword = "";

let unsubscribeMembers = null;



// ==========================================
// ป้องกัน XSS
// ==========================================

function escapeHtml(value) {

    return String(
        value ?? ""
    )

    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}



// ==========================================
// LOAD MEMBERS
// ==========================================

async function loadMembers() {

    const tbody =
        document.getElementById(
            "memberTableBody"
        );


    tbody.innerHTML = `

        <tr>

            <td
                colspan="8"
                class="loading-row"
            >

                🔄 กำลังโหลดข้อมูลจาก Firebase...

            </td>

        </tr>

    `;


    try {

        members =
            await getRongkhemMembers();


        render();

    }

    catch (error) {

        console.error(error);


        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="
                        text-center
                        py-10
                        text-red-600
                    "
                >

                    ❌ ไม่สามารถโหลดข้อมูลสมาชิกได้

                </td>

            </tr>

        `;

    }

}



// ==========================================
// FILTER MEMBERS
// ==========================================

function getFilteredMembers() {

    return members.filter(

        member => {

            const keyword =
                searchKeyword
                .trim()
                .toLowerCase();


            const searchable =
                [

                    member.memberId,
                    member.name,
                    member.address,
                    member.houseNo

                ]

                .join(" ")

                .toLowerCase();


            const matchesSearch =
                !keyword ||

                searchable.includes(
                    keyword
                );


            if (
                !matchesSearch
            ) {

                return false;

            }


            if (
                currentFilter ===
                "sent"
            ) {

                return (
                    member.status ===
                    "sent"
                );

            }


            if (
                currentFilter ===
                "pending"
            ) {

                return (
                    member.status !==
                    "sent"
                );

            }


            if (
                currentFilter ===
                "overdue"
            ) {

                return Number(
                    member.pending || 0
                ) > 0;

            }


            return true;

        }

    );

}



// ==========================================
// RENDER SUMMARY + TABLE
// ==========================================

function render() {

    const summary =
        getMemberSummary(
            members
        );


    document.getElementById(
        "totalCount"
    ).textContent =
        summary.total;


    document.getElementById(
        "sentCount"
    ).textContent =
        summary.sent;


    document.getElementById(
        "pendingCount"
    ).textContent =
        summary.pending;


    document.getElementById(
        "overdueCount"
    ).textContent =
        summary.overdue;


    renderTable();

}



// ==========================================
// RENDER TABLE
// ==========================================

function renderTable() {

    const tbody =
        document.getElementById(
            "memberTableBody"
        );


    const filtered =
        getFilteredMembers();


    if (
        filtered.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="
                        text-center
                        py-10
                        text-gray-400
                    "
                >

                    ไม่พบข้อมูลสมาชิก

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        filtered.map(

            (
                member,
                index
            ) => {

                const isSent =
                    member.status ===
                    "sent";


                const pendingCount =
                    Number(
                        member.pending || 0
                    );


                return `

                    <tr
                        class="
                            border-t
                            hover:bg-amber-50
                        "
                    >

                        <td
                            class="
                                px-4
                                py-3
                                text-center
                            "
                        >

                            ${index + 1}

                        </td>


                        <td
                            class="
                                px-4
                                py-3
                                font-mono
                                font-semibold
                            "
                        >

                            ${escapeHtml(
                                member.memberId ||
                                "-"
                            )}

                        </td>


                        <td
                            class="
                                px-4
                                py-3
                            "
                        >

                            ${escapeHtml(
                                member.name ||
                                "-"
                            )}

                        </td>


                        <td
                            class="
                                px-4
                                py-3
                            "
                        >

                            ${escapeHtml(

                                member.houseNo ||
                                member.address ||
                                "-"

                            )}

                        </td>


                        <td
                            class="
                                px-4
                                py-3
                                text-center
                            "
                        >

                            ${Number(
                                member.sent || 0
                            )}

                        </td>


                        <td
                            class="
                                px-4
                                py-3
                                text-center
                            "
                        >

                            ${pendingCount}

                        </td>


                        <td
                            class="
                                px-4
                                py-3
                                text-center
                            "
                        >

                            <button

                                class="
                                    toggle-status
                                    px-3
                                    py-1
                                    rounded-full
                                    text-xs
                                    font-medium
                                    ${

                                        isSent

                                        ?

                                        "bg-green-100 text-green-700"

                                        :

                                        "bg-red-100 text-red-700"

                                    }
                                "

                                data-id="${member.firestoreId}"

                            >

                                ${

                                    isSent

                                    ?

                                    "🟢 ส่งแล้ว"

                                    :

                                    "🔴 ยังไม่ส่ง"

                                }

                            </button>

                        </td>


                        <td
                            class="
                                px-4
                                py-3
                                text-center
                                whitespace-nowrap
                            "
                        >

                            <button

                                class="
                                    edit-member
                                    text-blue-600
                                    hover:text-blue-800
                                    mr-2
                                "

                                data-id="${member.firestoreId}"

                            >

                                ✏️ แก้ไข

                            </button>


                            <button

                                class="
                                    delete-member
                                    text-red-600
                                    hover:text-red-800
                                "

                                data-id="${member.firestoreId}"

                            >

                                🗑️ ลบ

                            </button>

                        </td>

                    </tr>

                `;

            }

        )

        .join("");

}



// ==========================================
// ADD MEMBER
// ==========================================

document
.getElementById(
    "memberForm"
)

.addEventListener(

    "submit",

    async event => {

        event.preventDefault();


        const memberId =
            document
            .getElementById(
                "memberId"
            )
            .value
            .trim();


        const name =
            document
            .getElementById(
                "memberName"
            )
            .value
            .trim();


        const houseNo =
            document
            .getElementById(
                "memberHouse"
            )
            .value
            .trim();


        const result =
            await addRongkhemMember({

                memberId,
                name,
                houseNo,
                address:
                    houseNo

            });


        if (
            result.success
        ) {

            alert(
                "✅ เพิ่มสมาชิกเรียบร้อย"
            );


            event.target.reset();

        }

        else {

            alert(

                "❌ เพิ่มสมาชิกไม่สำเร็จ\n" +

                result.error

            );

        }

    }

);



// ==========================================
// TABLE CLICK
// ==========================================

document
.getElementById(
    "memberTableBody"
)

.addEventListener(

    "click",

    async event => {

        const button =
            event.target.closest(
                "button"
            );


        if (
            !button
        ) return;


        const firestoreId =
            button.dataset.id;


        if (
            !firestoreId
        ) return;


        const member =
            members.find(

                item =>
                    item.firestoreId ===
                    firestoreId

            );


        if (
            !member
        ) return;



        // ----------------------------
        // เปลี่ยนสถานะ
        // ----------------------------

        if (

            button.classList.contains(
                "toggle-status"
            )

        ) {

            const newStatus =

                member.status ===
                "sent"

                ?

                "pending"

                :

                "sent";


            const result =
                await updateRongkhemMember(

                    firestoreId,

                    {

                        status:
                            newStatus

                    }

                );


            if (
                !result.success
            ) {

                alert(
                    "❌ เปลี่ยนสถานะไม่สำเร็จ"
                );

            }

        }



        // ----------------------------
        // แก้ไขสมาชิก
        // ----------------------------

        if (

            button.classList.contains(
                "edit-member"
            )

        ) {

            const newName =
                prompt(

                    "ชื่อ - นามสกุล",

                    member.name || ""

                );


            if (
                newName === null
            ) return;


            const newHouse =
                prompt(

                    "บ้านเลขที่",

                    member.houseNo ||
                    member.address ||
                    ""

                );


            if (
                newHouse === null
            ) return;


            const result =
                await updateRongkhemMember(

                    firestoreId,

                    {

                        name:
                            newName.trim(),

                        houseNo:
                            newHouse.trim(),

                        address:
                            newHouse.trim()

                    }

                );


            if (
                result.success
            ) {

                alert(
                    "✅ แก้ไขข้อมูลเรียบร้อย"
                );

            }

            else {

                alert(
                    "❌ แก้ไขข้อมูลไม่สำเร็จ"
                );

            }

        }



        // ----------------------------
        // ลบสมาชิก
        // ----------------------------

        if (

            button.classList.contains(
                "delete-member"
            )

        ) {

            const confirmDelete =
                confirm(

                    "ยืนยันลบสมาชิก\n\n" +

                    (
                        member.name ||
                        ""
                    )

                );


            if (
                !confirmDelete
            ) return;


            const result =
                await deleteRongkhemMember(
                    firestoreId
                );


            if (
                result.success
            ) {

                alert(
                    "🗑️ ลบสมาชิกเรียบร้อย"
                );

            }

            else {

                alert(
                    "❌ ลบสมาชิกไม่สำเร็จ"
                );

            }

        }

    }

);



// ==========================================
// SEARCH
// ==========================================

document
.getElementById(
    "searchInput"
)

.addEventListener(

    "input",

    event => {

        searchKeyword =
            event.target.value;


        renderTable();

    }

);



// ==========================================
// FILTER
// ==========================================

document
.querySelectorAll(
    ".filter-button"
)

.forEach(

    button => {

        button.addEventListener(

            "click",

            () => {

                currentFilter =
                    button.dataset.filter;


                document
                .querySelectorAll(
                    ".filter-button"
                )

                .forEach(

                    item => {

                        item.className =
                            "filter-button px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm";

                    }

                );


                if (
                    currentFilter ===
                    "all"
                ) {

                    button.className =
                        "filter-button px-4 py-2 rounded-lg bg-amber-600 text-white text-sm";

                }

                else if (
                    currentFilter ===
                    "sent"
                ) {

                    button.className =
                        "filter-button px-4 py-2 rounded-lg bg-green-600 text-white text-sm";

                }

                else if (
                    currentFilter ===
                    "pending"
                ) {

                    button.className =
                        "filter-button px-4 py-2 rounded-lg bg-red-600 text-white text-sm";

                }

                else {

                    button.className =
                        "filter-button px-4 py-2 rounded-lg bg-orange-600 text-white text-sm";

                }


                renderTable();

            }

        );

    }

);



// ==========================================
// RELOAD
// ==========================================

document
.getElementById(
    "reloadButton"
)

.addEventListener(

    "click",

    async () => {

        await loadMembers();

        alert(
            "🔄 โหลดข้อมูลล่าสุดแล้ว"
        );

    }

);



// ==========================================
// RESET ALL
// ==========================================

document
.getElementById(
    "resetButton"
)

.addEventListener(

    "click",

    async () => {

        const confirmed =
            confirm(

                "⚠️ ยืนยันเริ่มรอบใหม่?\n\n" +

                "สถานะสมาชิกทั้งหมดจะถูกรีเซ็ต"

            );


        if (
            !confirmed
        ) return;


        const result =
            await resetAllMembersStatus();


        if (
            result.success
        ) {

            alert(

                "✅ เริ่มรอบใหม่เรียบร้อย\n" +

                "อัปเดต " +

                result.successCount +

                " รายการ"

            );

        }

        else {

            alert(
                "❌ รีเซ็ตข้อมูลไม่สำเร็จ"
            );

        }

    }

);



// ==========================================
// REALTIME FIREBASE
// ==========================================

function startRealtime() {

    if (
        unsubscribeMembers
    ) {

        unsubscribeMembers();

    }


    unsubscribeMembers =
        subscribeMembers(

            updatedMembers => {

                members =
                    updatedMembers;


                render();

            }

        );

}



// ==========================================
// START SYSTEM
// ==========================================

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await loadMembers();

        startRealtime();

    }

);



// ==========================================
// CLEANUP
// ==========================================

window.addEventListener(

    "beforeunload",

    () => {

        if (
            unsubscribeMembers
        ) {

            unsubscribeMembers();

        }

    }

);

</script>


</body>
</html>
/* =========================================================
   EXPORT FUNCTIONS
   สำหรับ members.html และ receive.js
========================================================= */

export {
  getRongkhemMembers,
  findMemberByIdOrName,
  findMemberById,
  findMemberByName,
  generateMemberId,
  addRongkhemMember,
  updateRongkhemMember,
  deleteRongkhemMember,
  migrateDefaultMembers,
  refreshMembers,
  subscribeMembers
};
