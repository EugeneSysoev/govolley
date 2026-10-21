import { Test } from '@nestjs/testing';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import type { User } from '@prisma/client';
import { UsersService } from './users.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AvatarStorage } from './avatar-storage.service.js';

describe('avatar replacement and failure cleanup', () => {
  let root: string;
  let storage: AvatarStorage;
  let service: UsersService;
  const file: Express.Multer.File = {
    buffer: Buffer.from('fixture'),
    mimetype: 'image/png',
    originalname: 'image.png',
    fieldname: 'image',
    encoding: '7bit',
    size: 7,
    stream: Readable.from([]),
    destination: '',
    filename: '',
    path: '',
  };
  const user: User = {
    id: 1,
    firstName: null,
    lastName: null,
    username: null,
    telegramId: null,
    image: '/uploads/../../sentinel',
    avatarKey: null,
    balance: 0,
    role: 'USER',
    skillLevel: 'BEGINNER',
    isLevelVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const update = jest.fn();
  beforeEach(async () => {
    jest.clearAllMocks();
    root = await fs.mkdtemp(path.join(tmpdir(), 'govolley-profile-'));
    storage = new AvatarStorage(path.join(root, 'uploads'));
    user.avatarKey = await storage.store(file);
    await fs.writeFile(path.join(root, 'sentinel'), 'keep');
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([user]),
      user: { update },
    };
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: AvatarStorage, useValue: storage },
        {
          provide: PrismaService,
          useValue: {
            $transaction: (run: (transaction: typeof tx) => Promise<User>) =>
              run(tx),
            user: { count: jest.fn().mockResolvedValue(0) },
          },
        },
      ],
    }).compile();
    service = module.get(UsersService);
  });
  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true });
  });
  it('keeps the current avatar and removes the new file if the database update fails', async () => {
    update.mockRejectedValueOnce(new Error('fixture database failure'));
    await expect(
      service.updateProfile(1, { firstName: 'Player' }, file),
    ).rejects.toThrow('fixture database failure');
    expect(await fs.readdir(path.join(root, 'uploads'))).toEqual([
      user.avatarKey,
    ]);
    expect(await fs.readFile(path.join(root, 'sentinel'), 'utf8')).toBe('keep');
  });
  it('publishes the new avatar before removing the old one and never returns its internal key', async () => {
    const oldKey = user.avatarKey;
    update.mockImplementationOnce(
      async ({ data }: { data: { avatarKey: string } }) => {
        expect(await fs.readdir(path.join(root, 'uploads'))).toContain(oldKey);
        return { ...user, ...data };
      },
    );
    const result = await service.updateProfile(1, {}, file);
    expect(result.image).toMatch(/^\/uploads\/avatar-/);
    expect(result).not.toHaveProperty('avatarKey');
    expect(result.isLevelVerified).toBe(true);
    expect(await fs.readdir(path.join(root, 'uploads'))).not.toContain(oldKey);
  });
  it('leaves legacy paths untouched during replacement', async () => {
    user.avatarKey = null;
    update.mockImplementationOnce(({ data }: { data: { avatarKey: string } }) =>
      Promise.resolve({ ...user, ...data }),
    );
    await service.updateProfile(1, {}, file);
    expect(await fs.readFile(path.join(root, 'sentinel'), 'utf8')).toBe('keep');
  });
});
