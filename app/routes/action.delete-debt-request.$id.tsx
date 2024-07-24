import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function action({ params }: { params: { id: string } }) {
  const requestId = params.id;

  await prisma.debtRequest.delete({
    where: {
      id: Number(requestId),
    },
  });

  return {
    status: 200,
  };
}
