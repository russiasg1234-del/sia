# Dark Garage / Final Portfolio

เปิด `index.html` โดยตรงได้ ไม่ต้องเลือก GLB หรือรัน server ไลบรารี รูป และโมเดลฝัง/เก็บในเครื่องทั้งหมด ไม่มี CDN

## ฉาก

โรงรถ 8 × 8 หน่วย โทนถ่านและเทาเข้ม มีแสง cyan, shadow map, ACES tone mapping และ environment reflection สร้างโรงรถ โต๊ะ ชั้นวาง หุ่น และธงเองด้วย geometry ชั้นวางยังโล่งและไม่มีตู้เครื่องมือ ใช้ Barry เดิมและ McLaren ที่เตรียมผ่าน Blender

## เกณฑ์ Final

- ข้อมูลจริงจาก `D:\comgrap\sia.txt`: สิทธิศักดิ์ บุษบก, 6621650469, วิทยาการคอมพิวเตอร์, ศิลปศาสตร์และวิทยาศาสตร์, มหาวิทยาลัยเกษตรศาสตร์ ทุกบรรทัดเป็น mesh ตัวอักษร 3D มีความหนา ไม่ใช่แค่ข้อความ HTML หรือ texture บนระนาบ
- รูปที่ผู้ใช้ส่งอยู่ใน `portrait-data.js` เป็น texture ของกรอบรูปในฉาก
- PBR: คอนกรีต/ผนัง roughness และ bump, เหล็ก metalness, วัสดุ GLB รถ/Barry พร้อม environment
- Cel shading: หุ่นสร้างเองใช้ MeshToonMaterial + gradient map 4 ระดับ NearestFilter + inverted-hull outline; Barry สลับ PBR/Cel ได้และคืนวัสดุต้นฉบับได้
- Vertex shader: ธง grid 40 × 24 ขยับ vertex ตาม uniform เวลา มีขอบบนตรึงและปรับแรงลม/หยุดได้ รองรับ prefers-reduced-motion
- Picking: Raycaster บน mesh จริง 6 จุด — โปรไฟล์, จอ, รถ, Barry, หุ่น, ธง; มีเมนูคีย์บอร์ดสำรอง แยกคลิก/ลากกล้อง
- ผลงานจริงยังรอข้อมูลจากผู้ใช้ มีช่องว่าง 3 ช่อง ไม่ควรถือว่า Final ส่งครบจนกว่าจะใส่เนื้อหานี้และตรวจภาพจริง

## ไฟล์

`garage-progress.js` เป็นฐาน geometry ที่ทำไว้ก่อนหน้า `garage-final.js` ปรับ palette และเพิ่มส่วน Final `viewer.js` จัดแสง โมเดล กล้องและ interaction

`index-progress.html` + `viewer-progress.js` เก็บเวอร์ชันก่อนหน้าไว้เปิดดูได้ ไม่ได้ลบงานเดิม

McLaren โดย vecarz ใช้ CC BY-NC-SA 4.0 งานการศึกษาไม่แสวงหากำไรเท่านั้น ดู `credits.html` และ `assets/MCLAREN-LICENSE.md`

## ทดสอบ

รัน `node tests/final.test.cjs` เพื่อตรวจไฟล์/geometry/material/GLB/picking/interaction แบบ headless โดยใช้ Three จริงและ mock เฉพาะ canvas raster/DOM/GPU/texture image decoding การทดสอบนี้ไม่ใช่การยืนยันภาพหรือ shader compile ในเบราว์เซอร์จริง

ก่อนส่ง เปิดเว็บจริงตรวจแสง ความคมชัดภาษาไทย รูป texture รถ/Barry และการคลิกทั้งหกจุดบน desktop/mobile ดู `checklist.html`
