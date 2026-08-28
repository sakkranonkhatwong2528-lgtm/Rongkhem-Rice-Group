// ============================================================
// 👥 members.js
// ระบบจัดการสมาชิกกลุ่มข้าวสาร บ้านร่องเข็ม หมู่ที่ 6
// ส่วนที่ 1/2
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
// 📦 รายชื่อสมาชิกทั้งหมด
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
    { memberId: "RK061", name: "นายนวล ศรีเมือง", houseNo: "93 หมู่ 6" },
    { memberId: "RK062", name: "นายทิน วิศรีใจ", houseNo: "96 หมู่ 6" },
    { memberId: "RK063", name: "นายธีระพันธ์ ถิ่นลำปาง", houseNo: "96/1 หมู่ 6" },
    { memberId: "RK064", name: "นายเสาร์แก้ว คิดอ่าน", houseNo: "98 หมู่ 6" },
    { memberId: "RK065", name: "นายผัด เครือนวล", houseNo: "100 หมู่ 6" },
    { memberId: "RK066", name: "นายปัน ผัดดี", houseNo: "101 หมู่ 6" },
    { memberId: "RK067", name: "นายลักษ์ คำวงษา", houseNo: "103 หมู่ 6" },
    { memberId: "RK068", name: "นายไหล่ ศรีเมือง", houseNo: "104 หมู่ 6" },
    { memberId: "RK069", name: "นายพิชัย ปัญใจ", houseNo: "105 หมู่ 6" },
    { memberId: "RK070", name: "นางจันทร์เพ็ญ ใฝ่ใจ", houseNo: "106 หมู่ 6" },
    { memberId: "RK071", name: "นายสรชัย ใฝ่ใจ", houseNo: "106/1 หมู่ 6" },
    { memberId: "RK072", name: "นายวรวรรธน์ ลำพูน", houseNo: "109 หมู่ 6" },
    { memberId: "RK073", name: "นางป้อ ใฝ่ใจ", houseNo: "111 หมู่ 6" },
    { memberId: "RK074", name: "นางอ่อน จักจุ่ม", houseNo: "112 หมู่ 6" },
    { memberId: "RK075", name: "นายยนต์ บุญธิวงค์", houseNo: "112/1 หมู่ 6" },
    { memberId: "RK076", name: "นางขันคำ จันทวงศ์", houseNo: "113 หมู่ 6" },
    { memberId: "RK077", name: "นายต่วน ทาทอง", houseNo: "114 หมู่ 6" },
    { memberId: "RK078", name: "นายธวัชชัย บุญเก่ง", houseNo: "116 หมู่ 6" },
    { memberId: "RK079", name: "นายผล วิศรีใจ", houseNo: "117 หมู่ 6" },
    { memberId: "RK080", name: "นางประมวลศรี ถิ่นลำปาง", houseNo: "80 หมู่ 6" },
    { memberId: "RK081", name: "นางจันทร์ทิพย์ ถิ่นลำปาง", houseNo: "118 หมู่ 6" },
    { memberId: "RK082", name: "นายอัครวัฒน์ วริพัฒผัดดี", houseNo: "119 หมู่ 6" },
    { memberId: "RK083", name: "นายสุพนธ์ นาแพร่", houseNo: "121 หมู่ 6" },
    { memberId: "RK084", name: "นายบุญศรี ศรีคำ", houseNo: "125 หมู่ 6" },
    { memberId: "RK085", name: "นางหวิง นามวงค์", houseNo: "126 หมู่ 6" },
    { memberId: "RK086", name: "นายกิตติศักดิ์ นามจิต", houseNo: "130 หมู่ 6" },
    { memberId: "RK087", name: "นายสุนิตย์ ไข่หนู", houseNo: "130/1 หมู่ 6" },
    { memberId: "RK088", name: "นางวิไล ใจชื่น", houseNo: "131 หมู่ 6" },
    { memberId: "RK089", name: "นายนิกร งามจิต", houseNo: "132 หมู่ 6" },
    { memberId: "RK090", name: "นายประสิทธิ์ วงค์ขัติย์", houseNo: "136 หมู่ 6" },
    { memberId: "RK091", name: "นายเม็ด งามจิต", houseNo: "137 หมู่ 6" },
    { memberId: "RK092", name: "นายส่ง ปิงเมือง", houseNo: "138 หมู่ 6" },
    { memberId: "RK093", name: "นายบุญศักดิ์ ลำพูน", houseNo: "139 หมู่ 6" },
    { memberId: "RK094", name: "นายวีระ นามจิตต์", houseNo: "140 หมู่ 6" },
    { memberId: "RK095", name: "นายสิงห์ธนู วงค์ขัติย์", houseNo: "141 หมู่ 6" },
    { memberId: "RK096", name: "นายสุทัศน์ ตุ่นคำ", houseNo: "142 หมู่ 6" },
    { memberId: "RK097", name: "นายเขียน ศรีเมือง", houseNo: "143 หมู่ 6" },
    { memberId: "RK098", name: "นางลาวัลย์ ปันใจ", houseNo: "144 หมู่ 6" },
    { memberId: "RK099", name: "นายบุญธรรม ศรีเมือง", houseNo: "145 หมู่ 6" },
    { memberId: "RK100", name: "นางทับ บุญรมย์", houseNo: "147 หมู่ 6" },
    { memberId: "RK101", name: "น.ส.เนียม ศรีเมือง", houseNo: "148 หมู่ 6" },
    { memberId: "RK102", name: "น.ส.สุทัตตา พลูคำ", houseNo: "148/1 หมู่ 6" },
    { memberId: "RK103", name: "นายผล ไชยยศ", houseNo: "149 หมู่ 6" },
    { memberId: "RK104", name: "นายศักดิ์ จันทร์มูล", houseNo: "151/1 หมู่ 6" },
    { memberId: "RK105", name: "น.ส.นิติการณ์ จันทร์มูล", houseNo: "152 หมู่ 6" },
    { memberId: "RK106", name: "นางสายใจ ธรรมสาร", houseNo: "153 หมู่ 6" },
    { memberId: "RK107", name: "นายปัญญา เขียวนาค", houseNo: "153/1 หมู่ 6" },
    { memberId: "RK108", name: "นายเกียรติศักดิ์ จันทร์มูล", houseNo: "154/1 หมู่ 6" },
    { memberId: "RK109", name: "นายจำรัส ปัญใจ", houseNo: "155 หมู่ 6" },
    { memberId: "RK110", name: "นางศรีอร ใฝ่ใจ", houseNo: "157 หมู่ 6" },
    { memberId: "RK111", name: "นางยวงคำ ถิ่นลำปาง", houseNo: "159 หมู่ 6" },
    { memberId: "RK112", name: "นายวิเชียร ถิ่นลำปาง", houseNo: "159/1 หมู่ 6" },
    { memberId: "RK113", name: "น.ส.ยุพา ใจดี", houseNo: "160 หมู่ 6" },
    { memberId: "RK114", name: "นายเกียรติศักดิ์ พลูคำ", houseNo: "162 หมู่ 6" },
    { memberId: "RK115", name: "น.ส.น้อย บุญธิวงค์", houseNo: "162/1 หมู่ 6" },
    { memberId: "RK116", name: "น.ส.พวงผกา จันทร์มูล", houseNo: "163 หมู่ 6" },
    { memberId: "RK117", name: "นายปริญญา ยานะถนอม", houseNo: "164 หมู่ 6" },
    { memberId: "RK118", name: "นางสุพรรณ์ เรือนมูล", houseNo: "165 หมู่ 6" },
    { memberId: "RK119", name: "นางคำหมาย สมคิด", houseNo: "166 หมู่ 6" },
    { memberId: "RK120", name: "นางอาลิษา กอเตอะ", houseNo: "167 หมู่ 6" },
    { memberId: "RK121", name: "นางวิภาวดี ถิ่นลำปาง", houseNo: "168 หมู่ 6" },
    { memberId: "RK122", name: "นายศรีนวล วงค์ขัติย์", houseNo: "169 หมู่ 6" },
    { memberId: "RK123", name: "น.ส.สุภาวดี วังมูล", houseNo: "169/1 หมู่ 6" },
    { memberId: "RK124", name: "น.ส.ทองสุข ค้านาค", houseNo: "174 หมู่ 6" },
    { memberId: "RK125", name: "นายสม ขัติย์วงศ์", houseNo: "177 หมู่ 6" },
    { memberId: "RK126", name: "นายสงัด ศรีไชยอินทร์", houseNo: "178 หมู่ 6" },
    { memberId: "RK127", name: "นายมิตร ผัดดี", houseNo: "179 หมู่ 6" },
    { memberId: "RK128", name: "นางศรีลา งามจิต", houseNo: "181 หมู่ 6" },
    { memberId: "RK129", name: "นายธวัชชัย พลูคำ", houseNo: "182 หมู่ 6" },
    { memberId: "RK130", name: "นายนิยม ละเอียด", houseNo: "184 หมู่ 6" },
    { memberId: "RK131", name: "นางแสงคล้าย นามจิต", houseNo: "186 หมู่ 6" },
    { memberId: "RK132", name: "นายสุนทร ปิงเมือง", houseNo: "188 หมู่ 6" },
    { memberId: "RK133", name: "นายชุมพล ใฝ่ใจ", houseNo: "189 หมู่ 6" },
    { memberId: "RK134", name: "นางเหลี่ยม สมศรี", houseNo: "192 หมู่ 6" },
    { memberId: "RK135", name: "นางสมศรี สัตย์สม", houseNo: "193 หมู่ 6" },
    { memberId: "RK136", name: "นางจุฑามาศ งามจิต", houseNo: "195 หมู่ 6" },
    { memberId: "RK137", name: "นางยุพา กิ่งก้าน", houseNo: "199 หมู่ 6" },
    { memberId: "RK138", name: "นายบัว ศรีเมือง", houseNo: "201 หมู่ 6" },
    { memberId: "RK139", name: "นายอิ่น ฉลาดการ", houseNo: "204 หมู่ 6" },
    { memberId: "RK140", name: "นางเพ็ญ อิ่นทอง", houseNo: "205 หมู่ 6" },
    { memberId: "RK141", name: "นางพรศรี ใฝ่ใจ", houseNo: "206 หมู่ 6" },
    { memberId: "RK142", name: "นายประจักร งานดี", houseNo: "213 หมู่ 6" },
    { memberId: "RK143", name: "นายวัชร จอมภา", houseNo: "214 หมู่ 6" },
    { memberId: "RK144", name: "น.ส.อำภา งามจิต", houseNo: "222 หมู่ 6" },
    { memberId: "RK145", name: "นายบุญช่วย จำปา", houseNo: "223 หมู่ 6" },
    { memberId: "RK146", name: "นายบุญธรรม สมคิด", houseNo: "226 หมู่ 6" },
    { memberId: "RK147", name: "นางวาสนา เต", houseNo: "232 หมู่ 6" },
    { memberId: "RK148", name: "นายภาณุพงศ์ ผัดดี", houseNo: "236 หมู่ 6" },
    { memberId: "RK149", name: "นายเสมียน ศรีเมือง", houseNo: "237 หมู่ 6" },
    { memberId: "RK150", name: "นายสง่า จันทร์มูล", houseNo: "238 หมู่ 6" },
    { memberId: "RK151", name: "นายภาณุพงศ์ ใฝ่ใจ", houseNo: "239 หมู่ 6" },
    { memberId: "RK152", name: "นายสมบูรณ์ ปิงเมือง", houseNo: "243 หมู่ 6" },
    { memberId: "RK153", name: "นางนิตยา ใฝ่จิตต์", houseNo: "245 หมู่ 6" },
    { memberId: "RK154", name: "นางจอมศรี นามจิต", houseNo: "247 หมู่ 6" },
    { memberId: "RK155", name: "นายชิษณุพงษ์ ฟองทา", houseNo: "274 หมู่ 6" },
    { memberId: "RK156", name: "นายอริยพล ขัติย์วงศ์", houseNo: "275 หมู่ 6" },
    { memberId: "RK157", name: "นายศุภลัก สุพยน", houseNo: "278 หมู่ 6" },
    { memberId: "RK158", name: "น.ส.ศิริลภัศ คำวงษา", houseNo: "281 หมู่ 6" },
    { memberId: "RK159", name: "นายเกียรติพงษ์ ศักดิ์สูง", houseNo: "282 หมู่ 6" },
    { memberId: "RK160", name: "น.ส.ไพลิน ใจชื่น", houseNo: "287 หมู่ 6" },
    { memberId: "RK161", name: "นายพิชัย ใจดี", houseNo: "288 หมู่ 6" },
    { memberId: "RK162", name: "นางปานหทัย สุวรรณรัตน์", houseNo: "302 หมู่ 6" },
    { memberId: "RK163", name: "นายปรีชา ผัดดี", houseNo: "308 หมู่ 6" },
    { memberId: "RK164", name: "นายจิติพันธ์ จำปา", houseNo: "309 หมู่ 6" },
    { memberId: "RK165", name: "นายนพดล นามวงค์", houseNo: "310 หมู่ 6" },
    { memberId: "RK166", name: "นายสงวน จันทร์มูล", houseNo: "316 หมู่ 6" },
    { memberId: "RK167", name: "นางพร พลูคำ", houseNo: "317 หมู่ 6" },
    { memberId: "RK168", name: "นายทวน ทาฤทธิ์", houseNo: "325 หมู่ 6" },
    { memberId: "RK169", name: "น.ส.ถนิตา พัฒนกรวณิช", houseNo: "329 หมู่ 6" },
    { memberId: "RK170", name: "นายสนธยา สารเชื้อ", houseNo: "330 หมู่ 6" },
    { memberId: "RK171", name: "นายยงหยัด พลูคำ", houseNo: "331 หมู่ 6" },
    { memberId: "RK172", name: "น.ส.อรพินฑ์ เครือวัลย์", houseNo: "333 หมู่ 6" },
    { memberId: "RK173", name: "นายธนารินทร์ ทินนา", houseNo: "336 หมู่ 6" },
    { memberId: "RK174", name: "นางวาสนา ศรีไชยอินทร์", houseNo: "340 หมู่ 6" },
    { memberId: "RK175", name: "นางหล้า วงค์ขัติย์", houseNo: "348 หมู่ 6" },
    { memberId: "RK176", name: "นางญาฐิกา ถิ่นลำปาง", houseNo: "365 หมู่ 6" }

];

// ============================================================
// 🧠 ตัวแปรเก็บข้อมูลสมาชิก
// ============================================================

let membersCache = [];

// ============================================================
// 🔢 เรียงลำดับสมาชิก
// ============================================================

function sortMembers(members = []) {

    return [...members].sort((a, b) => {

        return String(a.memberId || a.id || "")
            .localeCompare(
                String(b.memberId || b.id || ""),
                "en",
                { numeric: true }
            );

    });

}

// ============================================================
// 📥 โหลดข้อมูลสมาชิก
// ถ้า Firebase ยังไม่มีข้อมูล จะใช้รายชื่อ 176 รายนี้
// ============================================================

async function getRongkhemMembers() {

    try {

        const firebaseMembers =
            await loadData(MEMBERS_COLLECTION);

        if (
            Array.isArray(firebaseMembers) &&
            firebaseMembers.length > 0
        ) {

            membersCache = sortMembers(
                firebaseMembers.map(member => ({

                    ...member,

                    memberId:
                        member.memberId ||
                        member.id ||

                        `RK${String(member.id || "").padStart(3, "0")}`,

                    houseNo:
                        member.houseNo ||
                        member.address ||
                        "",

                    status:
                        member.status ||
                        "active"

                }))
            );

            return membersCache;

        }

        membersCache = DEFAULT_MEMBERS.map(member => ({

            ...member,

            phone: "",

            status: "active"

        }));

        return membersCache;

    } catch (error) {

        console.error(
            "โหลดข้อมูลสมาชิกไม่สำเร็จ:",
            error
        );

        membersCache = DEFAULT_MEMBERS.map(member => ({

            ...member,

            phone: "",

            status: "active"

        }));

        return membersCache;

    }

}

// ============================================================
// 🔍 ค้นหาสมาชิกจากรหัส
// ============================================================

function findMemberById(memberId) {

    return membersCache.find(member =>
        member.memberId === memberId ||
        member.id === memberId ||
        member.firestoreId === memberId
    );

}

// ============================================================
// 🔍 ค้นหาสมาชิกจากชื่อ
// ============================================================

function findMemberByName(name) {

    const keyword =
        String(name || "")
            .trim()
            .toLowerCase();

    if (!keyword) return null;

    return membersCache.find(member =>
        String(member.name || "")
            .toLowerCase()
            .includes(keyword)
    );

}

// ============================================================
// 🔎 ค้นหาจากรหัสหรือชื่อ
// ============================================================

function findMemberByIdOrName(keyword) {

    const search =
        String(keyword || "")
            .trim()
            .toLowerCase();

    if (!search) return null;

    return membersCache.find(member => {

        return (
            String(member.memberId || "")
                .toLowerCase()
                .includes(search)

            ||

            String(member.name || "")
                .toLowerCase()
                .includes(search)

            ||

            String(member.houseNo || "")
                .toLowerCase()
                .includes(search)
        );

    });

}

// ============================================================
// 🆔 สร้างรหัสสมาชิกใหม่
// ============================================================

function generateMemberId() {

    const numbers = membersCache.map(member => {

        const match =
            String(member.memberId || "")
                .match(/\d+/);

        return match
            ? parseInt(match[0], 10)
            : 0;

    });

    const next =
        Math.max(176, ...numbers) + 1;

    return `RK${String(next).padStart(3, "0")}`;

}

// ============================================================
// ➕ เพิ่มสมาชิก
// ============================================================

async function addRongkhemMember(memberData = {}) {

    try {

        const name =
            String(memberData.name || "").trim();

        const houseNo =
            String(
                memberData.houseNo ||
                memberData.address ||
                ""
            ).trim();

        const phone =
            String(memberData.phone || "").trim();

        if (!name) {

            throw new Error(
                "กรุณากรอกชื่อสมาชิก"
            );

        }

        const memberId =
            memberData.memberId ||
            generateMemberId();

        const data = {

            memberId,

            name,

            houseNo,

            address: houseNo,

            phone,

            status:
                memberData.status ||
                "active",

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

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

            memberId,

            data

        };

    } catch (error) {

        console.error(
            "เพิ่มสมาชิกไม่สำเร็จ:",
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
// ✏️ แก้ไขสมาชิก
// ============================================================

async function updateRongkhemMember(
    memberId,
    memberData = {}
) {

    try {

        const member =
            findMemberById(memberId);

        if (!member) {

            throw new Error(
                "ไม่พบข้อมูลสมาชิก"
            );

        }

        const data = {

            ...member,

            name:
                String(
                    memberData.name ||
                    member.name
                ).trim(),

            houseNo:
                String(
                    memberData.houseNo ||
                    memberData.address ||
                    member.houseNo ||
                    ""
                ).trim(),

            phone:
                String(
                    memberData.phone ??
                    member.phone ??
                    ""
                ).trim(),

            status:
                memberData.status ||
                member.status ||
                "active",

            updatedAt:
                new Date().toISOString()

        };

        data.address =
            data.houseNo;

        const documentId =
            member.firestoreId ||
            member.docId ||
            member.id;

        if (!documentId) {

            throw new Error(
                "สมาชิกคนนี้ยังไม่ได้บันทึกใน Firebase"
            );

        }

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

        await refreshMembers();

        return {
            success: true
        };

    } catch (error) {

        console.error(
            "แก้ไขสมาชิกไม่สำเร็จ:",
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
                "สมาชิกเดิมยังไม่ได้อยู่ใน Firebase กรุณาบันทึกข้อมูลเข้าระบบก่อน"
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
            "ลบสมาชิกไม่สำเร็จ:",
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
// 🔄 โหลดข้อมูลใหม่
// ============================================================

async function refreshMembers() {

    membersCache =
        await getRongkhemMembers();

    return membersCache;

}

// ============================================================
// ☁️ นำรายชื่อเริ่มต้น 176 คนเข้า Firebase
// เรียกใช้ครั้งแรกเพียงครั้งเดียว
// ============================================================

async function initializeDefaultMembers() {

    try {

        const existing =
            await loadData(
                MEMBERS_COLLECTION
            );

        if (
            Array.isArray(existing) &&
            existing.length > 0
        ) {

            membersCache =
                sortMembers(existing);

            return {

                success: true,

                exists: true,

                count:
                    membersCache.length,

                message:
                    "มีข้อมูลสมาชิกอยู่ในระบบแล้ว"

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

                        phone: "",

                        status:
                            "active",

                        createdAt:
                            new Date().toISOString(),

                        updatedAt:
                            new Date().toISOString()

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

            count:
                successCount,

            message:
                `นำเข้ารายชื่อ ${successCount} รายเรียบร้อย`

        };

    } catch (error) {

        console.error(
            "นำเข้ารายชื่อไม่สำเร็จ:",
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
// ⚡ ติดตามข้อมูลสมาชิกแบบ Real-time
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
                            members
                        );

                } else {

                    membersCache =
                        DEFAULT_MEMBERS.map(
                            member => ({
                                ...member,
                                phone: "",
                                status: "active"
                            })
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
            "Real-time สมาชิกไม่ทำงาน:",
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
                member.status !== "inactive"
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
// 🌐 เปิดใช้กับ HTML
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

window.subscribeMembers =
    subscribeMembers;

// ============================================================
// 📤 Export
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
// 🚀 เริ่มต้นระบบ
// ============================================================

refreshMembers()
    .then(() => {

        console.log(
            "👥 ระบบสมาชิกพร้อมใช้งาน:",
            membersCache.length,
            "ราย"
        );

    })
    .catch(error => {

        console.error(
            "❌ เริ่มระบบสมาชิกไม่สำเร็จ:",
            error
        );

    });
