# Dark Garage / Final Portfolio

เปิด `index.html` โดยตรงได้ ไม่ต้องเลือก GLB หรือรัน server ไลบรารี รูป และโมเดลฝัง/เก็บในเครื่องทั้งหมด ไม่มี CDN

## ฉาก

โรงรถ 8 × 8 หน่วย โทนถ่านและเทาเข้ม มีแสง cyan, shadow map, ACES tone mapping และ environment reflection สร้างโรงรถ โต๊ะ ชั้นวาง และธงเองด้วย geometry ชั้นวางยังโล่งและไม่มีตู้เครื่องมือ ใช้ Barry เดิมและ McLaren ที่เตรียมผ่าน Blender Robot และระบบแสดงป้ายลอยถูกนำออกตามคำขอ

## เกณฑ์ Final

- ข้อมูลจริงจาก `D:\comgrap\sia.txt`: สิทธิศักดิ์ บุษบก, 6621650469, วิทยาการคอมพิวเตอร์, ศิลปศาสตร์และวิทยาศาสตร์, มหาวิทยาลัยเกษตรศาสตร์ ทุกบรรทัดเป็น mesh ตัวอักษร 3D มีความหนา ไม่ใช่แค่ข้อความ HTML หรือ texture บนระนาบ
- รูปที่ผู้ใช้ส่งอยู่ใน `portrait-data.js` เป็น texture ของกรอบรูปในฉาก
- PBR: คอนกรีต/ผนัง roughness และ bump, เหล็ก metalness, วัสดุ GLB รถ/Barry พร้อม environment
- Cel shading: คลิก Barry แล้วสลับเป็น Cel shading ใช้ MeshToonMaterial + gradient map 4 ระดับ NearestFilter พร้อม texture เดิม และกลับวัสดุ PBR ต้นฉบับได้
- Vertex shader: ธง grid 40 × 24 ขยับ vertex ตาม uniform เวลา มีขอบบนตรึงและปรับแรงลม/หยุดได้ รองรับ prefers-reduced-motion
- Picking: Raycaster บน mesh จริง 5 จุด — โปรไฟล์, จอ, รถ, Barry, ธง; มีเมนูคีย์บอร์ดสำรอง แยกคลิก/ลากกล้อง
- ผลงานจริงครบ 3 ลิงก์ที่ผู้ใช้ส่ง: Electrode (Desmos), My Paint (Assignment 2), Barry Burton (Character PBR) คลิกจอคอม/เมนูผลงานเพื่อเปิดการ์ดและลิงก์ในแท็บใหม่

## ไฟล์

`garage-progress.js` เป็นฐาน geometry ที่ทำไว้ก่อนหน้า `garage-final.js` ปรับ palette และเพิ่มส่วน Final `viewer.js` จัดแสง โมเดล กล้องและ interaction

`projects-data.js` เก็บชื่อ คำอธิบาย เครื่องมือ และลิงก์ของผลงานทั้งสาม การเปิดฉากในเครื่องไม่ต้องใช้อินเทอร์เน็ต แต่ลิงก์ผลงานไปเว็บไซต์จริงต้องเชื่อมต่ออินเทอร์เน็ต

`index-progress.html` + `viewer-progress.js` เก็บเวอร์ชันก่อนหน้าไว้เปิดดูได้ ไม่ได้ลบงานเดิม

McLaren โดย vecarz ใช้ CC BY-NC-SA 4.0 งานการศึกษาไม่แสวงหากำไรเท่านั้น ดู `credits.html` และ `assets/MCLAREN-LICENSE.md`

## ทดสอบ

รัน `node tests/final.test.cjs` เพื่อตรวจไฟล์/geometry/material/GLB/picking/interaction แบบ headless โดยใช้ Three จริงและ mock เฉพาะ canvas raster/DOM/GPU/texture image decoding การทดสอบนี้ไม่ใช่การยืนยันภาพหรือ shader compile ในเบราว์เซอร์จริง

ก่อนส่ง เปิดเว็บจริงตรวจแสง ความคมชัดภาษาไทย รูป texture รถ/Barry และการคลิกทั้งห้าจุดบน desktop/mobile ดู `checklist.html`
