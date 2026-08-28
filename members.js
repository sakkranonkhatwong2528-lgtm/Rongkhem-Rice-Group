// ==========================================
// members.js
// ระบบจัดการสมาชิกกลุ่มข้าวสาร
// Rongkhem Rice Group
// ใช้ Firebase Firestore เป็นฐานข้อมูลหลัก
// ==========================================

import {

    saveData,
    loadDataWithFirestoreId,
    updateData,
    deleteData,
    subscribeData

} from "./database.js";


// ==========================================
// ชื่อ Collection
// ==========================================

export const MEMBERS_COLLECTION = "members";


// ==========================================
// ตัวแปรเก็บข้อมูลสมาชิกในหน้านี้
// ==========================================

let membersCache = [];


// ==========================================
// เรียงลำดับสมาชิก
// ==========================================

export function sortMembers(members = []) {

    return [...members].sort((a, b) => {

        const aId = String(
            a.memberId ||
            a.id ||
            ""
        );

        const bId = String(
            b.memberId ||
            b.id ||
            ""
        );


        const aNumber = parseInt(
            aId.replace(/\D/g, ""),
            10
        ) || 0;

        const bNumber = parseInt(
            bId.replace(/\D/g, ""),
            10
        ) || 0;


        return aNumber - bNumber;

    });

}


// ==========================================
// โหลดสมาชิกทั้งหมดจาก Firebase
// ==========================================

export async function getRongkhemMembers() {

    try {

        const list =
            await loadDataWithFirestoreId(
                MEMBERS_COLLECTION
            );


        membersCache =
            sortMembers(list);


        console.log(
            "👥 โหลดสมาชิก:",
            membersCache.length,
            "คน"
        );


        return membersCache;

    }

    catch (error) {

        console.error(
            "❌ โหลดข้อมูลสมาชิกไม่สำเร็จ:",
            error
        );


        return [];

    }

}


// ==========================================
// ค้นหาสมาชิกจากรหัสสมาชิก
// เช่น RK001
// ==========================================

export async function findMemberById(
    memberId
) {

    try {

        const members =
            await getRongkhemMembers();


        const keyword =
            String(memberId || "")
            .trim()
            .toUpperCase();


        return (

            members.find(
                member => {

                    const id =
                        String(

                            member.memberId ||
                            member.id ||
                            ""

                        )
                        .trim()
                        .toUpperCase();


                    return id === keyword;

                }
            )

            || null

        );

    }

    catch (error) {

        console.error(
            "❌ ค้นหาสมาชิกไม่สำเร็จ:",
            error
        );


        return null;

    }

}


// ==========================================
// สร้างรหัสสมาชิกอัตโนมัติ
// RK001, RK002, RK177 ...
// ==========================================

export async function generateMemberId() {

    const members =
        await getRongkhemMembers();


    let maxNumber = 0;


    members.forEach(
        member => {

            const memberId =
                String(

                    member.memberId ||
                    member.id ||
                    ""

                );


            const number =
                parseInt(
                    memberId.replace(/\D/g, ""),
                    10
                ) || 0;


            if (
                number > maxNumber
            ) {

                maxNumber =
                    number;

            }

        }
    );


    const nextNumber =
        maxNumber + 1;


    return (
        "RK" +
        String(nextNumber)
        .padStart(3, "0")
    );

}


// ==========================================
// เพิ่มสมาชิกใหม่
// ==========================================

export async function addRongkhemMember(
    memberData = {}
) {

    try {

        const name =
            String(
                memberData.name || ""
            )
            .trim();


        const address =
            String(

                memberData.address ||
                memberData.houseNo ||
                ""

            )
            .trim();


        if (!name) {

            throw new Error(
                "กรุณาระบุชื่อสมาชิก"
            );

        }


        if (!address) {

            throw new Error(
                "กรุณาระบุบ้านเลขที่"
            );

        }


        let memberId =
            String(
                memberData.memberId || ""
            )
            .trim()
            .toUpperCase();


        // ถ้าไม่ได้กรอกรหัส ให้สร้างให้อัตโนมัติ

        if (!memberId) {

            memberId =
                await generateMemberId();

        }


        // ตรวจสอบรหัสซ้ำ

        const existingMember =
            await findMemberById(
                memberId
            );


        if (existingMember) {

            throw new Error(
                "รหัสสมาชิก " +
                memberId +
                " มีอยู่แล้ว"
            );

        }


        const newMember = {

            // รหัสสมาชิกสำหรับใช้งานในระบบ
            memberId:

                memberId,


            // ชื่อสมาชิก
            name:

                name,


            // บ้านเลขที่
            address:

                address,


            houseNo:

                memberData.houseNo ||
                address,


            // เบอร์โทร
            phone:

                memberData.phone ||
                "",


            // จำนวนครั้งที่ส่ง
            sent:

                Number(
                    memberData.sent || 0
                ),


            // จำนวนครั้งที่ค้างส่ง
            pending:

                Number(
                    memberData.pending || 0
                ),


            // สถานะ
            status:

                memberData.status ||
                "pending",


            active:

                memberData.active !== false,

        };


        const result =
            await saveData(

                MEMBERS_COLLECTION,

                newMember

            );


        if (!result.success) {

            throw new Error(

                result.error ||
                "ไม่สามารถบันทึกสมาชิกได้"

            );

        }


        console.log(
            "✅ เพิ่มสมาชิก:",
            memberId,
            result.id
        );


        return {

            success: true,

            id:
                result.id,

            memberId:
                memberId

        };

    }

    catch (error) {

        console.error(
            "❌ เพิ่มสมาชิกไม่สำเร็จ:",
            error
        );


        return {

            success: false,

            error:

                error.message ||
                String(error)

        };

    }

}


// ==========================================
// แก้ไขข้อมูลสมาชิก
// ==========================================

export async function updateRongkhemMember(
    firestoreId,
    data = {}
) {

    try {

        if (!firestoreId) {

            throw new Error(
                "ไม่พบ Firebase Document ID"
            );

        }


        const cleanData = {

            ...data

        };


        // ป้องกันไม่ให้ firestoreId ถูกบันทึกทับลงฐานข้อมูล

        delete cleanData.firestoreId;


        // ถ้ามี memberId ให้แปลงเป็นตัวพิมพ์ใหญ่

        if (
            cleanData.memberId
        ) {

            cleanData.memberId =
                String(
                    cleanData.memberId
                )
                .trim()
                .toUpperCase();

        }


        const result =
            await updateData(

                MEMBERS_COLLECTION,

                firestoreId,

                cleanData

            );


        if (
            result.success
        ) {

            console.log(
                "✏️ แก้ไขสมาชิกสำเร็จ:",
                firestoreId
            );

        }


        return result;

    }

    catch (error) {

        console.error(
            "❌ แก้ไขสมาชิกไม่สำเร็จ:",
            error
        );


        return {

            success: false,

            error:

                error.message ||
                String(error)

        };

    }

}


// ==========================================
// ลบสมาชิก
// ==========================================

export async function deleteRongkhemMember(
    firestoreId
) {

    try {

        if (!firestoreId) {

            throw new Error(
                "ไม่พบ Firebase Document ID"
            );

        }


        const result =
            await deleteData(

                MEMBERS_COLLECTION,

                firestoreId

            );


        if (
            result.success
        ) {

            console.log(
                "🗑️ ลบสมาชิกสำเร็จ:",
                firestoreId
            );

        }


        return result;

    }

    catch (error) {

        console.error(
            "❌ ลบสมาชิกไม่สำเร็จ:",
            error
        );


        return {

            success: false,

            error:

                error.message ||
                String(error)

        };

    }

}


// ==========================================
// รีเซ็ตสถานะสมาชิกทั้งหมด
// เริ่มรอบใหม่
// ==========================================

export async function resetAllMembersStatus() {

    try {

        const members =
            await getRongkhemMembers();


        let successCount = 0;

        let failCount = 0;


        for (
            const member
            of members
        ) {

            if (
                !member.firestoreId
            ) {

                failCount++;

                continue;

            }


            const result =
                await updateRongkhemMember(

                    member.firestoreId,

                    {

                        status:
                            "pending",

                        sent:
                            0,

                        pending:
                            0

                    }

                );


            if (
                result.success
            ) {

                successCount++;

            }

            else {

                failCount++;

            }

        }


        return {

            success:

                failCount === 0,

            successCount:

                successCount,

            failCount:

                failCount

        };

    }

    catch (error) {

        console.error(
            "❌ รีเซ็ตรอบใหม่ไม่สำเร็จ:",
            error
        );


        return {

            success: false,

            error:

                error.message ||
                String(error)

        };

    }

}


// ==========================================
// Real-time สมาชิก
//
// ใช้เมื่อข้อมูลเปลี่ยนจาก
// มือถือ / คอม / แท็บเล็ต
// ==========================================

export function subscribeMembers(
    callback
) {

    return subscribeData(

        MEMBERS_COLLECTION,

        members => {

            membersCache =
                sortMembers(
                    members
                );


            callback(
                membersCache
            );

        }

    );

}


// ==========================================
// กู้คืนสมาชิกเก่าเข้า Firebase
//
// ใช้เฉพาะกรณีมีข้อมูลสมาชิกเก่า
// แล้วต้องการย้ายขึ้น Cloud
//
// ฟังก์ชันนี้จะไม่เพิ่มสมาชิกซ้ำ
// ==========================================

export async function restoreMembersToFirebase(
    oldMembers = []
) {

    try {

        if (

            !Array.isArray(
                oldMembers
            )

        ) {

            throw new Error(
                "รูปแบบข้อมูลสมาชิกไม่ถูกต้อง"
            );

        }


        const existingMembers =
            await getRongkhemMembers();


        const existingIds =
            new Set(

                existingMembers.map(
                    member =>

                        String(

                            member.memberId ||
                            member.id ||
                            ""

                        )
                        .trim()
                        .toUpperCase()

                )

            );


        let restoredCount = 0;

        let skippedCount = 0;


        for (
            const oldMember
            of oldMembers
        ) {

            const oldId =
                String(

                    oldMember.memberId ||
                    oldMember.id ||
                    ""

                )
                .trim()
                .toUpperCase();


            if (
                oldId &&
                existingIds.has(
                    oldId
                )
            ) {

                skippedCount++;

                continue;

            }


            const result =
                await addRongkhemMember({

                    memberId:
                        oldId,

                    name:

                        oldMember.name ||
                        oldMember.fullName ||
                        "",

                    address:

                        oldMember.address ||
                        oldMember.houseNo ||
                        "",

                    houseNo:

                        oldMember.houseNo ||
                        oldMember.address ||
                        "",

                    phone:

                        oldMember.phone ||
                        "",

                    sent:

                        Number(
                            oldMember.sent || 0
                        ),

                    pending:

                        Number(
                            oldMember.pending || 0
                        ),

                    status:

                        oldMember.status ||
                        "pending",

                    active:

                        oldMember.active !== false

                });


            if (
                result.success
            ) {

                restoredCount++;

            }

            else {

                console.error(

                    "กู้คืนสมาชิกไม่สำเร็จ:",

                    oldMember,

                    result.error

                );

            }

        }


        return {

            success: true,

            restoredCount:

                restoredCount,

            skippedCount:

                skippedCount

        };

    }

    catch (error) {

        console.error(
            "❌ กู้คืนสมาชิกไม่สำเร็จ:",
            error
        );


        return {

            success: false,

            error:

                error.message ||
                String(error)

        };

    }

}


// ==========================================
// ตรวจสอบสมาชิกค้างส่ง
// ==========================================

export function getPendingMembers(
    members = membersCache
) {

    return members.filter(

        member => {

            return (

                Number(
                    member.pending || 0
                ) > 0

            );

        }

    );

}


// ==========================================
// ดึงข้อมูลสรุปสมาชิก
// ==========================================

export function getMemberSummary(
    members = membersCache
) {

    const total =
        members.length;


    const sent =
        members.filter(

            member =>

                member.status ===
                "sent"

        ).length;


    const pending =
        total - sent;


    const overdue =
        members.filter(

            member =>

                Number(
                    member.pending || 0
                ) > 0

        ).length;


    return {

        total,

        sent,

        pending,

        overdue

    };

}


// ==========================================
// END
// ==========================================

console.log(
    "👥 members.js Ready"
);
