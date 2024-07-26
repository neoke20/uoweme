import {
  Text,
  AppShell,
  Burger,
  Button,
  Flex,
  Group,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { Form, json, Outlet, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { TbLogout2, TbSettings } from "react-icons/tb";
import { commitSession, getSession } from "~/session.server";

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const message = session.get("flashMessage") || null;
  return json(
    { message },
    {
      headers: {
        // only necessary with cookieSessionStorage
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export default function AppLayout() {
  const { message } = useLoaderData<typeof loader>();
  const [opened, { toggle }] = useDisclosure();

  useEffect(() => {
    if (message) {
      showNotification({
        autoClose: 5000,
        color: message.type === "success" ? "charcoal.6" : "bitterSweet.6",
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
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
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
            <Button
              onClick={toggle}
              component="a"
              color="charcoal.9"
              href="/friends"
            >
              Friends List
            </Button>
            <Button
              onClick={toggle}
              component="a"
              color="charcoal.9"
              href="/imowed"
            >
              What people owe me
            </Button>
            <Button
              onClick={toggle}
              component="a"
              color="charcoal.9"
              href="/iowe"
            >
              What I owe people
            </Button>
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
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
