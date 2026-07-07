import { app } from './app';
import { connectDB } from './db';
import { config } from './config';

function listen(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const server = app.listen(port);
    server.once('listening', () => resolve());
    server.once('error', (err) => reject(err));
  });
}

// Lokal (va oddiy server) rejimi — Vercel'da bu ishlamaydi, u api/ funksiyasidan foydalanadi.
async function main() {
  await connectDB();
  console.log('✅ API: MongoDB-ga ulandi');

  const PORT = config.port;
  await listen(PORT);
  console.log(`🚀 API Server ${PORT}-portda ishlamoqda`);
}

main().catch((err) => {
  console.error('❌ API serverni ishga tushirishda xato:', err);
  process.exit(1);
});
