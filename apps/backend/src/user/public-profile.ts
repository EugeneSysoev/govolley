import type { User } from '@prisma/client';
import { isAvatarKey } from './avatar-storage.service.js';
export function avatarUrl(
  user: Pick<User, 'image' | 'avatarKey'>,
): string | null {
  if (user.avatarKey && isAvatarKey(user.avatarKey))
    return `/uploads/${user.avatarKey}`;
  // Legacy values are display-only, never used for filesystem operations.
  return user.image &&
    /^\/uploads\/avatar-\d+-\d+\.(jpg|jpeg|png|webp)$/.test(user.image)
    ? user.image
    : null;
}
export function publicProfile(user: User) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    image: avatarUrl(user),
    role: user.role,
    balance: user.balance,
    skillLevel: user.skillLevel,
    isLevelVerified: user.isLevelVerified,
    createdAt: user.createdAt.toISOString(),
  };
}
