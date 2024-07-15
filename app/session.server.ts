// app/sessions.ts
import { createCookieSessionStorage } from "@remix-run/node"; // or cloudflare/deno

type SessionData = {
  loginUser: {
    userId: number;
    userEmail: string;
    userName: string;
  };
};

type SessionFlashData = {
  flashMessage: {
    type: string;
    message: string;
  };
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: {
      name: "__session",
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      secrets: ["s3cret1"],
    },
  });

export { getSession, commitSession, destroySession };
