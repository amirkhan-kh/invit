const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const limit = Number(process.argv[2] || 30);

(async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI topilmadi.');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  const rows = await mongoose.connection.collection('botlogs')
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  for (const row of rows.reverse()) {
    const time = row.createdAt ? new Date(row.createdAt).toISOString() : '';
    const user = row.username ? `@${row.username}` : row.userId || '';
    const payload = row.text || row.callbackData || '';
    const err = row.error?.message ? ` error="${row.error.message}"` : '';
    const ms = row.durationMs ? ` ${row.durationMs}ms` : '';
    console.log(`${time} ${row.level} ${row.event} ${row.updateType || ''} ${user} ${payload}${ms}${err}`);
  }

  await mongoose.disconnect();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
