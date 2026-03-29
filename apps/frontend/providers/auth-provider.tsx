"use client";

import { SessionProvider } from "next-auth/react";

export const NextAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <SessionProvider basePath="/api/auth">{children}</SessionProvider>;
};
