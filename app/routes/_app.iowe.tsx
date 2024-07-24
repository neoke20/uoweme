import { Button, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PrismaClient } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { FiInfo } from "react-icons/fi";
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
};

export async function loader({ request }: { request: Request }) {
  const sessionUser = await requireUser(request);

  const debitList = await prisma.debt.findMany({
    where: {
      debtorId: sessionUser.userId,
    },
    include: {
      creditor: {
        select: {
          username: true,
        },
      },
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

export default function Iowe() {
  const { pendingDebitList, debitList } = useLoaderData<typeof loader>();
  console.log(pendingDebitList, debitList);

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
      <h2>I owe to people</h2>
      {pendingDebitList.length > 0 ? (
        <Button
          fullWidth
          color="platinum.4"
          leftSection={<FiInfo />}
          onClick={() =>
            handleDrawerOpen(
              <PendingRequestDrawer
                requests={pendingDebitList as unknown as PendingRequestProps[]}
                close={closeDrawer}
                type="debt"
              />
            )
          }
        >
          Pending Requests
        </Button>
      ) : null}
      {debitList.length > 0 &&
        debitList.map((debt) => (
          <DebtCard key={debt.id} debt={debt as unknown as DebtProps} />
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
