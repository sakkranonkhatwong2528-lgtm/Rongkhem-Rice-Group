/* =========================================================
   🌾 RONGKHEM RICE GROUP
   members.js
   ระบบสมาชิก Firebase Firestore
   ใช้ข้อมูลร่วมกันทุกอุปกรณ์
========================================================= */

/*
  ⚠️ ส่วนรายชื่อเดิม

  ให้คงไว้ด้านบนของไฟล์เหมือนเดิม:

  window.DEFAULT_MEMBERS = [
      { id: "RK001", name: "...", address: "..." },
      ...
  ];

  ห้ามลบรายชื่อสมาชิกเดิม 176 รายการ
*/


import {
  saveData,
  loadData,
  updateData,
  deleteData,
  subscribeData
} from "./js/database.js";


/* =========================================================
   ⚙️ ตั้งค่าระบบ
========================================================= */

const MEMBERS_COLLECTION = "members";

let CURRENT_MEMBERS = [];


/* =========================================================
   🔢 เรียงลำดับสมาชิก
========================================================= */

function sortMembers(members) {

  return [...members].sort((a, b) => {

    const aId = String(
      a.memberId || a.id || ""
    );

    const bId = String(
      b.memberId || b.id || ""
    );

    return aId.localeCompare(
      bId,
      undefined,
      {
        numeric: true,
        sensitivity: "base"
      }
    );

  });

}


/* =========================================================
   📥 โหลดสมาชิกทั้งหมดจาก Firebase
========================================================= */

async function getRongkhemMembers() {

  try {

    const members = await loadData(
      MEMBERS_COLLECTION
    );


    CURRENT_MEMBERS =
      sortMembers(members);


    console.log(
      "📥 โหลดสมาชิกจาก Firebase:",
      CURRENT_MEMBERS.length,
      "ราย"
    );


    return CURRENT_MEMBERS;

  } catch (error) {

    console.error(
      "❌ โหลดสมาชิกไม่สำเร็จ:",
      error
    );


    return [];

  }

}


/* =========================================================
   🔄 ติดตามสมาชิกแบบ Real-time

   เมื่อมือถือเพิ่มสมาชิก
   คอมพิวเตอร์และแท็บเล็ตจะอัปเดตตาม
========================================================= */

function subscribeMembers(callback) {

  return subscribeData(

    MEMBERS_COLLECTION,

    function (members) {

      CURRENT_MEMBERS =
        sortMembers(members);


      console.log(
        "🔄 สมาชิกอัปเดต:",
        CURRENT_MEMBERS.length,
        "ราย"
      );


      if (
        typeof callback === "function"
      ) {

        callback(
          CURRENT_MEMBERS
        );

      }

    }

  );

}


/* =========================================================
   🔍 ค้นหาสมาชิก
========================================================= */

async function findMemberByIdOrName(
  searchQuery
) {

  if (!searchQuery) {

    return null;

  }


  const members =
    await getRongkhemMembers();


  const keyword =
    String(searchQuery)
      .trim()
      .toLowerCase();


  return members.find(member => {

    const memberId =
      String(
        member.memberId ||
        member.id ||
        ""
      ).toLowerCase();


    const name =
      String(
        member.name ||
        ""
      ).toLowerCase();


    const address =
      String(
        member.address ||
        member.houseNo ||
        ""
      ).toLowerCase();


    return (

      memberId.includes(keyword) ||

      name.includes(keyword) ||

      address === keyword

    );

  }) || null;

}


/* =========================================================
   🔍 ค้นหาสมาชิกด้วยรหัสสมาชิก
========================================================= */

async function findMemberById(
  memberId
) {

  if (!memberId) {

    return null;

  }


  const members =
    await getRongkhemMembers();


  return members.find(member =>

    String(
      member.memberId ||
      member.id ||
      ""
    ).toUpperCase() ===

    String(memberId)
      .toUpperCase()

  ) || null;

}


/* =========================================================
   🔍 ค้นหาสมาชิกด้วยชื่อ
========================================================= */

async function findMemberByName(
  name
) {

  if (!name) {

    return [];

  }


  const members =
    await getRongkhemMembers();


  const keyword =
    String(name)
      .trim()
      .toLowerCase();


  return members.filter(member =>

    String(
      member.name || ""
    )
      .toLowerCase()
      .includes(keyword)

  );

}


/* =========================================================
   ➕ สร้างรหัสสมาชิกใหม่
========================================================= */

async function generateMemberId() {

  const members =
    await getRongkhemMembers();


  let highestNumber = 0;


  members.forEach(member => {

    const memberId =
      String(
        member.memberId ||
        member.id ||
        ""
      );


    const match =
      memberId.match(/\d+/);


    if (match) {

      const number =
        Number(match[0]);


      if (
        number > highestNumber
      ) {

        highestNumber =
          number;

      }

    }

  });


  const nextNumber =
    highestNumber + 1;


  return (
    "RK" +
    String(nextNumber)
      .padStart(3, "0")
  );

}


/* =========================================================
   ➕ เพิ่มสมาชิกใหม่
========================================================= */

async function addRongkhemMember(
  memberData
) {

  try {

    if (!memberData) {

      throw new Error(
        "ไม่พบข้อมูลสมาชิก"
      );

    }


    if (
      !memberData.name ||
      String(memberData.name).trim() === ""
    ) {

      throw new Error(
        "กรุณาระบุชื่อสมาชิก"
      );

    }


    if (
      !memberData.address ||
      String(memberData.address).trim() === ""
    ) {

      throw new Error(
        "กรุณาระบุบ้านเลขที่"
      );

    }


    const members =
      await getRongkhemMembers();


    let memberId =
      memberData.memberId ||
      memberData.id;


    /*
      ถ้าไม่มีรหัส
      ให้สร้างอัตโนมัติ
    */

    if (!memberId) {

      memberId =
        await generateMemberId();

    }


    memberId =
      String(memberId)
        .trim()
        .toUpperCase();


    /*
      ตรวจสอบรหัสซ้ำ
    */

    const duplicate =
      members.find(member =>

        String(
          member.memberId ||
          member.id ||
          ""
        ).toUpperCase()
        ===
        memberId

      );


    if (duplicate) {

      throw new Error(
        "รหัสสมาชิก " +
        memberId +
        " มีอยู่แล้ว"
      );

    }


    /*
      ข้อมูลสมาชิกใหม่
    */

    const newMember = {

      memberId:
        memberId,

      /*
        รองรับระบบเก่า
      */

      id:
        memberId,

      name:
        String(
          memberData.name
        ).trim(),

      address:
        String(
          memberData.address
        ).trim(),

      status:
        memberData.status ||
        "active",

      phone:
        memberData.phone ||
        "",

      note:
        memberData.note ||
        ""

    };


    /*
      💾 บันทึกลง Firebase
    */

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
      "✅ เพิ่มสมาชิกสำเร็จ:",
      newMember
    );


    return {

      success:
        true,

      firestoreId:
        result.id,

      member: {

        firestoreId:
          result.id,

        ...newMember

      }

    };


  } catch (error) {

    console.error(
      "❌ เพิ่มสมาชิกไม่สำเร็จ:",
      error
    );


    return {

      success:
        false,

      error:
        error.message

    };

  }

}


/* =========================================================
   ✏️ แก้ไขสมาชิก

   รองรับ:
   updateRongkhemMember(firestoreId, data)
========================================================= */

async function updateRongkhemMember(
  firestoreId,
  memberData
) {

  try {

    if (!firestoreId) {

      throw new Error(
        "ไม่พบ Firestore ID ของสมาชิก"
      );

    }


    if (!memberData) {

      throw new Error(
        "ไม่พบข้อมูลที่ต้องการแก้ไข"
      );

    }


    const updateMemberData = {

      ...memberData

    };


    /*
      ป้องกันการเขียน
      Firestore ID ทับ
    */

    delete updateMemberData.firestoreId;


    const result =
      await updateData(

        MEMBERS_COLLECTION,

        firestoreId,

        updateMemberData

      );


    if (!result.success) {

      throw new Error(
        result.error ||
        "ไม่สามารถแก้ไขสมาชิกได้"
      );

    }


    console.log(
      "✏️ แก้ไขสมาชิกสำเร็จ:",
      firestoreId
    );


    return {

      success:
        true

    };


  } catch (error) {

    console.error(
      "❌ แก้ไขสมาชิกไม่สำเร็จ:",
      error
    );


    return {

      success:
        false,

      error:
        error.message

    };

  }

}


/* =========================================================
   🗑️ ลบสมาชิก
========================================================= */

async function deleteRongkhemMember(
  firestoreId
) {

  try {

    if (!firestoreId) {

      throw new Error(
        "ไม่พบ Firestore ID"
      );

    }


    const result =
      await deleteData(

        MEMBERS_COLLECTION,

        firestoreId

      );


    if (!result.success) {

      throw new Error(
        result.error ||
        "ไม่สามารถลบสมาชิกได้"
      );

    }


    console.log(
      "🗑️ ลบสมาชิกสำเร็จ:",
      firestoreId
    );


    return {

      success:
        true

    };


  } catch (error) {

    console.error(
      "❌ ลบสมาชิกไม่สำเร็จ:",
      error
    );


    return {

      success:
        false,

      error:
        error.message

    };

  }

}


/* =========================================================
   🌱 ย้ายสมาชิกเดิมขึ้น Firebase

   ใช้ครั้งแรกเท่านั้น

   จะตรวจสอบ memberId ทีละคน
   เพื่อป้องกันข้อมูลซ้ำ
========================================================= */

async function migrateDefaultMembers() {

  try {

    /*
      ตรวจสอบว่ามีรายชื่อเดิมหรือไม่
    */

    if (
      !Array.isArray(
        window.DEFAULT_MEMBERS
      )
    ) {

      throw new Error(
        "ไม่พบข้อมูลสมาชิกเดิม DEFAULT_MEMBERS"
      );

    }


    const firebaseMembers =
      await loadData(
        MEMBERS_COLLECTION
      );


    /*
      สร้างรายการ ID
      ที่มีอยู่แล้ว
    */

    const existingIds =
      new Set(

        firebaseMembers.map(
          member =>

            String(
              member.memberId ||
              member.id ||
              ""
            ).toUpperCase()

        )

      );


    let addedCount = 0;

    let skippedCount = 0;

    let errorCount = 0;


    /*
      นำสมาชิกขึ้น Firebase
    */

    for (
      const member
      of window.DEFAULT_MEMBERS
    ) {

      const memberId =
        String(
          member.memberId ||
          member.id ||
          ""
        ).toUpperCase();


      /*
        ถ้ามีแล้ว
        ไม่เพิ่มซ้ำ
      */

      if (
        existingIds.has(
          memberId
        )
      ) {

        skippedCount++;

        continue;

      }


      const result =
        await saveData(

          MEMBERS_COLLECTION,

          {

            memberId:
              memberId,

            id:
              memberId,

            name:
              member.name || "",

            address:
              member.address || "",

            status:
              member.status ||
              "active",

            phone:
              member.phone || "",

            note:
              member.note || ""

          }

        );


      if (result.success) {

        addedCount++;

      } else {

        errorCount++;

      }

    }


    console.log(
      "🌱 ย้ายข้อมูลสมาชิกเสร็จแล้ว"
    );

    console.log(
      "➕ เพิ่ม:",
      addedCount
    );

    console.log(
      "⏭️ มีอยู่แล้ว:",
      skippedCount
    );

    console.log(
      "❌ ผิดพลาด:",
      errorCount
    );


    return {

      success:
        true,

      added:
        addedCount,

      skipped:
        skippedCount,

      errors:
        errorCount

    };


  } catch (error) {

    console.error(
      "❌ ย้ายสมาชิกไม่สำเร็จ:",
      error
    );


    return {

      success:
        false,

      error:
        error.message

    };

  }

}


/* =========================================================
   🔄 โหลดข้อมูลใหม่
========================================================= */

async function refreshMembers() {

  return await getRongkhemMembers();

}


/* =========================================================
   🌍 เปิดใช้กับ HTML เดิม

   หน้าเว็บเดิมสามารถเรียก:
   getRongkhemMembers()
   addRongkhemMember()
   updateRongkhemMember()
   deleteRongkhemMember()
========================================================= */

window.getRongkhemMembers =
  getRongkhemMembers;

window.findMemberByIdOrName =
  findMemberByIdOrName;

window.findMemberById =
  findMemberById;

window.findMemberByName =
  findMemberByName;

window.generateMemberId =
  generateMemberId;

window.addRongkhemMember =
  addRongkhemMember;

window.updateRongkhemMember =
  updateRongkhemMember;

window.deleteRongkhemMember =
  deleteRongkhemMember;

window.subscribeMembers =
  subscribeMembers;

window.migrateDefaultMembers =
  migrateDefaultMembers;

window.refreshMembers =
  refreshMembers;


/* =========================================================
   🚀 เริ่มต้น
========================================================= */

console.log(
  "🌾 members.js เชื่อมต่อ Firebase Firestore เรียบร้อย"
);
