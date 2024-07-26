import { PrismaClient } from "@prisma/client";
import { json } from "@remix-run/node";
import { commitSession, getSession } from "~/session.server";
const prisma = new PrismaClient();

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  const session = await getSession(request.headers.get("Cookie"));
  const requestId = params.id;

  let errorCount = 0;

  try {
    await prisma.debtRequest.delete({
      where: {
        id: Number(requestId),
      },
    });
  } catch (error) {
    errorCount++;
  }

  if (errorCount > 0) {
    session.flash("flashMessage", {
      type: "error",
      message: `Could not cancel the request.`,
    });
  } else {
    session.flash("flashMessage", {
      type: "success",
      message: `Debt request cancelled successfully.`,
    });
  }
  return json(
    {
      errorCount: errorCount,
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}
