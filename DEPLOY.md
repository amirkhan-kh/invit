# 🚀 Vercel deploy (frontend + bot + API)

Hammasi **bitta Vercel loyihasi**da ishlaydi — alohida Railway polling bot service kerak emas.

- **Frontend** (sayt) → Vercel statik hosting
- **API** (`/api/invitation`, `/api/photo`) → Vercel serverless funksiyalari
- **Bot** → Telegram **webhook** (`/api/bot`) — serverless (doim ishlab turishi shart emas)
- **Baza** → MongoDB Atlas (bepul, bor)
- **Sessiya** → MongoDB'da saqlanadi (`botsessions` kolleksiyasi) — Wizard bosqichlari serverless'da saqlanishi uchun

---

## 1-QADAM: Kodni GitHub'ga yuklash
```bash
git add -A && git commit -m "vercel serverless (webhook + api)"
git push origin main
```

## 2-QADAM: Vercel loyihasi
1. https://vercel.com → **Login with GitHub**.
2. **Add New → Project** → `amirkhan-kh/invit` repozitoriyni tanlang.
3. **Root Directory:** `./` (repo ildizi — o'zgartirmang).
4. Framework: **Other** (root `vercel.json` build'ni o'zi boshqaradi).
5. **Environment Variables** qo'shing:

   | Kalit | Qiymat |
   |-------|--------|
   | `BOT_TOKEN` | `.env` dagi token |
   | `MONGO_URI` | `.env` dagi Atlas satri |
   | `BASE_URL` | Vercel bergan domen (masalan `https://invit.vercel.app`) |
   | `API_PUBLIC_URL` | **xuddi shu** Vercel domeni |
   | `TEST_CARD` | `1234567812345678` |

   > `PORT` QO'SHMANG. `BASE_URL` va `API_PUBLIC_URL` — bir xil (Vercel domeningiz).
   > Domenni birinchi deploy'dan keyin bilib olib, keyin bu 2 qiymatni yangilab **Redeploy** qiling.

6. **Deploy** bosing.

## 3-QADAM: Atlas'ni ochish
Atlas → **Network Access** → **Allow Access from Anywhere** (`0.0.0.0/0`).

## 4-QADAM: Telegram webhook'ni ulash (bir marta)
Deploy tugagach, `backend/.env` ichida `BOT_TOKEN` va `BASE_URL` production qiymatlari turganini tekshiring.
Keyin:
```bash
cd backend
npm run webhook:set
```
Tekshirish:
```bash
npm run webhook:info
```
`Webhook url: https://<DOMAIN>/api/bot` va `Pending updates` ko'rinsa — tayyor.

Endi Telegram'da botga `/start` yozing → to'liq oqim Vercel'da ishlaydi. Havola: `https://<DOMAIN>/preview/<shablon>/<slug>`.

---

## ⚠️ Muhim: lokal (polling) ↔ prod (webhook)
Bitta bot tokeni **bir vaqtda** yo polling, yo webhook bo'ladi — ikkalasi birga emas.

- **Webhook o'rnatilgach**, lokal `npm run start:bot` yoki `npm run prod:bot` polling rejimi ishga tushmaydi.
- Lokalда yana test qilish uchun webhook'ni o'chiring:
  ```bash
  cd backend
  npm run webhook:delete
  ```
- **Tavsiya:** BotFather'da **ikkinchi bot** (dev uchun) oching — bittasi lokal polling, ikkinchisi prod webhook. `.env` da dev token, Vercel'da prod token.

## Domen (baxt.uz) — keyin
Vercel → **Settings → Domains** → `baxt.uz` qo'shing. Keyin `BASE_URL` va `API_PUBLIC_URL` ni `https://baxt.uz` qiling va webhook'ni yangi domenga qayta o'rnating.

## Rasm haqida
Foydalanuvchi rasmlari **Telegram'da qoladi**, disk kerak emas. Ular `/api/photo/<file_id>` orqali oqib beriladi (bot tokeni yashirin). Serverless bilan to'liq mos.
