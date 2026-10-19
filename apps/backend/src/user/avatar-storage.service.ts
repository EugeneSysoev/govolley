import {
  BadRequestException,
  Inject,
  Injectable,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type {} from 'multer';
const keyPattern =
  /^avatar-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(png|jpg|webp)$/;
export function isAvatarKey(key: string): boolean {
  return keyPattern.test(key);
}
@Injectable()
export class AvatarStorage {
  private readonly directory: string;
  constructor(@Optional() @Inject('AVATAR_DIRECTORY') directory?: string) {
    this.directory = path.resolve(
      directory ?? path.join(process.cwd(), 'public', 'uploads'),
    );
  }
  async store(file: Express.Multer.File): Promise<string> {
    const extensions: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
    };
    const extension = extensions[file.mimetype];
    if (!extension || file.buffer.length > 5 * 1024 * 1024)
      throw new BadRequestException('Недопустимый файл');
    const key = `avatar-${randomUUID()}.${extension}`;
    await fs.mkdir(this.directory, { recursive: true });
    const root = await fs.realpath(this.directory);
    const target = this.containedPath(root, key);
    try {
      await fs.writeFile(target, file.buffer, { flag: 'wx' });
    } catch (error) {
      if (
        !(error instanceof Error && 'code' in error && error.code === 'EEXIST')
      ) {
        await this.remove(key);
      }
      throw error;
    }
    return key;
  }
  async remove(key: string): Promise<void> {
    if (!isAvatarKey(key)) return; // Includes legacy paths, both separators, drives, encoding and NUL.
    try {
      const root = await fs.realpath(this.directory);
      const target = this.containedPath(root, key);
      const stat = await fs.lstat(target);
      if (!stat.isFile() || stat.isSymbolicLink()) return;
      const actual = await fs.realpath(target);
      if (actual !== target) return;
      await fs.unlink(target);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
        return;
      throw error;
    }
  }
  private containedPath(root: string, key: string): string {
    if (!isAvatarKey(key))
      throw new BadRequestException('Недопустимый ключ аватара');
    const target = path.resolve(root, key);
    const relative = path.relative(root, target);
    if (
      !relative ||
      relative === '..' ||
      relative.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relative) ||
      path.dirname(target) !== root
    )
      throw new BadRequestException('Недопустимый путь аватара');
    return target;
  }
}
