import { PrismaClient } from "@prisma/client";
import { requireUser } from "~/auth.server";
const prisma = new PrismaClient();

export async function action({ request }: { request: Request }) {
  const sessionUser = await requireUser(request);
  const formData = await request.json();
  const { amount, currency, description, title, receiver } = formData.values;
  const debtReceiver = await prisma.user.findUnique({
    where: {
      username: receiver,
    },
  });

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

  return new Response(null, {
    status: 303,
    headers: { Location: "/imowed" },
  });
}
