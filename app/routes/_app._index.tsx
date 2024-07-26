import type { MetaFunction } from "@remix-run/node";
import { Alert, Box, Button, Card, Stack, Text, Title } from "@mantine/core";
import { redirect, useLoaderData, useOutletContext } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { getSession } from "~/session.server";

const prisma = new PrismaClient();

interface OutletContextInterface {
  setNotificationsValues: {
    debtRequestsCount: number;
    paymentRequestCount: number;
    friendshipRequestsCount: number;
  };
}

export const meta: MetaFunction = () => {
  return [
    { title: "U Owe Me" },
    {
      name: "Keep track of who you owe and who owes you money",
      content: "U Owe Me, your daily convenient app!",
    },
  ];
};

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session?.data.loginUser?.userId;
  if (!userId) {
    return redirect("/login");
  } else {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return { user };
  }
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  const { setNotificationsValues } =
    useOutletContext() as OutletContextInterface;
  console.log("Test value", setNotificationsValues);
  return (
    <Box>
      <Title order={2} ta="center">
        Hi, {user?.name ? user?.name : user?.username}
      </Title>
      <Alert color="charcoal.6" my="md" variant="filled">
        <Text ta="center">Welcome to U Owe Me</Text>
        <Text ta="center">
          Today is{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </Alert>
      {setNotificationsValues &&
        setNotificationsValues.friendshipRequestsCount === 0 &&
        setNotificationsValues.debtRequestsCount === 0 &&
        setNotificationsValues.paymentRequestCount === 0 && (
          <Card bg="platinum.4" c="white">
            <Text ta="center">You have no notifications</Text>
          </Card>
        )}
      {setNotificationsValues &&
      setNotificationsValues.friendshipRequestsCount > 0 ? (
        <Alert color="charcoal.6" my="md" variant="outline">
          <Stack>
            <Text ta="center">
              {setNotificationsValues.friendshipRequestsCount}{" "}
              {setNotificationsValues.friendshipRequestsCount > 1
                ? "people are "
                : "person is "}
              requesting to be your friend
            </Text>
            <Button color="charcoal.6" component="a" href="friends">
              Check
            </Button>
          </Stack>
        </Alert>
      ) : null}
      {setNotificationsValues &&
      setNotificationsValues.debtRequestsCount > 0 ? (
        <Alert color="charcoal.6" my="md" variant="outline">
          <Stack>
            <Text ta="center">
              You currently have {setNotificationsValues.debtRequestsCount}{" "}
              <span style={{ fontWeight: "bold" }}>debt</span>
              {setNotificationsValues.debtRequestsCount > 1
                ? " requests"
                : " request"}
            </Text>
            <Button color="charcoal.6" component="a" href="iowe">
              Check
            </Button>
          </Stack>
        </Alert>
      ) : null}
      {setNotificationsValues &&
      setNotificationsValues.debtRequestsCount > 0 ? (
        <Alert color="charcoal.6" my="md" variant="outline">
          <Stack>
            <Text ta="center">
              You currently have {setNotificationsValues.paymentRequestCount}{" "}
              <span style={{ fontWeight: "bold" }}>debt payment</span>
              {setNotificationsValues.paymentRequestCount > 1
                ? " requests"
                : " request"}
            </Text>
            <Button color="charcoal.6" component="a" href="imowed">
              Check
            </Button>
          </Stack>
        </Alert>
      ) : null}
    </Box>
  );
}
