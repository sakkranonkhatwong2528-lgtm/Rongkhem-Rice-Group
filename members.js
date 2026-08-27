
/* ==========================================
   Rongkhem Rice Group
   members.js
   Version 2.0 (พร้อมฟังก์ชันจัดการข้อมูลจริง)
========================================== */

const STORAGE_KEY = "Rongkhem_Members_Local";

// รายชื่อสมาชิกเริ่มต้น 176 ครัวเรือน
window.DEFAULT_MEMBERS = [
  { id: "RK001", name: "นายจักร์กวัส ประพลรัตนัง", address: "2 หมู่ 6", status: "pending" },
  { id: "RK002", name: "นางแสงเพียร วงค์ขัติย์", address: "6 หมู่ 6", status: "pending" },
  { id: "RK003", name: "นายยนต์ ปิงเมือง", address: "7 หมู่ 6", status: "pending" },
  { id: "RK004", name: "นางสมศรี ปิงเมือง", address: "8 หมู่ 6", status: "pending" },
  { id: "RK005", name: "นายชัด ปิงเมือง", address: "10 หมู่ 6", status: "pending" },
  { id: "RK006", name: "นายปิ๊ก ขัติย์วงศ์", address: "12 หมู่ 6", status: "pending" },
  { id: "RK007", name: "นายยรรยง ผัดดี", address: "14/1 หมู่ 6", status: "pending" },
  { id: "RK008", name: "นายหมื่น วังมูล", address: "15 หมู่ 6", status: "pending" },
  { id: "RK009", name: "นายโกวัฒธฤทธิ์ ประพลรัตนัง", address: "17 หมู่ 6", status: "pending" },
  { id: "RK010", name: "นายภาณุวัฒน์ บุญยา", address: "20 หมู่ 6", status: "pending" },
  { id: "RK011", name: "นายสมอน ศรีเมือง", address: "22 หมู่ 6", status: "pending" },
  { id: "RK012", name: "นายพรชัย ปัญใจ", address: "29 หมู่ 6", status: "pending" },
  { id: "RK013", name: "นายชูชาติ จำปา", address: "30 หมู่ 6", status: "pending" },
  { id: "RK014", name: "นางน้อย วิศรีใจ", address: "31 หมู่ 6", status: "pending" },
  { id: "RK015", name: "นายอินทร์ ถิ่นลำปาง", address: "32 หมู่ 6", status: "pending" },
  { id: "RK016", name: "นายคำตั๋น วังมูล", address: "34 หมู่ 6", status: "pending" },
  { id: "RK017", name: "นางวิไลพร วังมูล", address: "35 หมู่ 6", status: "pending" },
  { id: "RK018", name: "นายบุญ ไฝ่จิตต์", address: "36 หมู่ 6", status: "pending" },
  { id: "RK019", name: "นายบุญช่วย เครือวัลย์", address: "37 หมู่ 6", status: "pending" },
  { id: "RK020", name: "นายมา วังมูล", address: "38 หมู่ 6", status: "pending" },
  { id: "RK021", name: "นายสมาน วังมูล", address: "39 หมู่ 6", status: "pending" },
  { id: "RK022", name: "นายวัชร ถิ่นลำปาง", address: "40 หมู่ 6", status: "pending" },
  { id: "RK023", name: "นางพิมพร ใฝ่ใจ", address: "41 หมู่ 6", status: "pending" },
  { id: "RK024", name: "นางถวิล ใฝ่ใจ", address: "42 หมู่ 6", status: "pending" },
  { id: "RK025", name: "นายบรรลัง ใฝ่ใจ", address: "42/1 หมู่ 6", status: "pending" },
  { id: "RK026", name: "นายอิ่น จักจุ่ม", address: "46 หมู่ 6", status: "pending" },
  { id: "RK027", name: "นางทองดี วงศ์ขัติย์", address: "47 หมู่ 6", status: "pending" },
  { id: "RK028", name: "นายชุม ใฝ่ใจ", address: "49 หมู่ 6", status: "pending" },
  { id: "RK029", name: "นางทองดี พลูคำ", address: "50 หมู่ 6", status: "pending" },
  { id: "RK030", name: "นายผัด ทาแก้ว", address: "51 หมู่ 6", status: "pending" },
  { id: "RK031", name: "นางสายทอง ชุ่มธิ", address: "51/1 หมู่ 6", status: "pending" },
  { id: "RK032", name: "นายอดิศักดิ์ ขัติธิ", address: "52 หมู่ 6", status: "pending" },
  { id: "RK033", name: "นายนพคุณ จอมภา", address: "53 หมู่ 6", status: "pending" },
  { id: "RK034", name: "นายพิพัฒน์ ใฝ่ใจ", address: "56 หมู่ 6", status: "pending" },
  { id: "RK035", name: "น.ส.เตือนธิวา ใฝ่ใจ", address: "58 หมู่ 6", status: "pending" },
  { id: "RK036", name: "นางเหล็ง วิศรีใจ", address: "60 หมู่ 6", status: "pending" },
  { id: "RK037", name: "นายบุญเสริม วิศรีใจ", address: "60/1 หมู่ 6", status: "pending" },
  { id: "RK038", name: "น.ส.กรพิน กาวิน", address: "61 หมู่ 6", status: "pending" },
  { id: "RK039", name: "นายบุญเรือง ถิ่นลำปาง", address: "62 หมู่ 6", status: "pending" },
  { id: "RK040", name: "นางวิไล ถิ่นลำปาง", address: "62/2 หมู่ 6", status: "pending" },
  { id: "RK041", name: "นายวิทยา งามจิต", address: "64 หมู่ 6", status: "pending" },
  { id: "RK042", name: "นายแสวง ศรีไชยอินทร์", address: "67 หมู่ 6", status: "pending" },
  { id: "RK043", name: "นางอำไพวิทย์ ปัญญา", address: "68 หมู่ 6", status: "pending" },
  { id: "RK044", name: "นางเลข ใฝ่จิตร์", address: "69 หมู่ 6", status: "pending" },
  { id: "RK045", name: "นายยก ถิ่นลำปาง", address: "70 หมู่ 6", status: "pending" },
  { id: "RK046", name: "น.ส.ผ่องศรี ปัญใจ", address: "72 หมู่ 6", status: "pending" },
  { id: "RK047", name: "น.ส.บรรณารักษ์ พลูคำ", address: "73 หมู่ 6", status: "pending" },
  { id: "RK048", name: "นางสุดารัตน์ จักจุ่ม", address: "73/1 หมู่ 6", status: "pending" },
  { id: "RK049", name: "นายธนวัฒน์ ปัญใจ", address: "74 หมู่ 6", status: "pending" },
  { id: "RK050", name: "นายแก้วมูล ทินนา", address: "75 หมู่ 6", status: "pending" },
  { id: "RK051", name: "นางหล้า ใฝ่ใจ", address: "76 หมู่ 6", status: "pending" },
  { id: "RK052", name: "นายสุทัศน์ ปัญใจ", address: "79/1 หมู่ 6", status: "pending" },
  { id: "RK053", name: "นายผล งามจิตร", address: "82 หมู่ 6", status: "pending" },
  { id: "RK054", name: "นางเครือวัลย์ บุญธิวงค์", address: "84 หมู่ 6", status: "pending" },
  { id: "RK055", name: "นางเป็ง ใฝ่จิต", address: "85 หมู่ 6", status: "pending" },
  { id: "RK056", name: "นายพัสกร งามจิต", address: "86 หมู่ 6", status: "pending" },
  { id: "RK057", name: "น.ส.วิภารัตน์ กันทะวัง", address: "88 หมู่ 6", status: "pending" },
  { id: "RK058", name: "นางบุญปั๋น ทาทอง", address: "89 หมู่ 6", status: "pending" },
  { id: "RK059", name: "นางฝน งามจิต", address: "91 หมู่ 6", status: "pending" },
  { id: "RK060", name: "นายวุฒิภัทร เตชะวงค์", address: "91/1 หมู่ 6", status: "pending" },
  { id: "RK061", name: "นายนวล ศรีเมือง", address: "93 หมู่ 6", status: "pending" },
  { id: "RK062", name: "นายทิน วิศรีใจ", address: "96 หมู่ 6", status: "pending" },
  { id: "RK063", name: "นายธีระพันธ์ ถิ่นลำปาง", address: "96/1 หมู่ 6", status: "pending" },
  { id: "RK064", name: "นายเสาร์แก้ว คิดอ่าน", address: "98 หมู่ 6", status: "pending" },
  { id: "RK065", name: "นายผัด เครือนวล", address: "100 หมู่ 6", status: "pending" },
  { id: "RK066", name: "นายปัน ผัดดี", address: "101 หมู่ 6", status: "pending" },
  { id: "RK067", name: "นายลักษ์ คำวงษา", address: "103 หมู่ 6", status: "pending" },
  { id: "RK068", name: "นายไหล่ ศรีเมือง", address: "104 หมู่ 6", status: "pending" },
  { id: "RK069", name: "นายพิชัย ปัญใจ", address: "105 หมู่ 6", status: "pending" },
  { id: "RK070", name: "นางจันทร์เพ็ญ ใฝ่ใจ", address: "106 หมู่ 6", status: "pending" },
  { id: "RK071", name: "นายสรชัย ใฝ่ใจ", address: "106/1 หมู่ 6", status: "pending" },
  { id: "RK072", name: "นายวรวรรธน์ ลำพูน", address: "109 หมู่ 6", status: "pending" },
  { id: "RK073", name: "นางป้อ ใฝ่ใจ", address: "111 หมู่ 6", status: "pending" },
  { id: "RK074", name: "นางอ่อน จักจุ่ม", address: "112 หมู่ 6", status: "pending" },
  { id: "RK075", name: "นายยนต์ บุญธิวงค์", address: "112/1 หมู่ 6", status: "pending" },
  { id: "RK076", name: "นางขันคำ จันทวงศ์", address: "113 หมู่ 6", status: "pending" },
  { id: "RK077", name: "นายต่วน ทาทอง", address: "114 หมู่ 6", status: "pending" },
  { id: "RK078", name: "นายธวัชชัย บุญเก่ง", address: "116 หมู่ 6", status: "pending" },
  { id: "RK079", name: "นายผล วิศรีใจ", address: "117 หมู่ 6", status: "pending" },
  { id: "RK080", name: "นางประมวลศรี ถิ่นลำปาง", address: "80 หมู่ 6", status: "pending" },
  { id: "RK081", name: "นางจันทร์ทิพย์ ถิ่นลำปาง", address: "118 หมู่ 6", status: "pending" },
  { id: "RK082", name: "นายอัครวัฒน์ วริพัฒผัดดี", address: "119 หมู่ 6", status: "pending" },
  { id: "RK083", name: "นายสุพนธ์ นาแพร่", address: "121 หมู่ 6", status: "pending" },
  { id: "RK084", name: "นายบุญศรี ศรีคำ", address: "125 หมู่ 6", status: "pending" },
  { id: "RK085", name: "นางหวิง นามวงค์", address: "126 หมู่ 6", status: "pending" },
  { id: "RK086", name: "นายกิตติศักดิ์ นามจิต", address: "130 หมู่ 6", status: "pending" },
  { id: "RK087", name: "นายสุนิตย์ ไข่หนู", address: "130/1 หมู่ 6", status: "pending" },
  { id: "RK088", name: "นางวิไล ใจชื่น", address: "131 หมู่ 6", status: "pending" },
  { id: "RK089", name: "นายนิกร งามจิต", address: "132 หมู่ 6", status: "pending" },
  { id: "RK090", name: "นายประสิทธิ์ วงค์ขัติย์", address: "136 หมู่ 6", status: "pending" },
  { id: "RK091", name: "นายเม็ด งามจิต", address: "137 หมู่ 6", status: "pending" },
  { id: "RK092", name: "นายส่ง ปิงเมือง", address: "138 หมู่ 6", status: "pending" },
  { id: "RK093", name: "นายบุญศักดิ์ ลำพูน", address: "139 หมู่ 6", status: "pending" },
  { id: "RK094", name: "นายวีระ นามจิตต์", address: "140 หมู่ 6", status: "pending" },
  { id: "RK095", name: "นายสิงห์ธนู วงค์ขัติย์", address: "141 หมู่ 6", status: "pending" },
  { id: "RK096", name: "นายสุทัศน์ ตุ่นคำ", address: "142 หมู่ 6", status: "pending" },
  { id: "RK097", name: "นายเขียน ศรีเมือง", address: "143 หมู่ 6", status: "pending" },
  { id: "RK098", name: "นางลาวัลย์ ปันใจ", address: "144 หมู่ 6", status: "pending" },
  { id: "RK099", name: "นายบุญธรรม ศรีเมือง", address: "145 หมู่ 6", status: "pending" },
  { id: "RK100", name: "นางทับ บุญรมย์", address: "147 หมู่ 6", status: "pending" },
  { id: "RK101", name: "น.ส.เนียม ศรีเมือง", address: "148 หมู่ 6", status: "pending" },
  { id: "RK102", name: "น.ส.สุทัตตา พลูคำ", address: "148/1 หมู่ 6", status: "pending" },
  { id: "RK103", name: "นายผล ไชยยศ", address: "149 หมู่ 6", status: "pending" },
  { id: "RK104", name: "นายศักดิ์ จันทร์มูล", address: "151/1 หมู่ 6", status: "pending" },
  { id: "RK105", name: "น.ส.นิติการณ์ จันทร์มูล", address: "152 หมู่ 6", status: "pending" },
  { id: "RK106", name: "นางสายใจ ธรรมสาร", address: "153 หมู่ 6", status: "pending" },
  { id: "RK107", name: "นายปัญญา เขียวนาค", address: "153/1 หมู่ 6", status: "pending" },
  { id: "RK108", name: "นายเกียรติศักดิ์ จันทร์มูล", address: "154/1 หมู่ 6", status: "pending" },
  { id: "RK109", name: "นายจำรัส ปัญใจ", address: "155 หมู่ 6", status: "pending" },
  { id: "RK110", name: "นางศรีอร ใฝ่ใจ", address: "157 หมู่ 6", status: "pending" },
  { id: "RK111", name: "นางยวงคำ ถิ่นลำปาง", address: "159 หมู่ 6", status: "pending" },
  { id: "RK112", name: "นายวิเชียร ถิ่นลำปาง", address: "159/1 หมู่ 6", status: "pending" },
  { id: "RK113", name: "น.ส.ยุพา ใจดี", address: "160 หมู่ 6", status: "pending" },
  { id: "RK114", name: "นายเกียรติศักดิ์ พลูคำ", address: "162 หมู่ 6", status: "pending" },
  { id: "RK115", name: "น.ส.น้อย บุญธิวงค์", address: "162/1 หมู่ 6", status: "pending" },
  { id: "RK116", name: "น.ส.พวงผกา จันทร์มูล", address: "163 หมู่ 6", status: "pending" },
  { id: "RK117", name: "นายปริญญา ยานะถนอม", address: "164 หมู่ 6", status: "pending" },
  { id: "RK118", name: "นางสุพรรณ์ เรือนมูล", address: "165 หมู่ 6", status: "pending" },
  { id: "RK119", name: "นางคำหมาย สมคิด", address: "166 หมู่ 6", status: "pending" },
  { id: "RK120", name: "นางอาลิษา กอเตอะ", address: "167 หมู่ 6", status: "pending" },
  { id: "RK121", name: "นางวิภาวดี ถิ่นลำปาง", address: "168 หมู่ 6", status: "pending" },
  { id: "RK122", name: "นายศรีนวล วงค์ขัติย์", address: "169 หมู่ 6", status: "pending" },
  { id: "RK123", name: "น.ส.สุภาวดี วังมูล", address: "169/1 หมู่ 6", status: "pending" },
  { id: "RK124", name: "น.ส.ทองสุข ค้านาค", address: "174 หมู่ 6", status: "pending" },
  { id: "RK125", name: "นายสม ขัติย์วงศ์", address: "177 หมู่ 6", status: "pending" },
  { id: "RK126", name: "นายสงัด ศรีไชยอินทร์", address: "178 หมู่ 6", status: "pending" },
  { id: "RK127", name: "นายมิตร ผัดดี", address: "179 หมู่ 6", status: "pending" },
  { id: "RK128", name: "นางศรีลา งามจิต", address: "181 หมู่ 6", status: "pending" },
  { id: "RK129", name: "นายธวัชชัย พลูคำ", address: "182 หมู่ 6", status: "pending" },
  { id: "RK130", name: "นายนิยม ละเอียด", address: "184 หมู่ 6", status: "pending" },
  { id: "RK131", name: "นางแสงคล้าย นามจิต", address: "186 หมู่ 6", status: "pending" },
  { id: "RK132", name: "นายสุนทร ปิงเมือง", address: "188 หมู่ 6", status: "pending" },
  { id: "RK133", name: "นายชุมพล ใฝ่ใจ", address: "189 หมู่ 6", status: "pending" },
  { id: "RK134", name: "นางเหลี่ยม สมศรี", address: "192 หมู่ 6", status: "pending" },
  { id: "RK135", name: "นางสมศรี สัตย์สม", address: "193 หมู่ 6", status: "pending" },
  { id: "RK136", name: "นางจุฑามาศ งามจิต", address: "195 หมู่ 6", status: "pending" },
  { id: "RK137", name: "นางยุพา กิ่งก้าน", address: "199 หมู่ 6", status: "pending" },
  { id: "RK138", name: "นายบัว ศรีเมือง", address: "201 หมู่ 6", status: "pending" },
  { id: "RK139", name: "นายอิ่น ฉลาดการ", address: "204 หมู่ 6", status: "pending" },
  { id: "RK140", name: "นางเพ็ญ อิ่นทอง", address: "205 หมู่ 6", status: "pending" },
  { id: "RK141", name: "นางพรศรี ใฝ่ใจ", address: "206 หมู่ 6", status: "pending" },
  { id: "RK142", name: "นายประจักร งานดี", address: "213 หมู่ 6", status: "pending" },
  { id: "RK143", name: "นายวัชร จอมภา", address: "214 หมู่ 6", status: "pending" },
  { id: "RK144", name: "น.ส.อำภา งามจิต", address: "222 หมู่ 6", status: "pending" },
  { id: "RK145", name: "นายบุญช่วย จำปา", address: "223 หมู่ 6", status: "pending" },
  { id: "RK146", name: "นายบุญธรรม สมคิด", address: "226 หมู่ 6", status: "pending" },
  { id: "RK147", name: "นางวาสนา เต", address: "232 หมู่ 6", status: "pending" },
  { id: "RK148", name: "นายภาณุพงศ์ ผัดดี", address: "236 หมู่ 6", status: "pending" },
  { id: "RK149", name: "นายเสมียน ศรีเมือง", address: "237 หมู่ 6", status: "pending" },
  { id: "RK150", name: "นายสง่า จันทร์มูล", address: "238 หมู่ 6", status: "pending" },
  { id: "RK151", name: "นายภาณุพงศ์ ใฝ่ใจ", address: "239 หมู่ 6", status: "pending" },
  { id: "RK152", name: "นายสมบูรณ์ ปิงเมือง", address: "243 หมู่ 6", status: "pending" },
  { id: "RK153", name: "นางนิตยา ใฝ่จิตต์", address: "245 หมู่ 6", status: "pending" },
  { id: "RK154", name: "นางจอมศรี นามจิต", address: "247 หมู่ 6", status: "pending" },
  { id: "RK155", name: "นายชิษณุพงษ์ ฟองทา", address: "274 หมู่ 6", status: "pending" },
  { id: "RK156", name: "นายอริยพล ขัติย์วงศ์", address: "275 หมู่ 6", status: "pending" },
  { id: "RK157", name: "นายศุภลัก สุพยน", address: "278 หมู่ 6", status: "pending" },
  { id: "RK158", name: "น.ส.ศิริลภัศ คำวงษา", address: "281 หมู่ 6", status: "pending" },
  { id: "RK159", name: "นายเกียรติพงษ์ ศักดิ์สูง", address: "282 หมู่ 6", status: "pending" },
  { id: "RK160", name: "น.ส.ไพลิน ใจชื่น", address: "287 หมู่ 6", status: "pending" },
  { id: "RK161", name: "นายพิชัย ใจดี", address: "288 หมู่ 6", status: "pending" },
  { id: "RK162", name: "นางปานหทัย สุวรรณรัตน์", address: "302 หมู่ 6", status: "pending" },
  { id: "RK163", name: "นายปรีชา ผัดดี", address: "308 หมู่ 6", status: "pending" },
  { id: "RK164", name: "นายจิติพันธ์ จำปา", address: "309 หมู่ 6", status: "pending" },
  { id: "RK165", name: "นายนพดล นามวงค์", address: "310 หมู่ 6", status: "pending" },
  { id: "RK166", name: "นายสงวน จันทร์มูล", address: "316 หมู่ 6", status: "pending" },
  { id: "RK167", name: "นางพร พลูคำ", address: "317 หมู่ 6", status: "pending" },
  { id: "RK168", name: "นายทวน ทาฤทธิ์", address: "325 หมู่ 6", status: "pending" },
  { id: "RK169", name: "น.ส.ถนิตา พัฒนกรวณิช", address: "329 หมู่ 6", status: "pending" },
  { id: "RK170", name: "นายสนธยา สารเชื้อ", address: "330 หมู่ 6", status: "pending" },
  { id: "RK171", name: "นายยงหยัด พลูคำ", address: "331 หมู่ 6", status: "pending" },
  { id: "RK172", name: "น.ส.อรพินฑ์ เครือวัลย์", address: "333 หมู่ 6", status: "pending" },
  { id: "RK173", name: "นายธนารินทร์ ทินนา", address: "336 หมู่ 6", status: "pending" },
  { id: "RK174", name: "นางวาสนา ศรีไชยอินทร์", address: "340 หมู่ 6", status: "pending" },
  { id: "RK175", name: "นางหล้า วงค์ขัติย์", address: "348 หมู่ 6", status: "pending" },
  { id: "RK176", name: "นางญาฐิกา ถิ่นลำปาง", address: "365 หมู่ 6", status: "pending" }
];

// ฟังก์ชันดึงข้อมูลสมาชิกทั้งหมด
function getRongkhemMembers() {
  const localData = localStorage.getItem(STORAGE_KEY);

  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      console.error("Error parsing local storage members:", e);
    }
  }

  // ถ้ายังไม่มีใน LocalStorage ให้บันทึกค่าเริ่มต้นเข้าไป
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(window.DEFAULT_MEMBERS)
  );

  return window.DEFAULT_MEMBERS;
}

// ฟังก์ชันค้นหาสมาชิกด้วย ID หรือ ชื่อ
function findMemberByIdOrName(query) {
  if (!query) return null;

  const members = getRongkhemMembers();
  const cleanQuery = query.trim().toLowerCase();

  return members.find(m =>
    m.id.toLowerCase() === cleanQuery ||
    m.name.toLowerCase().includes(cleanQuery)
  ) || null;
}
