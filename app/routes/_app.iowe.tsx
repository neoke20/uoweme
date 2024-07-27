import { Box, Button, Drawer, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PrismaClient } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { FiHardDrive, FiInfo } from "react-icons/fi";
import { requireUser } from "~/auth.server";
import PendingRequestDrawer from "~/components/PendingRequestDrawer";
import { PendingRequestProps } from "./_app.imowed";
import DebtCard from "~/components/DebtCard";
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
          debtorId: currentDebt?.debtorId,
          amount: parseInt(partialAmount as string),
        },
      });
    }
  }
  return null;
}

export default function Iowe() {
  const { pendingDebitList, debitList } = useLoaderData<typeof loader>();

  const [openedDrawer, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [drawerContent, setDrawerContent] = useState<DrawerContent>();
  type DrawerContent = React.ReactElement;

  const handleDrawerOpen = (content: DrawerContent) => {
    setDrawerContent(content);
    openDrawer();
  };

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
      <Drawer
        opened={openedDrawer}
        onClose={closeDrawer}
        title="Pending Requests"
      >
        {drawerContent}
      </Drawer>
    </div>
  );
}
