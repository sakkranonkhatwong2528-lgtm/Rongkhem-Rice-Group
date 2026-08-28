/* =========================================================
   🌾 RONGKHEM RICE GROUP
   members.js
   รายชื่อสมาชิก 176 ราย + ระบบจัดการหลังบ้าน
========================================================= */

import {
  saveData,
  loadData,
  updateData,
  deleteData
} from "./database.js";

const MEMBERS_COLLECTION = "members";

/* =========================================================
   รายชื่อสมาชิกเดิม
========================================================= */

const RAW_MEMBERS = `
RK001|นายจักร์กวัส ประพลรัตนัง|2 หมู่ 6
RK002|นางแสงเพียร วงค์ขัติย์|6 หมู่ 6
RK003|นายยนต์ ปิงเมือง|7 หมู่ 6
RK004|นางสมศรี ปิงเมือง|8 หมู่ 6
RK005|นายชัด ปิงเมือง|10 หมู่ 6
RK006|นายปิ๊ก ขัติย์วงศ์|12 หมู่ 6
RK007|นายยรรยง ผัดดี|14/1 หมู่ 6
RK008|นายหมื่น วังมูล|15 หมู่ 6
RK009|นายโกวัฒธฤทธิ์ ประพลรัตนัง|17 หมู่ 6
RK010|นายภาณุวัฒน์ บุญยา|20 หมู่ 6
RK011|นายสมอน ศรีเมือง|22 หมู่ 6
RK012|นายพรชัย ปัญใจ|29 หมู่ 6
RK013|นายชูชาติ จำปา|30 หมู่ 6
RK014|นางน้อย วิศรีใจ|31 หมู่ 6
RK015|นายอินทร์ ถิ่นลำปาง|32 หมู่ 6
RK016|นายคำตั๋น วังมูล|34 หมู่ 6
RK017|นางวิไลพร วังมูล|35 หมู่ 6
RK018|นายบุญ ไฝ่จิตต์|36 หมู่ 6
RK019|นายบุญช่วย เครือวัลย์|37 หมู่ 6
RK020|นายมา วังมูล|38 หมู่ 6
RK021|นายสมาน วังมูล|39 หมู่ 6
RK022|นายวัชร ถิ่นลำปาง|40 หมู่ 6
RK023|นางพิมพร ใฝ่ใจ|41 หมู่ 6
RK024|นางถวิล ใฝ่ใจ|42 หมู่ 6
RK025|นายบรรลัง ใฝ่ใจ|42/1 หมู่ 6
RK026|นายอิ่น จักจุ่ม|46 หมู่ 6
RK027|นางทองดี วงศ์ขัติย์|47 หมู่ 6
RK028|นายชุม ใฝ่ใจ|49 หมู่ 6
RK029|นางทองดี พลูคำ|50 หมู่ 6
RK030|นายผัด ทาแก้ว|51 หมู่ 6
RK031|นางสายทอง ชุ่มธิ|51/1 หมู่ 6
RK032|นายอดิศักดิ์ ขัติธิ|52 หมู่ 6
RK033|นายนพคุณ จอมภา|53 หมู่ 6
RK034|นายพิพัฒน์ ใฝ่ใจ|56 หมู่ 6
RK035|น.ส.เตือนธิวา ใฝ่ใจ|58 หมู่ 6
RK036|นางเหล็ง วิศรีใจ|60 หมู่ 6
RK037|นายบุญเสริม วิศรีใจ|60/1 หมู่ 6
RK038|น.ส.กรพิน กาวิน|61 หมู่ 6
RK039|นายบุญเรือง ถิ่นลำปาง|62 หมู่ 6
RK040|นางวิไล ถิ่นลำปาง|62/2 หมู่ 6
RK041|นายวิทยา งามจิต|64 หมู่ 6
RK042|นายแสวง ศรีไชยอินทร์|67 หมู่ 6
RK043|นางอำไพวิทย์ ปัญญา|68 หมู่ 6
RK044|นางเลข ใฝ่จิตร์|69 หมู่ 6
RK045|นายยก ถิ่นลำปาง|70 หมู่ 6
RK046|น.ส.ผ่องศรี ปัญใจ|72 หมู่ 6
RK047|น.ส.บรรณารักษ์ พลูคำ|73 หมู่ 6
RK048|นางสุดารัตน์ จักจุ่ม|73/1 หมู่ 6
RK049|นายธนวัฒน์ ปัญใจ|74 หมู่ 6
RK050|นายแก้วมูล ทินนา|75 หมู่ 6
RK051|นางหล้า ใฝ่ใจ|76 หมู่ 6
RK052|นายสุทัศน์ ปัญใจ|79/1 หมู่ 6
RK053|นายผล งามจิตร|82 หมู่ 6
RK054|นางเครือวัลย์ บุญธิวงค์|84 หมู่ 6
RK055|นางเป็ง ใฝ่จิต|85 หมู่ 6
RK056|นายพัสกร งามจิต|86 หมู่ 6
RK057|น.ส.วิภารัตน์ กันทะวัง|88 หมู่ 6
RK058|นางบุญปั๋น ทาทอง|89 หมู่ 6
RK059|นางฝน งามจิต|91 หมู่ 6
RK060|นายวุฒิภัทร เตชะวงค์|91/1 หมู่ 6
RK061|นายนวล ศรีเมือง|93 หมู่ 6
RK062|นายทิน วิศรีใจ|96 หมู่ 6
RK063|นายธีระพันธ์ ถิ่นลำปาง|96/1 หมู่ 6
RK064|นายเสาร์แก้ว คิดอ่าน|98 หมู่ 6
RK065|นายผัด เครือนวล|100 หมู่ 6
RK066|นายปัน ผัดดี|101 หมู่ 6
RK067|นายลักษ์ คำวงษา|103 หมู่ 6
RK068|นายไหล่ ศรีเมือง|104 หมู่ 6
RK069|นายพิชัย ปัญใจ|105 หมู่ 6
RK070|นางจันทร์เพ็ญ ใฝ่ใจ|106 หมู่ 6
RK071|นายสรชัย ใฝ่ใจ|106/1 หมู่ 6
RK072|นายวรวรรธน์ ลำพูน|109 หมู่ 6
RK073|นางป้อ ใฝ่ใจ|111 หมู่ 6
RK074|นางอ่อน จักจุ่ม|112 หมู่ 6
RK075|นายยนต์ บุญธิวงค์|112/1 หมู่ 6
RK076|นางขันคำ จันทวงศ์|113 หมู่ 6
RK077|นายต่วน ทาทอง|114 หมู่ 6
RK078|นายธวัชชัย บุญเก่ง|116 หมู่ 6
RK079|นายผล วิศรีใจ|117 หมู่ 6
RK080|นางประมวลศรี ถิ่นลำปาง|80 หมู่ 6
RK081|นางจันทร์ทิพย์ ถิ่นลำปาง|118 หมู่ 6
RK082|นายอัครวัฒน์ วริพัฒผัดดี|119 หมู่ 6
RK083|นายสุพนธ์ นาแพร่|121 หมู่ 6
RK084|นายบุญศรี ศรีคำ|125 หมู่ 6
RK085|นางหวิง นามวงค์|126 หมู่ 6
RK086|นายกิตติศักดิ์ นามจิต|130 หมู่ 6
RK087|นายสุนิตย์ ไข่หนู|130/1 หมู่ 6
RK088|นางวิไล ใจชื่น|131 หมู่ 6
RK089|นายนิกร งามจิต|132 หมู่ 6
RK090|นายประสิทธิ์ วงค์ขัติย์|136 หมู่ 6
RK091|นายเม็ด งามจิต|137 หมู่ 6
RK092|นายส่ง ปิงเมือง|138 หมู่ 6
RK093|นายบุญศักดิ์ ลำพูน|139 หมู่ 6
RK094|นายวีระ นามจิตต์|140 หมู่ 6
RK095|นายสิงห์ธนู วงค์ขัติย์|141 หมู่ 6
RK096|นายสุทัศน์ ตุ่นคำ|142 หมู่ 6
RK097|นายเขียน ศรีเมือง|143 หมู่ 6
RK098|นางลาวัลย์ ปันใจ|144 หมู่ 6
RK099|นายบุญธรรม ศรีเมือง|145 หมู่ 6
RK100|นางทับ บุญรมย์|147 หมู่ 6
RK101|น.ส.เนียม ศรีเมือง|148 หมู่ 6
RK102|น.ส.สุทัตตา พลูคำ|148/1 หมู่ 6
RK103|นายผล ไชยยศ|149 หมู่ 6
RK104|นายศักดิ์ จันทร์มูล|151/1 หมู่ 6
RK105|น.ส.นิติการณ์ จันทร์มูล|152 หมู่ 6
RK106|นางสายใจ ธรรมสาร|153 หมู่ 6
RK107|นายปัญญา เขียวนาค|153/1 หมู่ 6
RK108|นายเกียรติศักดิ์ จันทร์มูล|154/1 หมู่ 6
RK109|นายจำรัส ปัญใจ|155 หมู่ 6
RK110|นางศรีอร ใฝ่ใจ|157 หมู่ 6
RK111|นางยวงคำ ถิ่นลำปาง|159 หมู่ 6
RK112|นายวิเชียร ถิ่นลำปาง|159/1 หมู่ 6
RK113|น.ส.ยุพา ใจดี|160 หมู่ 6
RK114|นายเกียรติศักดิ์ พลูคำ|162 หมู่ 6
RK115|น.ส.น้อย บุญธิวงค์|162/1 หมู่ 6
RK116|น.ส.พวงผกา จันทร์มูล|163 หมู่ 6
RK117|นายปริญญา ยานะถนอม|164 หมู่ 6
RK118|นางสุพรรณ์ เรือนมูล|165 หมู่ 6
RK119|นางคำหมาย สมคิด|166 หมู่ 6
RK120|นางอาลิษา กอเตอะ|167 หมู่ 6
RK121|นางวิภาวดี ถิ่นลำปาง|168 หมู่ 6
RK122|นายศรีนวล วงค์ขัติย์|169 หมู่ 6
RK123|น.ส.สุภาวดี วังมูล|169/1 หมู่ 6
RK124|น.ส.ทองสุข ค้านาค|174 หมู่ 6
RK125|นายสม ขัติย์วงศ์|177 หมู่ 6
RK126|นายสงัด ศรีไชยอินทร์|178 หมู่ 6
RK127|นายมิตร ผัดดี|179 หมู่ 6
RK128|นางศรีลา งามจิต|181 หมู่ 6
RK129|นายธวัชชัย พลูคำ|182 หมู่ 6
RK130|นายนิยม ละเอียด|184 หมู่ 6
RK131|นางแสงคล้าย นามจิต|186 หมู่ 6
RK132|นายสุนทร ปิงเมือง|188 หมู่ 6
RK133|นายชุมพล ใฝ่ใจ|189 หมู่ 6
RK134|นางเหลี่ยม สมศรี|192 หมู่ 6
RK135|นางสมศรี สัตย์สม|193 หมู่ 6
RK136|นางจุฑามาศ งามจิต|195 หมู่ 6
RK137|นางยุพา กิ่งก้าน|199 หมู่ 6
RK138|นายบัว ศรีเมือง|201 หมู่ 6
RK139|นายอิ่น ฉลาดการ|204 หมู่ 6
RK140|นางเพ็ญ อิ่นทอง|205 หมู่ 6
RK141|นางพรศรี ใฝ่ใจ|206 หมู่ 6
RK142|นายประจักร งานดี|213 หมู่ 6
RK143|นายวัชร จอมภา|214 หมู่ 6
RK144|น.ส.อำภา งามจิต|222 หมู่ 6
RK145|นายบุญช่วย จำปา|223 หมู่ 6
RK146|นายบุญธรรม สมคิด|226 หมู่ 6
RK147|นางวาสนา เต|232 หมู่ 6
RK148|นายภาณุพงศ์ ผัดดี|236 หมู่ 6
RK149|นายเสมียน ศรีเมือง|237 หมู่ 6
RK150|นายสง่า จันทร์มูล|238 หมู่ 6
RK151|นายภาณุพงศ์ ใฝ่ใจ|239 หมู่ 6
RK152|นายสมบูรณ์ ปิงเมือง|243 หมู่ 6
RK153|นางนิตยา ใฝ่จิตต์|245 หมู่ 6
RK154|นางจอมศรี นามจิต|247 หมู่ 6
RK155|นายชิษณุพงษ์ ฟองทา|274 หมู่ 6
RK156|นายอริยพล ขัติย์วงศ์|275 หมู่ 6
RK157|นายศุภลัก สุพยน|278 หมู่ 6
RK158|น.ส.ศิริลภัศ คำวงษา|281 หมู่ 6
RK159|นายเกียรติพงษ์ ศักดิ์สูง|282 หมู่ 6
RK160|น.ส.ไพลิน ใจชื่น|287 หมู่ 6
RK161|นายพิชัย ใจดี|288 หมู่ 6
RK162|นางปานหทัย สุวรรณรัตน์|302 หมู่ 6
RK163|นายปรีชา ผัดดี|308 หมู่ 6
RK164|นายจิติพันธ์ จำปา|309 หมู่ 6
RK165|นายนพดล นามวงค์|310 หมู่ 6
RK166|นายสงวน จันทร์มูล|316 หมู่ 6
RK167|นางพร พลูคำ|317 หมู่ 6
RK168|นายทวน ทาฤทธิ์|325 หมู่ 6
RK169|น.ส.ถนิตา พัฒนกรวณิช|329 หมู่ 6
RK170|นายสนธยา สารเชื้อ|330 หมู่ 6
RK171|นายยงหยัด พลูคำ|331 หมู่ 6
RK172|น.ส.อรพินฑ์ เครือวัลย์|333 หมู่ 6
RK173|นายธนารินทร์ ทินนา|336 หมู่ 6
RK174|นางวาสนา ศรีไชยอินทร์|340 หมู่ 6
RK175|นางหล้า วงค์ขัติย์|348 หมู่ 6
RK176|นางญาฐิกา ถิ่นลำปาง|365 หมู่ 6
`;

const DEFAULT_MEMBERS = RAW_MEMBERS
  .trim()
  .split("\n")
  .map(line => {
    const [id, name, address] = line.split("|");

    return {
      id: id.trim(),
      memberId: id.trim(),
      name: name.trim(),
      address: address.trim(),
      houseNo: address.trim(),
      phone: "",
      status: "pending",
      pending: 0,
      sent: 0
    };
  });


/* =========================================================
   จัดเรียงสมาชิก
========================================================= */

function sortMembers(list = []) {

  return [...list].sort((a, b) => {

    return String(a.memberId || a.id || "")
      .localeCompare(
        String(b.memberId || b.id || ""),
        undefined,
        {
          numeric: true,
          sensitivity: "base"
        }
      );

  });

}


/* =========================================================
   โหลดสมาชิก

   ถ้า Firebase ยังไม่มีข้อมูล
   ให้ใช้รายชื่อสำรอง 176 คนทันที
========================================================= */

async function getRongkhemMembers() {

  try {

    const firebaseMembers =
      await loadData(MEMBERS_COLLECTION);

    if (
      Array.isArray(firebaseMembers) &&
      firebaseMembers.length > 0
    ) {

      return sortMembers(firebaseMembers);

    }

  } catch (error) {

    console.warn(
      "โหลด Firebase ไม่สำเร็จ ใช้รายชื่อสำรอง",
      error
    );

  }


  return sortMembers(
    DEFAULT_MEMBERS.map(member => ({
      ...member,
      firestoreId: "local-" + member.memberId
    }))
  );

}


/* =========================================================
   ค้นหาสมาชิก
========================================================= */

async function findMemberById(memberId) {

  const members =
    await getRongkhemMembers();

  return members.find(member =>
    String(
      member.memberId ||
      member.id ||
      ""
    ).toUpperCase()

    ===

    String(
      memberId || ""
    ).toUpperCase()
  ) || null;

}


async function findMemberByIdOrName(searchQuery) {

  const query =
    String(searchQuery || "")
      .trim()
      .toLowerCase();

  if (!query) {
    return null;
  }

  const members =
    await getRongkhemMembers();

  return members.find(member =>

    String(
      member.memberId ||
      member.id ||
      ""
    ).toLowerCase().includes(query)

    ||

    String(
      member.name || ""
    ).toLowerCase().includes(query)

    ||

    String(
      member.address ||
      member.houseNo ||
      ""
    ).toLowerCase().includes(query)

  ) || null;

}


/* =========================================================
   เพิ่มสมาชิก
========================================================= */

async function addRongkhemMember(memberData = {}) {

  try {

    const members =
      await getRongkhemMembers();


    const highest =
      members.reduce(
        (max, member) => {

          const match =
            String(
              member.memberId ||
              member.id ||
              ""
            ).match(/\d+/);

          const number =
            match
              ? Number(match[0])
              : 0;

          return Math.max(
            max,
            number
          );

        },
        0
      );


    const memberId =
      String(
        memberData.memberId ||
        memberData.id ||
        (
          "RK" +
          String(highest + 1)
            .padStart(3, "0")
        )
      ).toUpperCase();


    const duplicate =
      members.some(member =>

        String(
          member.memberId ||
          member.id ||
          ""
        ).toUpperCase()

        ===

        memberId

      );


    if (duplicate) {

      return {
        success: false,
        error:
          "รหัสสมาชิก " +
          memberId +
          " มีอยู่แล้ว"
      };

    }


    const address =
      String(
        memberData.address ||
        memberData.houseNo ||
        ""
      ).trim();


    const data = {

      id: memberId,

      memberId: memberId,

      name:
        String(
          memberData.name ||
          ""
        ).trim(),

      address: address,

      houseNo: address,

      phone:
        memberData.phone || "",

      status:
        memberData.status ||
        "pending",

      pending:
        Number(
          memberData.pending || 0
        ),

      sent:
        Number(
          memberData.sent || 0
        )

    };


    if (!data.name) {

      return {
        success: false,
        error:
          "กรุณาระบุชื่อสมาชิก"
      };

    }


    if (!data.address) {

      return {
        success: false,
        error:
          "กรุณาระบุบ้านเลขที่"
      };

    }


    return await saveData(
      MEMBERS_COLLECTION,
      data
    );

  } catch (error) {

    console.error(
      "เพิ่มสมาชิกผิดพลาด:",
      error
    );

    return {
      success: false,
      error: error.message
    };

  }

}


/* =========================================================
   แก้ไขสมาชิก
========================================================= */

async function updateRongkhemMember(
  firestoreId,
  data = {}
) {

  try {

    const isLocal =
      String(
        firestoreId || ""
      ).startsWith("local-");


    /* ---------------------------------------------
       ถ้าเป็นรายชื่อสำรอง
       ให้สร้างข้อมูลใน Firebase
    --------------------------------------------- */

    if (isLocal) {

      const memberId =
        String(firestoreId)
          .replace("local-", "");


      const oldMember =
        DEFAULT_MEMBERS.find(
          member =>
            member.memberId === memberId
        );


      if (!oldMember) {

        return {
          success: false,
          error:
            "ไม่พบข้อมูลสมาชิก"
        };

      }


      const address =
        String(
          data.address ||
          data.houseNo ||
          oldMember.address ||
          ""
        ).trim();


      return await saveData(
        MEMBERS_COLLECTION,
        {

          id: memberId,

          memberId: memberId,

          name:
            data.name ||
            oldMember.name,

          address: address,

          houseNo: address,

          phone:
            data.phone ||
            oldMember.phone ||
            "",

          status:
            data.status ||
            oldMember.status ||
            "pending",

          pending:
            Number(
              data.pending ?? 0
            ),

          sent:
            Number(
              data.sent ?? 0
            )

        }
      );

    }


    return await updateData(
      MEMBERS_COLLECTION,
      firestoreId,
      data
    );

  } catch (error) {

    console.error(
      "แก้ไขสมาชิกผิดพลาด:",
      error
    );

    return {
      success: false,
      error: error.message
    };

  }

}


/* =========================================================
   ลบสมาชิก
========================================================= */

async function deleteRongkhemMember(
  firestoreId
) {

  try {

    const isLocal =
      String(
        firestoreId || ""
      ).startsWith("local-");


    /* รายชื่อสำรองยังไม่ได้อยู่ Firebase */

    if (isLocal) {

      return {
        success: false,
        error:
          "สมาชิกนี้เป็นข้อมูลสำรอง กรุณาบันทึกหรือแก้ไขข้อมูลก่อน"
      };

    }


    return await deleteData(
      MEMBERS_COLLECTION,
      firestoreId
    );

  } catch (error) {

    console.error(
      "ลบสมาชิกผิดพลาด:",
      error
    );

    return {
      success: false,
      error: error.message
    };

  }

}


/* =========================================================
   รีเซ็ตสถานะสมาชิกทั้งหมด
========================================================= */

async function resetAllMembersStatus() {

  try {

    const firebaseMembers =
      await loadData(
        MEMBERS_COLLECTION
      );


    const members =
      Array.isArray(firebaseMembers)
        ? firebaseMembers
        : [];


    /* ถ้า Firebase ยังว่าง
       ให้สร้างสมาชิก 176 คน
       พร้อมสถานะ pending */

    if (members.length === 0) {

      return await restoreMembersToFirebase();

    }


    let successCount = 0;
    let failedCount = 0;


    for (const member of members) {

      const firestoreId =
        member.firestoreId ||
        member.docId;


      if (!firestoreId) {
        continue;
      }


      const result =
        await updateData(
          MEMBERS_COLLECTION,
          firestoreId,
          {
            status: "pending",
            pending: 0,
            sent: 0
          }
        );


      if (result.success) {
        successCount++;
      } else {
        failedCount++;
      }

    }


    return {

      success:
        failedCount === 0,

      count:
        successCount,

      failed:
        failedCount

    };

  } catch (error) {

    console.error(
      "รีเซ็ตสมาชิกผิดพลาด:",
      error
    );

    return {
      success: false,
      error: error.message
    };

  }

}


/* =========================================================
   กู้รายชื่อ 176 คนเข้า Firebase
========================================================= */

async function restoreMembersToFirebase() {

  try {

    let existing = [];

    try {

      existing =
        await loadData(
          MEMBERS_COLLECTION
        );

    } catch (error) {

      console.warn(
        "ไม่สามารถโหลด Firebase:",
        error
      );

    }


    if (!Array.isArray(existing)) {
      existing = [];
    }


    const existingIds =
      new Set(

        existing.map(member =>

          String(
            member.memberId ||
            member.id ||
            ""
          ).toUpperCase()

        )

      );


    let added = 0;
    let skipped = 0;
    let failed = 0;


    for (
      const member
      of DEFAULT_MEMBERS
    ) {

      if (

        existingIds.has(
          member.memberId
            .toUpperCase()
        )

      ) {

        skipped++;
        continue;

      }


      const result =
        await saveData(
          MEMBERS_COLLECTION,
          {

            ...member,

            restoredAt:
              new Date()
                .toISOString()

          }
        );


      if (result.success) {
        added++;
      } else {
        failed++;
      }

    }


    return {

      success:
        failed === 0,

      added,

      skipped,

      failed,

      total:
        DEFAULT_MEMBERS.length

    };

  } catch (error) {

    console.error(
      "กู้สมาชิกผิดพลาด:",
      error
    );

    return {
      success: false,
      error: error.message
    };

  }

}


async function migrateDefaultMembers() {

  return await
    restoreMembersToFirebase();

}


/* =========================================================
   สรุปจำนวนสมาชิก
========================================================= */

function getMemberSummary(
  members = []
) {

  const total =
    members.length;


  const sent =
    members.filter(
      member =>

        member.status === "sent" ||

        member.status === "received" ||

        member.sent === 1

    ).length;


  const pending =
    total - sent;


  return {
    total,
    sent,
    pending
  };

}


/* =========================================================
   Subscribe สมาชิก

   ใช้ fallback แบบปลอดภัย
========================================================= */

function subscribeMembers(callback) {

  let stopped = false;


  async function refresh() {

    if (stopped) {
      return;
    }


    try {

      const members =
        await getRongkhemMembers();

      callback(
        sortMembers(members)
      );

    } catch (error) {

      console.error(
        "โหลดสมาชิกผิดพลาด:",
        error
      );

      callback(
        sortMembers(
          DEFAULT_MEMBERS.map(
            member => ({
              ...member,
              firestoreId:
                "local-" +
                member.memberId
            })
          )
        )
      );

    }

  }


  refresh();


  /* โหลดใหม่ทุก 5 วินาที */

  const timer =
    setInterval(
      refresh,
      5000
    );


  return () => {

    stopped = true;

    clearInterval(timer);

  };

}


/* =========================================================
   เปิดใช้จากหน้าอื่น
========================================================= */

window.DEFAULT_MEMBERS =
  DEFAULT_MEMBERS;

window.getRongkhemMembers =
  getRongkhemMembers;

window.findMemberById =
  findMemberById;

window.findMemberByIdOrName =
  findMemberByIdOrName;

window.addRongkhemMember =
  addRongkhemMember;

window.updateRongkhemMember =
  updateRongkhemMember;

window.deleteRongkhemMember =
  deleteRongkhemMember;

window.restoreMembersToFirebase =
  restoreMembersToFirebase;

window.migrateDefaultMembers =
  migrateDefaultMembers;

window.resetAllMembersStatus =
  resetAllMembersStatus;

window.subscribeMembers =
  subscribeMembers;

window.getMemberSummary =
  getMemberSummary;


/* =========================================================
   Export
========================================================= */

export {

  DEFAULT_MEMBERS,

  getRongkhemMembers,

  findMemberById,

  findMemberByIdOrName,

  addRongkhemMember,

  updateRongkhemMember,

  deleteRongkhemMember,

  restoreMembersToFirebase,

  migrateDefaultMembers,

  resetAllMembersStatus,

  subscribeMembers,

  getMemberSummary

};


console.log(
  "🌾 members.js พร้อมใช้งาน:",
  DEFAULT_MEMBERS.length,
  "ราย"
);
