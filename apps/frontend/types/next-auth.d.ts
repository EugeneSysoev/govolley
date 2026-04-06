import NextAuth, { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";
import { Role, SkillLevel } from "shared-types";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      role: Role;
      skillLevel: SkillLevel;
      balance: number;
      isLevelVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: number;
    role: Role;
    skillLevel: SkillLevel;
    balance: number;
    isLevelVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: number;
    role: Role;
    skillLevel: SkillLevel;
    balance: number;
    isLevelVerified: boolean;
  }
}
