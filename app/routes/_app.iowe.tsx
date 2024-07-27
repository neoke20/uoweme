import { Box, Button, Title } from "@mantine/core";
import { PrismaClient } from "@prisma/client";
import { json, useLoaderData } from "@remix-run/react";
import { FiHardDrive, FiInfo } from "react-icons/fi";
import { requireUser } from "~/auth.server";
import DebtCard from "~/components/DebtCard";
import { commitSession, getSession } from "~/session.server";
const prisma = new PrismaClient();

export type DebtProps = {
  id: number;
  amount: number;
  currency: string;
  title: string;
  description: string;
  isPaidInFull: boolean;
  createdAt: Date;
  creditor: {
    username: string;
  };
  DebtPaymentRequest: {
    id: number;
    amount: number;
    createdAt: Date;
    isAccepted: boolean;
  }[];
};

export async function loader({ request }: { request: Request }) {
  const sessionUser = await requireUser(request);

  const debitList = await prisma.debt.findMany({
    where: {
      debtorId: sessionUser.userId,
      isPaidInFull: false,
    },
    include: {
      creditor: {
        select: {
          username: true,
        },
      },
      DebtPaymentRequest: true,
    },
  });

  const pendingDebitList = await prisma.debtRequest.findMany({
    where: {
      debtorId: sessionUser.userId,
      isAccepted: false,
    },
    include: {
      creditor: {
        select: {
          username: true,
        },
      },
    },
  });

  return { pendingDebitList, debitList };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const formId = formData.get("formId");
  const session = await getSession(request.headers.get("Cookie"));

  let errorCount = 0;

  if (formId === "paidInFull") {
    const { debtId } = Object.fromEntries(formData);
    const currentDebt = await prisma.debt.findUnique({
      where: {
        id: parseInt(debtId as string),
      },
    });
    if (!currentDebt) {
      return new Response("Debt not found", { status: 404 });
    } else {
      await prisma.debtPaymentRequest.create({
        data: {
          debtId: parseInt(debtId as string),
          debtorId: currentDebt.debtorId,
          amount: currentDebt.amount,
        },
      });
    }
  }

  if (formId === "paidPartially") {
    const { partialAmount, debtId } = Object.fromEntries(formData);
    if (partialAmount == "0") {
      session.flash("flashMessage", {
        type: "error",
        message: `Partial amount cannot be 0.`,
      });
      return json(
        {},
        {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    }
    const currentDebt = await prisma.debt.findUnique({
      where: {
        id: parseInt(debtId as string),
      },
    });
    if (!currentDebt) {
      return new Response("Debt not found", { status: 404 });
    } else {
      try {
        await prisma.debtPaymentRequest.create({
          data: {
            debtId: parseInt(debtId as string),
            debtorId: currentDebt?.debtorId,
            amount: parseInt(partialAmount as string),
          },
        });
      } catch (error) {
        errorCount++;
      }

      if (errorCount > 0) {
        session.flash("flashMessage", {
          type: "error",
          message: `Could not send payment request.`,
        });
      } else {
        session.flash("flashMessage", {
          type: "success",
          message: `Payment request sent successfully.`,
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
  }
  return null;
}

export default function Iowe() {
  const { pendingDebitList, debitList } = useLoaderData<typeof loader>();

  return (
    <div>
      <Title order={2} ta="center" my="md">
        What I owe
      </Title>
      <Button
        fullWidth
        mb="sm"
        color="platinum.9"
        leftSection={<FiHardDrive />}
        component="a"
        href="iowe/history"
      >
        History
      </Button>
      {pendingDebitList.length > 0 ? (
        <Button
          fullWidth
          color="platinum.4"
          leftSection={<FiInfo />}
          component="a"
          href="/iowe/pending-requests"
        >
          Pending Requests
        </Button>
      ) : null}
      {debitList.length > 0 &&
        debitList.map((debt) => (
          <Box key={debt.id} my="md">
            <DebtCard debt={debt as unknown as DebtProps} />
          </Box>
        ))}
    </div>
  );
}
