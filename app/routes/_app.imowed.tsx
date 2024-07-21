import { Box, Container, Title } from "@mantine/core";
import { PrismaClient } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/auth.server";
import DebtCard from "~/components/DebtCard";
const prisma = new PrismaClient();

export type CreditProps = {
  id: number;
  amount: number;
  creditorId: number;
  currency: string;
  title: string;
  description: string;
  isPaidInFull: boolean;
  debtorId: number;
  debtor: {
    name: string;
    surname: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
};

export async function loader({ request }: { request: Request }) {
  const sessionUser = await requireUser(request);
  const creditList = await prisma.debt.findMany({
    where: {
      creditorId: sessionUser.userId,
    },
    include: {
      debtor: {
        select: {
          name: true,
          surname: true,
          username: true,
        },
      },
    },
  });

  return { creditList };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const formId = formData.get("formId");

  if (formId === "cancelDebt") {
    const debtId = Number(formData.get("debtId"));
    await prisma.debt.delete({
      where: {
        id: debtId,
      },
    });
    return new Response(null, {
      status: 303,
      headers: { Location: "/imowed" },
    });
  }
}

export default function Imowed() {
  const { creditList } = useLoaderData<typeof loader>();
  console.log(creditList);
  return (
    <Box>
      {creditList.length > 0 ? (
        <Container>
          <Title order={2} ta="center" my="md">
            What people owe you
          </Title>
          {creditList.map((credit) => (
            <DebtCard key={credit.id} details={credit as CreditProps} />
          ))}
        </Container>
      ) : null}
    </Box>
  );
}
