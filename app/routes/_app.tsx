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
import { Outlet } from "@remix-run/react";
import { TbLogout2, TbSettings } from "react-icons/tb";

export default function AppLayout() {
  const [opened, { toggle }] = useDisclosure();
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
            <Button
              onClick={toggle}
              component="a"
              color="vermilion.7"
              leftSection={<TbLogout2 size={20} />}
            >
              Logout
            </Button>
          </Stack>
        </Flex>
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
