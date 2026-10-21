import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { AvatarStorage } from './avatar-storage.service.js';

describe('avatar filesystem containment', () => {
  let root: string;
  let storage: AvatarStorage;
  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(tmpdir(), 'govolley-avatar-'));
    storage = new AvatarStorage(path.join(root, 'uploads'));
  });
  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true });
  });
  it.each([
    '../sentinel',
    '..\\sentinel',
    '/uploads/../../sentinel',
    'C:\\Windows\\win.ini',
    '/etc/passwd',
    '\\\\server\\file',
    'avatar-1-1.jpg',
    '%2e%2e%2fsentinel',
    'avatar-1.jpg\0.png',
  ])('ignores untrusted key %s', async (key) => {
    await fs.writeFile(path.join(root, 'sentinel'), 'keep');
    await storage.remove(key);
    expect(await fs.readFile(path.join(root, 'sentinel'), 'utf8')).toBe('keep');
  });
  it('generates a key independently of originalname and deletes only its own file', async () => {
    const file: Express.Multer.File = {
      buffer: Buffer.from('fixture'),
      mimetype: 'image/png',
      originalname: '../../outside.exe',
      fieldname: 'image',
      encoding: '7bit',
      size: 7,
      stream: Readable.from([]),
      destination: '',
      filename: '',
      path: '',
    };
    const key = await storage.store(file);
    expect(key).toMatch(/^avatar-[0-9a-f-]+\.png$/);
    expect(await fs.readFile(path.join(root, 'uploads', key), 'utf8')).toBe(
      'fixture',
    );
    await storage.remove(key);
    await expect(
      fs.stat(path.join(root, 'uploads', key)),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });
});
