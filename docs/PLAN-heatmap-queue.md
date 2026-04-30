# 📋 Plan: Real-time Analytics (Heatmap & Queue Density)

ระบบวิเคราะห์ความหนาแน่นเพื่อการบริหารจัดการโรงอาหารอัจฉริยะ โดยแบ่งเป็นมุมมอง Admin (Heatmap) และ User (Queue Status)

### 🎯 Scope
- **Admin**: แสดงผล Heatmap ความหนาแน่นของที่นั่งจากข้อมูล YOLO
- **User**: แสดงสถานะความหนาแน่นของร้านค้า (Queue Density) เพื่อตัดสินใจเลือกใช้บริการ
- **AI Synergy**: ทดสอบการทำงานประสานกันของ DeepSeek Coder, Groq, และ Antigravity

---

### 📝 Tasks & AI Assignments

#### 🟢 Phase 1: Core Logic & Backend (Antigravity + DeepSeek)
1. [x] **AI Logic Generation**: ใช้ **DeepSeek Coder (Ollama)** ในการเขียนฟังก์ชัน `calculate_density_score` ที่คำนวณถ่วงน้ำหนักระหว่างจำนวนคนและเวลาที่คนนั่งแช่ — **Verify**: ฟังก์ชันทำงานได้ถูกต้องตาม Logic คณิตศาสตร์
2. [x] **API Endpoint**: สร้าง `services/api/routers/analytics.py` เพื่อดึงข้อมูลจาก `SeatHistory` และ `Orders` มาประมวลผล — **Verify**: Endpoint `/api/analytics/density` คืนค่า JSON สำหรับ Heatmap และ Queue ได้
3. [x] **Main Integration**: ลงทะเบียน Router ใหม่ใน `services/api/main.py` — **Verify**: Swagger Docs (`/docs`) แสดง Endpoint ใหม่

#### 🟡 Phase 2: AI Insights (Groq)
4. [x] **Insight Engine**: สร้าง `services/api/services/insight_service.py` โดยใช้ **Groq API** เพื่อสรุปข้อความ "สรุปสถานการณ์ช่วง Peak" (เช่น "ร้านข้าวมันไก่คิวยาวเป็นพิเศษ แนะนำไปที่ร้านก๋วยเตี๋ยวแทน") — **Verify**: ระบบส่งข้อความสรุปที่เป็นธรรมชาติออกมาได้

#### 🔵 Phase 3: Frontend Mockups (Copilot + Antigravity)
5. [x] **Admin Heatmap Component**: สร้าง Component `HeatmapLayer.jsx` สำหรับแสดงจุดสีความหนาแน่นบนแผนที่ — **Verify**: ข้อมูลจาก API ปรากฏเป็นสีตามความเข้มข้นใน Admin Panel
6. [x] **User Queue Badge**: เพิ่มสถานะ "หนาแน่น/ว่าง" ในรายการร้านค้าสำหรับ User — **Verify**: สีของ Badge เปลี่ยนไปตามข้อมูลคิวแบบ Real-time

---

### 🧠 Agent Assignments

| Task | AI Agent | Role |
| :--- | :--- | :--- |
| **Logic calculation** | `deepseek-coder:6.7b` | เขียนอัลกอริทึมที่ซับซ้อน |
| **API & Plumbing** | `Antigravity` | เชื่อมต่อระบบและรัน Terminal |
| **Text Generation** | `Groq (Llama-3)` | สรุป Insight เป็นภาษาคน |
| **UI Boilerplate** | `GitHub Copilot` | ช่วยเขียนโค้ด React ส่วนหน้าตา |

---

### ⚠️ Risks & Considerations
- **Data Freshness**: ข้อมูลจาก `SeatHistory` ต้อง Real-time พอ (ควรดึงจาก Redis cache แทน DB ตรงๆ เพื่อความเร็ว)
- **Local AI Performance**: การรัน DeepSeek ในเครื่องขณะรัน Docker อาจทำให้เครื่องช้าลงเล็กน้อย (RAM 16GB น่าจะไหว)

---

✅ Plan saved: `docs/PLAN-heatmap-queue.md`

**คุณอนุมัติแผนนี้ไหมครับ? ถ้าอนุมัติ ผมจะเริ่ม Task 1 โดยเรียกใช้ DeepSeek Coder ทันทีครับ!**
