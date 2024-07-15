import { redirect } from "@remix-run/node";
import { commitSession, destroySession, getSession } from "./session.server";

export const USER_SESSION_KEY = "loginUser";
export async function requireUser(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(USER_SESSION_KEY);
  if (user) {
    return user;
  }

  throw await logout(request);
}

export async function createUserSession({
  request,
  user,
  redirectTo,
}: {
  request: Request;
  user: { id: number; email: string; username: string };
  redirectTo: string;
}) {
  const session = await getSession(request.headers.get("Cookie"));
  session.set(USER_SESSION_KEY, {
    userId: user.id,
    userEmail: user.email,
    userName: user.username,
  });
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
