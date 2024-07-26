import {
  Text,
  AppShell,
  Burger,
  Button,
  Flex,
  Group,
  Stack,
  Indicator,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { Form, json, Outlet, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { TbLogout2, TbSettings } from "react-icons/tb";
import { requireUser } from "~/auth.server";
import { commitSession, getSession } from "~/session.server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const currentUser = await requireUser(request);
  const message = session.get("flashMessage") || null;
  const debtRequestsCount = await prisma.debtRequest.count({
    where: {
      debtorId: currentUser.userId,
      isAccepted: false,
    },
  });
  const paymentRequestCount = await prisma.debtPaymentRequest.findMany({
    where: {
      isAccepted: false,
      debt: {
        creditorId: currentUser.userId,
      },
    },
  });
  const friendshipRequestsCount = await prisma.friendshipRequest.count({
    where: {
      receiverId: currentUser.userId,
      status: "PENDING",
    },
  });
  return json(
    {
      message,
      debtRequestsCount,
      friendshipRequestsCount,
      paymentRequestCount: paymentRequestCount.length,
    },
    {
      headers: {
        // only necessary with cookieSessionStorage
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export default function AppLayout() {
  const {
    message,
    debtRequestsCount,
    paymentRequestCount,
    friendshipRequestsCount,
  } = useLoaderData<typeof loader>();
  const [opened, { toggle }] = useDisclosure();

  useEffect(() => {
    if (message) {
      showNotification({
        autoClose: 5000,
        color: message.type === "success" ? "charcoal.6" : "bittersweet.6",
        message: message.message,
      });
    }
  }, [message]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          {debtRequestsCount > 0 ||
          paymentRequestCount > 0 ||
          friendshipRequestsCount > 0 ? (
            <Indicator color="bittersweet.6" processing>
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
            </Indicator>
          ) : (
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
          )}
          <Text component="a" href="/" fz="lg">
            U owe me
          </Text>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Flex direction={"column"} justify={"space-between"} h={"90%"}>
          <Stack gap="md">
            <Button onClick={toggle} component="a" color="charcoal.9" href="/">
              Home
            </Button>
            {friendshipRequestsCount > 0 ? (
              <Indicator color="bittersweet.6" processing>
                <Button
                  fullWidth
                  onClick={toggle}
                  component="a"
                  color="charcoal.9"
                  href="/friends"
                >
                  Friends List
                </Button>
              </Indicator>
            ) : (
              <Button
                onClick={toggle}
                component="a"
                color="charcoal.9"
                href="/friends"
              >
                Friends List
              </Button>
            )}
            {paymentRequestCount > 0 ? (
              <Indicator color="bittersweet.6" processing>
                <Button
                  fullWidth
                  onClick={toggle}
                  component="a"
                  color="charcoal.9"
                  href="/imowed"
                >
                  What people owe me
                </Button>
              </Indicator>
            ) : (
              <Button
                onClick={toggle}
                component="a"
                color="charcoal.9"
                href="/imowed"
              >
                What people owe me
              </Button>
            )}
            {debtRequestsCount > 0 ? (
              <Indicator color="bittersweet.6" processing>
                <Button
                  fullWidth
                  onClick={toggle}
                  component="a"
                  color="charcoal.9"
                  href="/iowe"
                >
                  What I owe people
                </Button>
              </Indicator>
            ) : (
              <Button
                onClick={toggle}
                component="a"
                color="charcoal.9"
                href="/iowe"
              >
                What I owe people
              </Button>
            )}
          </Stack>
          <Stack gap="md">
            <Button
              onClick={toggle}
              component="a"
              color="charcoal.9"
              href="/settings"
              leftSection={<TbSettings size={20} />}
            >
              Settings
            </Button>
            <Form method="post">
              <Button
                color="vermilion.7"
                leftSection={<TbLogout2 size={20} />}
                type="submit"
              >
                Logout
              </Button>
            </Form>
          </Stack>
        </Flex>
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet
          context={{
            setNotificationsValues: {
              debtRequestsCount,
              paymentRequestCount,
              friendshipRequestsCount,
            },
          }}
        />
      </AppShell.Main>
    </AppShell>
  );
}
