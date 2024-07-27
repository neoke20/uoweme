import { PrismaClient } from "@prisma/client";
import { json } from "@remix-run/node";
import { requireUser } from "~/auth.server";
import { commitSession, getSession } from "~/session.server";
const prisma = new PrismaClient();

export async function action({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const sessionUser = await requireUser(request);
  const formData = await request.json();
  const { amount, currency, description, title, receiver } = formData.values;
  const debtReceiver = await prisma.user.findUnique({
    where: {
      username: receiver,
    },
  });

  let errorCount = 0;

  try {
    await prisma.debtRequest.create({
      data: {
        amount: Number(amount),
        currency,
        description,
        title,
        debtorId: debtReceiver?.id as unknown as number,
        creditorId: sessionUser.userId,
      },
    });
  } catch (error) {
    errorCount++;
  }

  if (errorCount > 0) {
    session.flash("flashMessage", {
      type: "error",
      message: `Could not send the request to ${receiver}.`,
    });
  } else {
    session.flash("flashMessage", {
      type: "success",
      message: `Debt request sent successfully to ${receiver}.`,
    });
  }
  return json(
    {
      errorCount: errorCount,
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
        "Access-Control-Allow-Origin": "https://uoweme.netlify.app",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
