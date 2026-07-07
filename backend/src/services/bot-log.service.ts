import mongoose from 'mongoose';

type LogLevel = 'info' | 'error';

function logs() {
  return mongoose.connection.collection('botlogs');
}

function safeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack?.slice(0, 2000),
    };
  }
  return { message: String(error) };
}

export async function writeBotLog(level: LogLevel, event: string, data: Record<string, unknown> = {}) {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.error('Bot log DB ulanmagan:', { level, event, ...data });
      return;
    }
    await logs().insertOne({
      level,
      event,
      ...data,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Bot log yozishda xato:', error);
  }
}

export async function writeBotError(event: string, error: unknown, data: Record<string, unknown> = {}) {
  await writeBotLog('error', event, { ...data, error: safeError(error) });
}
