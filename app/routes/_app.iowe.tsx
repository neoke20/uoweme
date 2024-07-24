import { Button, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PrismaClient } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { FiInfo } from "react-icons/fi";
import { requireUser } from "~/auth.server";
import PendingRequestDrawer from "~/components/PendingRequestDrawer";
import { PendingRequestProps } from "./_app.imowed";
const prisma = new PrismaClient();

export async function loader({ request }: { request: Request }) {
  const sessionUser = await requireUser(request);
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

  return { pendingDebitList };
}

export default function Iowe() {
  const { pendingDebitList } = useLoaderData<typeof loader>();
  console.log(pendingDebitList);

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
