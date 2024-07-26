import { Currency, PrismaClient } from "@prisma/client";
import { json } from "@remix-run/node";
import { commitSession, getSession } from "~/session.server";
const prisma = new PrismaClient();

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { requestId: string };
}) {
  const session = await getSession(request.headers.get("Cookie"));
  const requestId = params.requestId;

  let errorCount = 0;

  try {
    await prisma.debtRequest.update({
      where: {
        id: Number(requestId),
      },
      data: {
        isAccepted: true,
      },
    });

    const debtRequest = await prisma.debtRequest.findUnique({
      where: {
        id: Number(requestId),
      },
    });

    await prisma.debt.create({
      data: {
        amount: debtRequest?.amount as number,
        creditorId: debtRequest?.creditorId as number,
        debtorId: debtRequest?.debtorId as number,
        currency: debtRequest?.currency as Currency,
        title: debtRequest?.title as string,
        description: debtRequest?.description as string,
        isPaidInFull: false,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    errorCount++;
  }

  if (errorCount > 0) {
    session.flash("flashMessage", {
      type: "error",
      message: `Could not accept the request.`,
    });
  } else {
    session.flash("flashMessage", {
      type: "success",
      message: `Debt request accepted successfully.`,
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
