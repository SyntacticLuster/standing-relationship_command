import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { redirect } from "next/navigation";

export const auth0 = new Auth0Client();

export type AppUser = {
  sub: string;
  email: string | null;
  displayName: string;
};

export async function getUser(): Promise<AppUser | null> {
  const session = await auth0.getSession();
  if (!session) return null;
  const { sub, email, name } = session.user;
  return {
    sub,
    email: email ?? null,
    displayName: name ?? email ?? sub,
  };
}

export async function requireUser(): Promise<AppUser> {
  const user = await getUser();
  if (user) return user;
  redirect("/auth/login");
}
