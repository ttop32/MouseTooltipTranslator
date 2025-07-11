# วิธีใช้


- การใช้งานพื้นฐาน: โฮเวอร์เหนือหรือเลือกข้อความ (ไฮไลต์) เพื่อแปล
  - ทดสอบโฮเวอร์ด้วยตัวอย่างข้อความ:
```console

Proletarier aller Länder, vereinigt euch!

```

  - หากการแปลไม่ทำงานให้ตรวจสอบภาษาเป้าหมายปัจจุบัน
    - ตรวจสอบ [วิธีการเปลี่ยนภาษา] (https://github.com/ttop32/mousetooltiptranslator/blob/main/doc/intro.md#change-language)
    - นักแปลนี้จะละเว้นข้อความหากภาษาแหล่งที่มาและเป้าหมายเหมือนกัน


![Alt Text](/doc/reagre.gif)



- กดปุ่ม <kbd> left-ctrl </kbd> เพื่อฟังการออกเสียง TTS เมื่อคำแนะนำเครื่องมือปรากฏขึ้น กด <kbd> ESC </kbd> เพื่อหยุดเสียง
  - ลองกดสองครั้ง <kbd> ซ้าย ctrl </kbd> เพื่อฟังข้อความผลลัพธ์ที่แปล
![result](/doc/20.gif)



- กดปุ่ม <kbd> ขวา </kbd> เพื่อแปลข้อความที่คุณกำลังเขียน (หรือข้อความที่ไฮไลต์ใด ๆ ) ในกล่องอินพุต หากจำเป็นคุณสามารถยกเลิกการดำเนินการได้โดยกด <kbd> CTRL </kbd> + <kbd> Z </kbd>
  - หากการแปลไม่ทำงานตรวจสอบให้แน่ใจว่าภาษาเป้าหมายปัจจุบันของคุณตรงกับภาษาการเขียนของคุณ
  - ถ้า <kbd> Right-Alt </kbd> ใช้เป็น Hangul swap
ใช้คีย์อื่น ๆ เพื่อทำงานด้วย


![result](/doc/11.gif)



- แปลข้อความกล่องค้นหา URL โดยพิมพ์ <kbd>/</kbd>+<kbd> Space </kbd> ก่อนการสืบค้นของคุณ


![result](/doc/21.gif)



- สนับสนุน PDF ออนไลน์เพื่อแสดงคำแนะนำเครื่องมือที่แปลโดยใช้ PDF.JS (ไฟล์ PDF คอมพิวเตอร์ท้องถิ่นต้องการสิทธิ์เพิ่มเติมดู [ข้อยกเว้น] (https://github.com/ttop32/mousetooltiptranslator/blob/main/doc/intro.md#exception)))


![result](/doc/12.gif)



- รองรับคำบรรยายคู่สำหรับ YouTube และ Netflix


![result](/doc/16.gif)



- ประมวลผล OCR เมื่อถือ <kbd>-shift </kbd> key + mouse บนภาพ (เช่นมังงะ)


![result](/doc/15.gif)



- เรียกใช้เครื่องอ่านอัตโนมัติโดยกด <kbd> f2 </kbd> คีย์
  - มันเริ่มอ่านเมาส์ผ่านข้อความตลอดทางด้วย TTS
  - หากต้องการหยุดเครื่องอ่านอัตโนมัติกด <kbd> ESC </kbd>
  - ลองกดสองครั้ง <kbd> f2 </kbd> เพื่อฟังการแปลข้อความผลลัพธ์การแปล Auto Reader


![result](/doc/30.gif)



- เปิดใช้งานตัวแปลการจดจำคำพูดโดยกดปุ่ม <kbd> Right-CTRL </kbd> ค้างไว้
  - ภาษาการจดจำคำพูดเริ่มต้นเป็นภาษาอังกฤษ
  - หากภาษาการจดจำคำพูดและภาษาเป้าหมายเหมือนกันมันจะข้าม
  - จำเป็นต้องได้รับอนุญาตจากเสียง
  - เข้ากันได้เฉพาะกับเบราว์เซอร์ที่ใช้โครเมียมเช่น Google Chrome, MS-Edge, Vivaldi, Opera, Brave, Arc และ Yandex
- ปรับแต่งคีย์ทางลัด
  - จาก Chrome: // ส่วนขยาย/ทางลัดหรือหน้าการกำหนดค่าภายในเบราว์เซอร์เทียบเท่าสามารถเข้าถึงได้โดยการแทนที่ Chrome: // ด้วย URL ภายในของเบราว์เซอร์ (เช่นขอบ: //, เบราว์เซอร์: // หรือกล้าหาญ: // etc)
# เปลี่ยนภาษา
- เปลี่ยนภาษาปัจจุบันในหน้าการตั้งค่า
  - หน้าการตั้งค่าสามารถเข้าถึงได้โดยคลิกปุ่มปริศนา (ส่วนขยาย) ที่อยู่ด้านบนขวาของเบราว์เซอร์ของคุณ


![result](/doc/14.gif)





# ข้อยกเว้น


- หากภาษาข้อความต้นฉบับและภาษาแปลเหมือนกันมันจะข้าม
- หากไม่ได้โฟกัสหน้าเว็บจะไม่พบอินพุตคีย์
คลิกเพื่อโฟกัสหน้าคีย์บอร์ดอินพุต
- แอปพลิเคชันจะไม่ทำงานหากสถานะเว็บออฟไลน์
- หากเว็บไซต์คือ <https://chrome.google.com/extensions> มันไม่ทำงานเพราะเหตุผลด้านความปลอดภัยของโครเมี่ยม
- หากไม่ได้รับอนุญาตไฟล์ในพื้นที่ไม่สามารถจัดการ PDF ในพื้นที่ได้
  - หากไฟล์ไม่เปิดให้ลองลากและวางลงบนแท็บ
  - มันจะแสดงคำเตือนการอนุญาตและเปลี่ยนเส้นทางไปยังหน้าการอนุญาต
  - ในหน้าเปลี่ยนเส้นทางตรวจสอบให้แน่ใจว่าคุณเลือก "อนุญาตให้เข้าถึง URL ไฟล์" เพื่อเข้าถึงไฟล์
  - เปิด PDF อีกครั้งเพื่อส่งผลกระทบทันที
![result](/doc/10.gif)
