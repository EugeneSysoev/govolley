import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "COACH" | "ADMIN";
      skillLevel: "NOT_SET" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
      balance: number;
      isLevelVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "USER" | "COACH" | "ADMIN";
    skillLevel: "NOT_SET" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    balance: number;
    isLevelVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "COACH" | "ADMIN";
    skillLevel: "NOT_SET" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    balance: number;
    isLevelVerified: boolean;
  }
}
