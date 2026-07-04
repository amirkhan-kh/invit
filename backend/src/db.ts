import mongoose from 'mongoose';
import { config } from './config';

// Serverless (Vercel) muhitida funksiya qayta-qayta chaqiriladi — har safar
// yangi ulanish ochmaslik uchun ulanishni global keshda saqlaymiz.
type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const g = globalThis as unknown as { _mongooseCache?: Cache };
const cache: Cache = g._mongooseCache || (g._mongooseCache = { conn: null, promise: null });

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
