export const NOTIFICATION_TRANSPORT = Symbol('NOTIFICATION_TRANSPORT');
export interface NotificationTransport {
  send(message: {
    recipient: string;
    text: string;
    signal: AbortSignal;
  }): Promise<void>;
}
export class NotificationTransportError extends Error {
  constructor(
    public readonly category:
      | 'TELEGRAM_UNAVAILABLE'
      | 'RATE_LIMITED'
      | 'TIMEOUT',
    public readonly retryAfterMs = 0,
  ) {
    super(category);
  }
}
