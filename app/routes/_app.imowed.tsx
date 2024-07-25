import {
  Box,
  Button,
  Container,
  Drawer,
  Modal,
  Stack,
  Title,
} from "@mantine/core";
import { PrismaClient } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/auth.server";
import CreditCard from "~/components/CreditCard";
import { FiPlus, FiInfo } from "react-icons/fi";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import DebtRequestCard from "~/components/DebtRequestCard";
import PendingRequestDrawer from "~/components/PendingRequestDrawer";
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
  DebtPaymentRequest: {
    id: number;
    amount: number;
    createdAt: string;
    isAccepted: boolean;
  }[];
};

export type FriendsProps = {
  receiver: {
    id: number;
    username: string;
  };
};

export type PendingRequestProps = {
  id: number;
  amount: number;
  creditorId: number;
  currency: string;
  title: string;
  description: string;
  isPaidInFull: boolean;
  debtorId: number;
  debtor: {
    username: string;
  };
  creditor: {
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
      DebtPaymentRequest: true,
    },
  });

  const friends = await prisma.friendship.findMany({
    where: {
      userId: sessionUser.userId,
    },
    include: {
      receiver: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  const pendingCreditList = await prisma.debtRequest.findMany({
    where: {
      creditorId: sessionUser.userId,
      isAccepted: false,
    },
    include: {
      debtor: {
        select: {
          username: true,
        },
      },
    },
  });

  return { creditList, friends, pendingCreditList };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const formId = formData.get("formId");

  if (formId === "cancelDebt") {
    const debtId = Number(formData.get("debtId"));
    await prisma.debtPaymentRequest.deleteMany({
      where: {
        debtId: debtId,
      },
    });
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

  if (formId === "acceptPayment") {
    const { paymentRequestId, debtId, amount } = Object.fromEntries(formData);
    console.log(paymentRequestId, debtId, amount);
    await prisma.debtPaymentRequest.update({
      where: {
        id: parseInt(paymentRequestId as string),
      },
      data: {
        isAccepted: true,
      },
    });
    const currentDebt = await prisma.debt.findUnique({
      where: {
        id: parseInt(debtId as string),
      },
    });
    if (currentDebt) {
      const amountLeft = currentDebt.amount - parseInt(amount as string);
      await prisma.debt.update({
        where: {
          id: parseInt(debtId as string),
        },
        data: {
          amount: amountLeft,
        },
      });
      if (amountLeft === 0) {
        await prisma.debt.update({
          where: {
            id: parseInt(debtId as string),
          },
          data: {
            isPaidInFull: true,
          },
        });
      }
    }
    return new Response(null, {
      status: 303,
      headers: { Location: "/imowed" },
    });
  }
}

export default function Imowed() {
  const { creditList, friends, pendingCreditList } =
    useLoaderData<typeof loader>();

  const [opened, { open, close }] = useDisclosure(false);
  const [modalContent, setModalContent] = useState<ModalContent>();
  type ModalContent = React.ReactElement;

  const handleModalOpen = (content: ModalContent) => {
    setModalContent(content);
    open();
  };

  const [openedDrawer, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [drawerContent, setDrawerContent] = useState<DrawerContent>();
  type DrawerContent = React.ReactElement;

  const handleDrawerOpen = (content: DrawerContent) => {
    setDrawerContent(content);
    openDrawer();
  };

  return (
    <Box>
      <Title order={2} ta="center" my="md">
        What people owe you
      </Title>
      <Stack justify="center" gap="md">
        <Button
          fullWidth
          color="platinum.4"
          leftSection={<FiPlus />}
          onClick={() =>
            handleModalOpen(
              <DebtRequestCard
                friends={friends as FriendsProps[]}
                close={close}
              />
            )
          }
        >
          Send Request
        </Button>
        {pendingCreditList.length > 0 ? (
          <Button
            fullWidth
            color="platinum.4"
            leftSection={<FiInfo />}
            onClick={() =>
              handleDrawerOpen(
                <PendingRequestDrawer
                  requests={
                    pendingCreditList as unknown as PendingRequestProps[]
                  }
                  close={closeDrawer}
                  type="credit"
                />
              )
            }
          >
            Pending Requests
          </Button>
        ) : null}
      </Stack>
      {creditList.length > 0 ? (
        <Container>
          {creditList.map((credit) => (
            <CreditCard key={credit.id} details={credit as CreditProps} />
          ))}
        </Container>
      ) : null}
      <Modal opened={opened} onClose={close} centered title="Debt Request">
        {modalContent}
      </Modal>
      <Drawer
        opened={openedDrawer}
        onClose={closeDrawer}
        title="Pending Requests"
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
