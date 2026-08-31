const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

const LINE_TOKEN = functions.config().line.token; // ตั้งค่าด้วย firebase functions:config:set
const LINE_USER_ID = functions.config().line.userid; // หรือ groupId

/**
 * ส่งข้อความแจ้งเตือนผ่าน LINE Messaging API
 */
async function sendLineMessage(message) {
  await axios.post(
    "https://api.line.me/v2/bot/message/push",
    {
      to: LINE_USER_ID,
      messages: [{ type: "text", text: message }]
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_TOKEN}`
      }
    }
  );
}

/* ===== Trigger 1: แจ้งเตือนเมื่อมีการแจ้งงานศพใหม่ ===== */
exports.notifyNewFuneral = functions.firestore
  .document("funerals/{funeralId}")
  .onCreate(async (snap) => {
    const data = snap.data();
    const message =
      `🙏 แจ้งงานศพใหม่\n` +
      `ผู้เสียชีวิต: ${data.deceasedName}\n` +
      `เจ้าภาพ: ${data.hostName || "-"}\n` +
      `สถานที่: ${data.location || "-"}\n` +
      `วันที่แจ้ง: ${new Date().toLocaleDateString("th-TH")}`;
    await sendLineMessage(message);
  });

/* ===== Trigger 2: แจ้งเตือนเมื่อมีประกาศใหม่ ===== */
exports.notifyNewAnnouncement = functions.firestore
  .document("announcements/{id}")
  .onCreate(async (snap) => {
    const data = snap.data();
    const message = `📢 ประกาศใหม่\n${data.title}\n\n${data.content?.substring(0, 100) || ""}...`;
    await sendLineMessage(message);
  });

/* ===== Trigger 3: แจ้งเตือนสรุปยอดรับข้าวรายวัน (ตั้งเวลา 18:00 ทุกวัน) ===== */
exports.dailyRiceSummary = functions.pubsub
  .schedule("0 18 * * *")
  .timeZone("Asia/Bangkok")
  .onRun(async () => {
    const today = new Date().toISOString().split("T")[0];
    const snapshot = await admin.firestore()
      .collection("riceRecords")
      .where("date", "==", today)
      .get();

    let totalWeight = 0;
    snapshot.forEach(doc => { totalWeight += doc.data().weight || 0; });

    const message =
      `📊 สรุปยอดรับข้าววันนี้\n` +
      `จำนวนรายการ: ${snapshot.size} รายการ\n` +
      `น้ำหนักรวม: ${totalWeight.toFixed(2)} กก.`;
    await sendLineMessage(message);
  });
