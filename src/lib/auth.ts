import "server-only";

import { getServerSession } from "next-auth";

import { authOptions } from "@/features/auth/auth-options";
import { findActiveUserById } from "@/features/auth/repositories/user-repository";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await findActiveUserById(session.user.id);
  if (!user || user.sessionVersion !== session.user.sessionVersion) return null;
  return user;
}
