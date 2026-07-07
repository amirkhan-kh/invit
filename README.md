# 💍 Seramony-Invit — Onlayn to'y taklifnomalari

Telegram bot orqali to'y taklifnomasi yasab, shaxsiy havola (`baxt.uz/farhodshirin`) beruvchi tizim.

- **Bot** ma'lumot yig'adi (ismlar, sana, manzil, matn, rasmlar) → **to'lov** → **shaxsiy havola**.
- **3 ta shablon**: Standart (110 000), Medium (170 000), Premium (200 000 so'm).
- Frontend har bir havolani `slug` bo'yicha API'dan yuklab, mos shablonni ko'rsatadi.

---

## 📁 Struktura

```
seramony-invit/
├── backend/                  Node + Express + Telegraf + MongoDB
│   ├── src/
│   │   ├── bot-app.ts        Telegram bot (start:bot)
│   │   ├── server.ts         REST API (start:api)
│   │   ├── config.ts         .env sozlamalari
│   │   ├── models/           Mongoose model
│   │   ├── bot/              Bot ssenariylari (create, payment)
│   │   ├── routes/           To'lov webhooklari (Click)
│   │   ├── services/         payment.service, photo.service
│   │   └── utils/            format.ts (validatsiya, slug)
│   ├── uploads/              Yuklangan rasmlar (runtime)
│   └── media/                Shablon namuna videolari (standard.mp4 ...)
└── frontend/                 React 19 + Vite + Tailwind
    └── src/
        ├── App.tsx           slug bo'yicha shablonni ko'rsatadi
        ├── components/templates/   standard / medium / premium
        ├── shared/           qayta ishlatiladigan komponentlar
        └── preview/          namuna ma'lumot (preview rejimi uchun)
```

---

## 🔧 1-QADAM: Talablar

- **Node.js 20+** — https://nodejs.org
- **MongoDB Atlas** akkaunti (bepul) — https://www.mongodb.com/cloud/atlas
- **Telegram bot tokeni** — [@BotFather](https://t.me/BotFather)

---

## 🗄 2-QADAM: MongoDB Atlas (bepul) sozlash

1. https://cloud.mongodb.com — ro'yxatdan o'ting.
2. **Create → Free (M0)** klaster yarating.
3. **Database Access** → **Add New Database User** → foydalanuvchi nomi va parol yarating (parolni oddiy belgilardan qiling, `@ $ / :` ishlatmang — aks holda URL-encode kerak bo'ladi).
4. **Network Access** → **Add IP Address** → `0.0.0.0/0` (hamma joydan ruxsat).
5. **Connect → Drivers** → connection string'ni nusxalang:
   ```
   mongodb+srv://FOYDALANUVCHI:PAROL@cluster0.xxxxx.mongodb.net/invitationDB?retryWrites=true&w=majority
   ```
6. Uni `backend/.env` ichidagi `MONGO_URI` ga qo'ying.

> ⚠️ Hozirgi `.env` dagi `MONGO_URI` ni men strukturasini tuzatdim (`$` → `@`), lekin **host nomi va parolni Atlas'dan tekshiring** — hozirgi klaster manzili (`invit.gvkfcrn...`) DNS'da topilmadi.

---

## 🤖 3-QADAM: Bot tokeni

1. [@BotFather](https://t.me/BotFather) → `/newbot` → nom bering → tokenni oling.
2. `backend/.env` dagi `BOT_TOKEN` ga qo'ying.

> 🔐 **Xavfsizlik:** eski token git tarixiga tushib qolgan edi. BotFather → `/revoke` orqali tokenni **yangilang** va yangisini `.env` ga yozing (`.env` endi git'ga tushmaydi).

---

## ▶️ 4-QADAM: Lokal ishga tushirish

> 💡 **Atlas hali tayyor emasmi?** Muammo yo'q — Docker o'rnatilgan bo'lsa,
> `.env` dagi `MONGO_URI` ni **bo'sh qoldiring** (yoki qatorni o'chiring).
> Kod avtomatik lokal MongoDB'ga (`mongodb://127.0.0.1:27017/invitationDB`) ulanadi.
> Lokal bazani ko'tarish uchun: `cd backend && npm run db:up` (to'xtatish: `npm run db:down`).
> Ma'lumot Docker volume'da saqlanadi — bot yaratgan taklifnomani frontend ko'radi.

Har birini **alohida terminalда** ishga tushiring:

```bash
# 1) Backend kutubxonalar (bir marta)
cd backend
npm install

# 1b) Lokal DB (Atlas o'rniga, ixtiyoriy)
npm run db:up

# 2) API server (port 5001)
npm run start:api

# 3) Telegram bot
npm run start:bot

# 4) Frontend (port 5173)
cd ../frontend
npm install
npm run dev
```

Endi Telegram'da botga `/start` yozing → shablon tanlang → ma'lumot kiriting → to'lov qiling → havola oling.

Havolani ko'rish: `http://localhost:5173/<slug>` (masalan `http://localhost:5173/farhodshirin`).

---

## 🧪 5-QADAM: To'lovni test qilish

To'lov **sandbox (test) rejimida** — real pul yechilmaydi.

- **Test kartasi:** `1234 5678 1234 5678` (yoki `.env` dagi `TEST_CARD`).
  Bu karta kiritilsa — to'lov **darhol to'liq** amalga oshadi (siz sinash uchun).
- **Oddiy oqim:** boshqa (Luhn bo'yicha to'g'ri) karta raqami, so'ng summa kiritiladi.
- **Qisman to'lov:** narxdan kam summa kiritsangiz — tizim qabul qiladi, qolgan summani hisoblab, keyingi to'lovda aynan shu summani taklif qiladi.

Backend mantig'ini test qilish:
```bash
cd backend
npm test        # 34 ta test (format, validatsiya, to'lov, API)
```

---

## 🎬 6-QADAM: Bot uchun shablon namuna videolari (MP4)

Bot `/start` da har bir shablonning **MP4 videosini** yuboradi (audio bilan). Yasash:

1. Frontend'ni ishga tushiring (`npm run dev`).
2. Brauzerda oching va ekranни yozib oling (topdan pastga scroll):
   - `http://localhost:5173/preview/standard`
   - `http://localhost:5173/preview/medium`
   - `http://localhost:5173/preview/premium`
3. Ekran yozish: **macOS** — QuickTime yoki `Cmd+Shift+5`. Telefon ko'rinishi uchun brauzer DevTools (F12) → mobil rejim.
4. Videolarni shunday nomlab `backend/media/` ga joylang:
   ```
   backend/media/standard.mp4
   backend/media/medium.mp4
   backend/media/premium.mp4
   ```
> Video bo'lmasa ham bot ishlaydi — faqat matn bilan tanlov ko'rsatadi.

Fon musiqasi: `frontend/public/audio/` ichiga `wedding-standard.mp3`, `wedding-medium.mp3`, `wedding-premium.mp3` joylang (qarang: shu papkadagi README.txt).

---

## 🚀 7-QADAM: Production deploy (doim ishlashi uchun)

Production uchun **bitta asosiy yo'l** ishlatiladi: frontend, API va bot webhook hammasi
Vercel'da. Bu rejimda terminal ochiq turishi shart emas. Telegram har bir xabarni
`/api/bot` webhook manziliga yuboradi, Vercel esa serverless funksiyani kerak bo'lganda
ishga tushiradi.

1. https://vercel.com → GitHub bilan kiring.
2. **Add New → Project** → repo'ni tanlang.
3. **Root Directory:** repo ildizi (`./`).
4. `vercel.json` build'ni o'zi boshqaradi: frontend build bo'ladi, `/api/*` esa serverless API bo'lib ishlaydi.
5. Vercel **Environment Variables** ga quyidagilarni kiriting:

   | Kalit | Qiymat |
   |-------|--------|
   | `BOT_TOKEN` | BotFather bergan production bot token |
   | `MONGO_URI` | MongoDB Atlas URI |
   | `BASE_URL` | Production domen, masalan `https://invit-silk.vercel.app` yoki `https://baxt.uz` |
   | `API_PUBLIC_URL` | `BASE_URL` bilan bir xil qiymat |
   | `TEST_CARD` | `1234567812345678` |

   `PORT` qo'shmang. Vercel serverless funksiyalar port ochmaydi.

6. Deploy tugagach webhookni ulang:
   ```bash
   cd backend
   npm run webhook:set
   npm run webhook:info
   ```

7. `webhook:info` natijasida `Webhook url: https://.../api/bot` chiqsa, bot productionda ulangan.

### Muhim

- Productionda `npm run prod:bot` ishlatilmaydi. U polling rejimi va faqat lokal/oddiy VPS test uchun.
- Bitta Telegram token bir vaqtda faqat bitta rejimda ishlaydi: **webhook yoki polling**.
- Agar production Vercel webhook ishlayotgan bo'lsa, Railway/VPS'dagi bot service'ni `Start/Restart` qilish kerak emas.
- Minglab user uchun ma'lumotlar MongoDB Atlas'da saqlanadi, bot sessiyalari ham `botsessions` kolleksiyasida turadi.

### Domen (baxt.uz)

1. Domenni Vercel → **Settings → Domains** ichida ulang.
2. Vercel env'da `BASE_URL=https://baxt.uz` va `API_PUBLIC_URL=https://baxt.uz` qiling.
3. Redeploy qiling.
4. Webhookni qayta ulang:
   ```bash
   cd backend
   npm run webhook:set
   ```

---

## 💳 8-QADAM: Real to'lovga o'tish (Click / Payme)

Hozir sandbox. Real pul qabul qilish uchun:
1. **Click** yoki **Payme** bilan merchant shartnoma tuzing (kompaniya/DYUYU kerak).
2. Ular beradi: `service_id`, `merchant_id`, `secret_key`.
3. `backend/src/routes/payment.ts` da webhook manzilini (`/api/payment/click/prepare` va `/complete`) Click kabinetiga ro'yxatdan o'tkazing va **imzo (md5 signature) tekshiruvini** yoqing.
4. Botdagi to'lov ssenariysini Click **to'lov havolasi** yuboradigan qilib o'zgartiring (karta raqamini o'zingiz so'ramaysiz — Click sahifasi so'raydi).

> ⚠️ **Qonuniy eslatma:** karta raqamini to'g'ridan-to'g'ri yig'ib pul yechish mumkin emas. Har doim Click/Payme kabi litsenziyalangan provayder orqali ishlang.

---

## 🔐 Xavfsizlik eslatmalari

- `.env` ni **hech qachon** commit qilmang (endi `.gitignore` da).
- Bot tokenini yangilang (git tarixiga tushgan edi).
- Atlas parolini kuchli qiling, `0.0.0.0/0` o'rniga deploy IP'sini qo'ying (imkon bo'lsa).

---

## 🧩 Foydali buyruqlar

| Buyruq | Vazifa |
|--------|--------|
| `npm run start:api` (backend) | API server (5001) |
| `npm run start:bot` (backend) | Telegram bot |
| `npm test` (backend) | 34 ta avtomatik test |
| `npm run typecheck` (backend) | TypeScript tekshiruvi |
| `npm run dev` (frontend) | Frontend dev server (5173) |
| `npm run build` (frontend) | Production build |

Preview: `http://localhost:5173/preview/{standard|medium|premium}`
