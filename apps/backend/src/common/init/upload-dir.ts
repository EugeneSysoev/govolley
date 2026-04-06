import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export function ensureUploadsDir() {
  const dir = join(process.cwd(), 'public', 'uploads');

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}
