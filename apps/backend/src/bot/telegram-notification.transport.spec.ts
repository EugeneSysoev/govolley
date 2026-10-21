import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { Telegraf } from 'telegraf';
import { TelegramNotificationTransport } from './telegram-notification.transport.js';

describe('Production Telegram adapter against controlled HTTP transport', () => {
  let server: Server;
  let transport: TelegramNotificationTransport;
  let response: 'success' | 'rate-limit' | 'failure' | 'stall' = 'success';
  const received: string[] = [];
  beforeAll(async () => {
    server = createServer((request, result) => {
      let body = '';
      request.on('data', (chunk: Buffer) => {
        body += chunk.toString();
      });
      request.on('end', () => {
        received.push(body);
        if (response === 'stall') return;
        result.setHeader('Content-Type', 'application/json');
        if (response === 'success')
          result.end(JSON.stringify({ ok: true, result: { message_id: 123 } }));
        else
          result.end(
            JSON.stringify({
              ok: false,
              error_code: response === 'rate-limit' ? 429 : 503,
              description: 'Sensitive external details',
              parameters: { retry_after: 120 },
            }),
          );
      });
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('Expected test listener');
    const bot = new Telegraf('fixture-token', {
      telegram: { apiRoot: `http://127.0.0.1:${address.port}` },
    });
    transport = new TelegramNotificationTransport(bot);
  });
  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
  const message = () => ({
    recipient: '123',
    text: 'Подтверждение',
    signal: new AbortController().signal,
  });
  it('sends the recipient and message through the real Telegraf API adapter', async () => {
    await expect(transport.send(message())).resolves.toBeUndefined();
    expect(JSON.parse(received[0])).toEqual({
      chat_id: '123',
      text: 'Подтверждение',
    });
  });
  it('turns Telegram retry_after into a safe rate-limit result', async () => {
    response = 'rate-limit';
    await expect(transport.send(message())).rejects.toMatchObject({
      category: 'RATE_LIMITED',
      retryAfterMs: 120000,
      message: 'RATE_LIMITED',
    });
  });
  it('does not leak external failure details', async () => {
    response = 'failure';
    await expect(transport.send(message())).rejects.toMatchObject({
      category: 'TELEGRAM_UNAVAILABLE',
      message: 'TELEGRAM_UNAVAILABLE',
    });
  });
  it('aborts the real underlying request instead of leaving an unbounded network send', async () => {
    response = 'stall';
    await expect(
      transport.send({ ...message(), signal: AbortSignal.timeout(30) }),
    ).rejects.toMatchObject({ category: 'TIMEOUT' });
  });
});
