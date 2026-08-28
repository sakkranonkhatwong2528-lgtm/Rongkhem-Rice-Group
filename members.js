// ============================================================
// 👥 members.js
// ระบบจัดการสมาชิกกลุ่มข้าวสาร บ้านร่องเข็ม หมู่ที่ 6
// Firebase Firestore + รายชื่อสมาชิก
// ============================================================

import {
    saveData,
    loadData,
    updateData,
    deleteData,
    subscribeData
} from "./js/database.js";

const MEMBERS_COLLECTION = "members";

// ============================================================
// 📦 รายชื่อสมาชิกเริ่มต้น
// ============================================================

const DEFAULT_MEMBERS = [
    { memberId: "RK001", name: "นายจักร์กวัส ประพลรัตนัง", houseNo: "2 หมู่ 6" },
    { memberId: "RK002", name: "นางแสงเพียร วงค์ขัติย์", houseNo: "6 หมู่ 6" },
    { memberId: "RK003", name: "นายยนต์ ปิงเมือง", houseNo: "7 หมู่ 6" },
    { memberId: "RK004", name: "นางสมศรี ปิงเมือง", houseNo: "8 หมู่ 6" },
    { memberId: "RK005", name: "นายชัด ปิงเมือง", houseNo: "10 หมู่ 6" },
    { memberId: "RK006", name: "นายปิ๊ก ขัติย์วงศ์", houseNo: "12 หมู่ 6" },
    { memberId: "RK007", name: "นายยรรยง ผัดดี", houseNo: "14/1 หมู่ 6" },
    { memberId: "RK008", name: "นายหมื่น วังมูล", houseNo: "15 หมู่ 6" },
    { memberId: "RK009", name: "นายโกวัฒธฤทธิ์ ประพลรัตนัง", houseNo: "17 หมู่ 6" },
    { memberId: "RK010", name: "นายภาณุวัฒน์ บุญยา", houseNo: "20 หมู่ 6" },
    { memberId: "RK011", name: "นายสมอน ศรีเมือง", houseNo: "22 หมู่ 6" },
    { memberId: "RK012", name: "นายพรชัย ปัญใจ", houseNo: "29 หมู่ 6" },
    { memberId: "RK013", name: "นายชูชาติ จำปา", houseNo: "30 หมู่ 6" },
    { memberId: "RK014", name: "นางน้อย วิศรีใจ", houseNo: "31 หมู่ 6" },
    { memberId: "RK015", name: "นายอินทร์ ถิ่นลำปาง", houseNo: "32 หมู่ 6" },
    { memberId: "RK016", name: "นายคำตั๋น วังมูล", houseNo: "34 หมู่ 6" },
    { memberId: "RK017", name: "นางวิไลพร วังมูล", houseNo: "35 หมู่ 6" },
    { memberId: "RK018", name: "นายบุญ ไฝ่จิตต์", houseNo: "36 หมู่ 6" },
    { memberId: "RK019", name: "นายบุญช่วย เครือวัลย์", houseNo: "37 หมู่ 6" },
    { memberId: "RK020", name: "นายมา วังมูล", houseNo: "38 หมู่ 6" },
    { memberId: "RK021", name: "นายสมาน วังมูล", houseNo: "39 หมู่ 6" },
    { memberId: "RK022", name: "นายวัชร ถิ่นลำปาง", houseNo: "40 หมู่ 6" },
    { memberId: "RK023", name: "นางพิมพร ใฝ่ใจ", houseNo: "41 หมู่ 6" },
    { memberId: "RK024", name: "นางถวิล ใฝ่ใจ", houseNo: "42 หมู่ 6" },
    { memberId: "RK025", name: "นายบรรลัง ใฝ่ใจ", houseNo: "42/1 หมู่ 6" },
    { memberId: "RK026", name: "นายอิ่น จักจุ่ม", houseNo: "46 หมู่ 6" },
    { memberId: "RK027", name: "นางทองดี วงศ์ขัติย์", houseNo: "47 หมู่ 6" },
    { memberId: "RK028", name: "นายชุม ใฝ่ใจ", houseNo: "49 หมู่ 6" },
    { memberId: "RK029", name: "นางทองดี พลูคำ", houseNo: "50 หมู่ 6" },
    { memberId: "RK030", name: "นายผัด ทาแก้ว", houseNo: "51 หมู่ 6" },
    { memberId: "RK031", name: "นางสายทอง ชุ่มธิ", houseNo: "51/1 หมู่ 6" },
    { memberId: "RK032", name: "นายอดิศักดิ์ ขัติธิ", houseNo: "52 หมู่ 6" },
    { memberId: "RK033", name: "นายนพคุณ จอมภา", houseNo: "53 หมู่ 6" },
    { memberId: "RK034", name: "นายพิพัฒน์ ใฝ่ใจ", houseNo: "56 หมู่ 6" },
    { memberId: "RK035", name: "น.ส.เตือนธิวา ใฝ่ใจ", houseNo: "58 หมู่ 6" },
    { memberId: "RK036", name: "นางเหล็ง วิศรีใจ", houseNo: "60 หมู่ 6" },
    { memberId: "RK037", name: "นายบุญเสริม วิศรีใจ", houseNo: "60/1 หมู่ 6" },
    { memberId: "RK038", name: "น.ส.กรพิน กาวิน", houseNo: "61 หมู่ 6" },
    { memberId: "RK039", name: "นายบุญเรือง ถิ่นลำปาง", houseNo: "62 หมู่ 6" },
    { memberId: "RK040", name: "นางวิไล ถิ่นลำปาง", houseNo: "62/2 หมู่ 6" },
    { memberId: "RK041", name: "นายวิทยา งามจิต", houseNo: "64 หมู่ 6" },
    { memberId: "RK042", name: "นายแสวง ศรีไชยอินทร์", houseNo: "67 หมู่ 6" },
    { memberId: "RK043", name: "นางอำไพวิทย์ ปัญญา", houseNo: "68 หมู่ 6" },
    { memberId: "RK044", name: "นางเลข ใฝ่จิตร์", houseNo: "69 หมู่ 6" },
    { memberId: "RK045", name: "นายยก ถิ่นลำปาง", houseNo: "70 หมู่ 6" },
    { memberId: "RK046", name: "น.ส.ผ่องศรี ปัญใจ", houseNo: "72 หมู่ 6" },
    { memberId: "RK047", name: "น.ส.บรรณารักษ์ พลูคำ", houseNo: "73 หมู่ 6" },
    { memberId: "RK048", name: "นางสุดารัตน์ จักจุ่ม", houseNo: "73/1 หมู่ 6" },
    { memberId: "RK049", name: "นายธนวัฒน์ ปัญใจ", houseNo: "74 หมู่ 6" },
    { memberId: "RK050", name: "นายแก้วมูล ทินนา", houseNo: "75 หมู่ 6" },
    { memberId: "RK051", name: "นางหล้า ใฝ่ใจ", houseNo: "76 หมู่ 6" },
    { memberId: "RK052", name: "นายสุทัศน์ ปัญใจ", houseNo: "79/1 หมู่ 6" },
    { memberId: "RK053", name: "นายผล งามจิตร", houseNo: "82 หมู่ 6" },
    { memberId: "RK054", name: "นางเครือวัลย์ บุญธิวงค์", houseNo: "84 หมู่ 6" },
    { memberId: "RK055", name: "นางเป็ง ใฝ่จิต", houseNo: "85 หมู่ 6" },
    { memberId: "RK056", name: "นายพัสกร งามจิต", houseNo: "86 หมู่ 6" },
    { memberId: "RK057", name: "น.ส.วิภารัตน์ กันทะวัง", houseNo: "88 หมู่ 6" },
    { memberId: "RK058", name: "นางบุญปั๋น ทาทอง", houseNo: "89 หมู่ 6" },
    { memberId: "RK059", name: "นางฝน งามจิต", houseNo: "91 หมู่ 6" },
    { memberId: "RK060", name: "นายวุฒิภัทร เตชะวงค์", houseNo: "91/1 หมู่ 6" },

    // รายชื่อที่เหลือให้ต่อในส่วนที่ 2
];

// ============================================================
// 🧠 ตัวแปรข้อมูลสมาชิก
// ============================================================

let membersCache = [];

// ============================================================
// 🔢 เรียงลำดับสมาชิก
// ============================================================

function sortMembers(members = []) {

    return [...members].sort((a, b) => {

        return String(
            a.memberId || ""
        ).localeCompare(

            String(
                b.memberId || ""
            ),

            undefined,

            {
                numeric: true,
                sensitivity: "base"
            }

        );

    });

}

// ============================================================
// 📥 โหลดรายชื่อสมาชิก
// ============================================================

async function getRongkhemMembers() {

    try {

        const result =
            await loadData(
                MEMBERS_COLLECTION
            );

        const firebaseMembers =
            Array.isArray(result)
                ? result
                : [];

        if (
            firebaseMembers.length > 0
        ) {

            membersCache =
                sortMembers(
                    firebaseMembers.map(
                        member => ({

                            ...member,

                            houseNo:

                                member.houseNo ||

                                member.address ||

                                ""

                        })
                    )
                );

            return membersCache;

        }

        membersCache =
            sortMembers(
                DEFAULT_MEMBERS.map(
                    member => ({
                        ...member,

                        status:
                            "active"
                    })
                )
            );

        return membersCache;

    } catch (error) {

        console.error(
            "❌ โหลดสมาชิกไม่สำเร็จ:",
            error
        );

        membersCache =
            sortMembers(
                DEFAULT_MEMBERS
            );

        return membersCache;

    }

}

// ============================================================
// 🔎 ค้นหาสมาชิกจากรหัส
// ============================================================

function findMemberById(memberId) {

    return membersCache.find(
        member =>

            String(
                member.memberId
            ) === String(memberId)

    ) || null;

}

// ============================================================
// 🔎 ค้นหาสมาชิกจากชื่อ
// ============================================================

function findMemberByName(name) {

    const keyword =
        String(name || "")
            .trim()
            .toLowerCase();

    return membersCache.find(
        member =>

            String(
                member.name || ""
            )
            .toLowerCase()
            .includes(keyword)

    ) || null;

}

// ============================================================
// 🔎 ค้นหาจากรหัสหรือชื่อ
// ============================================================

function findMemberByIdOrName(keyword) {

    return (

        findMemberById(keyword)

        ||

        findMemberByName(keyword)

    );

}

// ============================================================
// 🆔 สร้างรหัสสมาชิกใหม่
// ============================================================

function generateMemberId() {

    let max = 0;

    membersCache.forEach(
        member => {

            const number =
                parseInt(

                    String(
                        member.memberId || ""
                    )
                    .replace(
                        "RK",
                        ""
                    ),

                    10

                );

            if (
                !Number.isNaN(number) &&
                number > max
            ) {

                max = number;

            }

        }
    );

    return (
        "RK" +
        String(
            max + 1
        ).padStart(
            3,
            "0"
        )
    );

}

// ============================================================
// ➕ เพิ่มสมาชิกใหม่
// ============================================================

async function addRongkhemMember(memberData) {

    try {

        const memberId =

            String(
                memberData.memberId ||
                generateMemberId()
            ).trim();

        const name =
            String(
                memberData.name || ""
            ).trim();

        const houseNo =
            String(
                memberData.houseNo ||
                memberData.address ||
                ""
            ).trim();

        const phone =
            String(
                memberData.phone || ""
            ).trim();

        if (!name) {

            throw new Error(
                "กรุณาระบุชื่อสมาชิก"
            );

        }

        if (
            membersCache.some(
                member =>

                    String(
                        member.memberId
                    ) === memberId
            )
        ) {

            throw new Error(
                "รหัสสมาชิกนี้มีอยู่แล้ว"
            );

        }

        const data = {

            memberId,

            name,

            houseNo,

            address:
                houseNo,

            phone,

            status:
                "active",

            createdAt:
                new Date()
                    .toISOString()

        };

        const result =
            await saveData(
                MEMBERS_COLLECTION,
                data
            );

        if (
            result &&
            result.success === false
        ) {

            throw new Error(
                result.error ||
                "บันทึกสมาชิกไม่สำเร็จ"
            );

        }

        await refreshMembers();

        return {

            success: true,

            memberId

        };

    } catch (error) {

        console.error(
            "❌ เพิ่มสมาชิกไม่สำเร็จ:",
            error
        );

        return {

            success: false,

            error:
                error.message

        };

    }

}
// ============================================================
// ✏️ แก้ไขข้อมูลสมาชิก
// ============================================================

async function updateRongkhemMember(memberId, memberData) {

    try {

        const member =
            findMemberById(memberId);

        if (!member) {

            throw new Error(
                "ไม่พบข้อมูลสมาชิก"
            );

        }

        const name =
            String(
                memberData.name ||
                member.name ||
                ""
            ).trim();

        const houseNo =
            String(
                memberData.houseNo ||
                memberData.address ||
                member.houseNo ||
                member.address ||
                ""
            ).trim();

        const phone =
            String(
                memberData.phone ||
                ""
            ).trim();

        if (!name) {

            throw new Error(
                "กรุณาระบุชื่อสมาชิก"
            );

        }

        const data = {

            ...member,

            name,

            houseNo,

            address:
                houseNo,

            phone,

            updatedAt:
                new Date()
                    .toISOString()

        };

        const documentId =

            member.firestoreId ||

            member.docId ||

            member.id;

        if (documentId) {

            const result =
                await updateData(
                    MEMBERS_COLLECTION,
                    documentId,
                    data
                );

            if (
                result &&
                result.success === false
            ) {

                throw new Error(
                    result.error ||
                    "แก้ไขสมาชิกไม่สำเร็จ"
                );

            }

        } else {

            // กรณีเป็นรายชื่อเริ่มต้น
            // ให้บันทึกเข้า Firebase เป็นสมาชิกใหม่

            const result =
                await saveData(
                    MEMBERS_COLLECTION,
                    data
                );

            if (
                result &&
                result.success === false
            ) {

                throw new Error(
                    result.error ||
                    "บันทึกข้อมูลสมาชิกไม่สำเร็จ"
                );

            }

        }

        await refreshMembers();

        return {
            success: true
        };

    } catch (error) {

        console.error(
            "❌ แก้ไขสมาชิกไม่สำเร็จ:",
            error
        );

        return {

            success: false,

            error:
                error.message

        };

    }

}

// ============================================================
// 🗑️ ลบสมาชิก
// ============================================================

async function deleteRongkhemMember(memberId) {

    try {

        const member =
            findMemberById(memberId);

        if (!member) {

            throw new Error(
                "ไม่พบข้อมูลสมาชิก"
            );

        }

        const documentId =

            member.firestoreId ||

            member.docId ||

            member.id;

        if (!documentId) {

            throw new Error(
                "สมาชิกคนนี้ยังไม่มีข้อมูลใน Firebase ไม่สามารถลบได้"
            );

        }

        const result =
            await deleteData(
                MEMBERS_COLLECTION,
                documentId
            );

        if (
            result &&
            result.success === false
        ) {

            throw new Error(
                result.error ||
                "ลบสมาชิกไม่สำเร็จ"
            );

        }

        await refreshMembers();

        return {
            success: true
        };

    } catch (error) {

        console.error(
            "❌ ลบสมาชิกไม่สำเร็จ:",
            error
        );

        return {

            success: false,

            error:
                error.message

        };

    }

}

// ============================================================
// 🔄 โหลดข้อมูลสมาชิกใหม่
// ============================================================

async function refreshMembers() {

    membersCache =
        await getRongkhemMembers();

    return membersCache;

}

// ============================================================
// ☁️ บันทึกรายชื่อเริ่มต้นเข้า Firebase
// ใช้ครั้งแรกเมื่อต้องการย้ายรายชื่อทั้งหมด
// ============================================================

async function initializeDefaultMembers() {

    try {

        const firebaseMembers =
            await loadData(
                MEMBERS_COLLECTION
            );

        if (
            Array.isArray(firebaseMembers) &&
            firebaseMembers.length > 0
        ) {

            membersCache =
                sortMembers(
                    firebaseMembers
                );

            return {

                success: true,

                message:
                    "มีข้อมูลสมาชิกอยู่แล้ว",

                count:
                    membersCache.length

            };

        }

        let successCount = 0;

        for (
            const member of DEFAULT_MEMBERS
        ) {

            const result =
                await saveData(
                    MEMBERS_COLLECTION,
                    {

                        ...member,

                        address:
                            member.houseNo,

                        phone:
                            "",

                        status:
                            "active",

                        createdAt:
                            new Date()
                                .toISOString()

                    }
                );

            if (
                !result ||
                result.success !== false
            ) {

                successCount++;

            }

        }

        await refreshMembers();

        return {

            success: true,

            message:
                "นำเข้ารายชื่อสมาชิกเรียบร้อย",

            count:
                successCount

        };

    } catch (error) {

        console.error(
            "❌ นำเข้ารายชื่อสมาชิกไม่สำเร็จ:",
            error
        );

        return {

            success: false,

            error:
                error.message

        };

    }

}

// ============================================================
// ⚡ ระบบติดตามข้อมูลสมาชิกแบบ Real-time
// ============================================================

function subscribeMembers(callback) {

    try {

        return subscribeData(
            MEMBERS_COLLECTION,

            members => {

                if (
                    Array.isArray(members) &&
                    members.length > 0
                ) {

                    membersCache =
                        sortMembers(
                            members.map(
                                member => ({

                                    ...member,

                                    houseNo:

                                        member.houseNo ||

                                        member.address ||

                                        ""

                                })
                            )
                        );

                } else {

                    membersCache =
                        sortMembers(
                            DEFAULT_MEMBERS.map(
                                member => ({

                                    ...member,

                                    status:
                                        "active"

                                })
                            )
                        );

                }

                if (
                    typeof callback ===
                    "function"
                ) {

                    callback(
                        membersCache
                    );

                }

            }

        );

    } catch (error) {

        console.error(
            "❌ Real-time สมาชิกไม่ทำงาน:",
            error
        );

        return null;

    }

}

// ============================================================
// 📊 สรุปจำนวนสมาชิก
// ============================================================

function getMembersSummary() {

    const total =
        membersCache.length;

    const active =
        membersCache.filter(
            member =>

                member.status !==
                "inactive"
        ).length;

    const inactive =
        total - active;

    return {

        total,

        active,

        inactive

    };

}

// ============================================================
// 🌐 เปิดใช้กับหน้า HTML
// ============================================================

window.getRongkhemMembers =
    getRongkhemMembers;

window.addRongkhemMember =
    addRongkhemMember;

window.updateRongkhemMember =
    updateRongkhemMember;

window.deleteRongkhemMember =
    deleteRongkhemMember;

window.findMemberById =
    findMemberById;

window.findMemberByName =
    findMemberByName;

window.findMemberByIdOrName =
    findMemberByIdOrName;

window.generateMemberId =
    generateMemberId;

window.initializeDefaultMembers =
    initializeDefaultMembers;

window.getMembersSummary =
    getMembersSummary;

// ============================================================
// 📤 Export สำหรับไฟล์ JavaScript อื่น
// ============================================================

export {

    getRongkhemMembers,

    addRongkhemMember,

    updateRongkhemMember,

    deleteRongkhemMember,

    findMemberById,

    findMemberByName,

    findMemberByIdOrName,

    generateMemberId,

    initializeDefaultMembers,

    subscribeMembers,

    refreshMembers,

    getMembersSummary

};

// ============================================================
// 🚀 เริ่มต้นข้อมูล
// ============================================================

refreshMembers()
    .then(
        () => {

            console.log(
                "👥 ระบบสมาชิกพร้อมใช้งาน:",
                membersCache.length,
                "ราย"
            );

        }
    )
    .catch(
        error => {

            console.error(
                "❌ เริ่มระบบสมาชิกไม่สำเร็จ:",
                error
            );

        }
    );
