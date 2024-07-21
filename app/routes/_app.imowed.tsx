import { Box, Button, Center, Container, Modal, Title } from "@mantine/core";
import { PrismaClient } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/auth.server";
import DebtCard from "~/components/DebtCard";
import { FiPlus } from "react-icons/fi";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import DebtRequestCard from "~/components/DebtRequestCard";
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

export type FriendsProps = {
  receiver: {
    id: number;
    username: string;
  };
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

  return { creditList, friends };
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
  const { creditList, friends } = useLoaderData<typeof loader>();

  const [opened, { open, close }] = useDisclosure(false);
  const [modalContent, setModalContent] = useState<ModalContent>();
  type ModalContent = React.ReactElement;

  const handleModalOpen = (content: ModalContent) => {
    setModalContent(content);
    open();
  };
  return (
    <Box>
      {creditList.length > 0 ? (
        <Container>
          <Title order={2} ta="center" my="md">
            What people owe you
          </Title>
          <Center>
            <Button
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
              Send Debt Request
            </Button>
          </Center>
          {creditList.map((credit) => (
            <DebtCard key={credit.id} details={credit as CreditProps} />
          ))}
        </Container>
      ) : null}
      <Modal opened={opened} onClose={close} centered title="Debt Request">
        {modalContent}
      </Modal>
    </Box>
  );
}
