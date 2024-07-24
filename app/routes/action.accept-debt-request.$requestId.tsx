import { Currency, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function action({ params }: { params: { requestId: string } }) {
  const requestId = params.requestId;

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

  return null;
}
