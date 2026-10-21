// Fresh process fixture: exact production driver, no bot module or live Telegram.
import { PrismaService } from '../apps/backend/dist/src/prisma/prisma.service.js';
import { NotificationDeliveryDriver } from '../apps/backend/dist/src/notifications/notification-delivery.js';
const url = process.env.TEST_DATABASE_URL;
const target = url && new URL(url);
if (!target || !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) || !target.pathname.endsWith('_test')) throw new Error('Dedicated local test database required');
process.env.DATABASE_URL = url;
const db = new PrismaService();
const mode = process.argv[2];
const messages = [];
const transport = { async send(message) {
  messages.push({ text: message.text, recipient: message.recipient });
  if (mode === 'crash') {
    process.send?.({ claimed: true });
    await new Promise(() => {});
  }
} };
const driver = new NotificationDeliveryDriver(db, transport, { now: () => Number(process.env.TEST_NOTIFICATION_NOW || Date.now()) });
try {
  await db.onModuleInit();
  await driver.dispatchDue();
  process.send?.({ messages });
} finally { await db.onModuleDestroy(); }
