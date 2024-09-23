import { requireUser } from "~/auth.server";
import { PrismaClient } from "@prisma/client";
import { Form, redirect, useLoaderData, useNavigation } from "@remix-run/react";
import {
  Text,
  Box,
  Button,
  Card,
  Center,
  NumberFormatter,
  Stack,
  Flex,
  Title,
} from "@mantine/core";
import { FiArrowLeft, FiTrash } from "react-icons/fi";
import { commitSession, getSession } from "~/session.server";
const prisma = new PrismaClient();

export async function loader({ request }: { request: Request }) {
  const currentUser = await requireUser(request);
  const pendingRequests = await prisma.debtRequest.findMany({
    where: {
      creditorId: currentUser.userId,
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

  return { pendingRequests };
}

export async function action({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const requestId = formData.get("requestId");

  let errorCount = 0;

  try {
    await prisma.debtRequest.delete({
      where: {
        id: Number(requestId),
      },
    });
  } catch (error) {
    errorCount++;
  }

  if (errorCount > 0) {
    session.flash("flashMessage", {
      type: "error",
      message: `Could not cancel the request.`,
    });
  } else {
    session.flash("flashMessage", {
      type: "success",
      message: `Debt request cancelled successfully.`,
    });
  }
  return redirect("/imowed", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function PendingRequest() {
  const { pendingRequests } = useLoaderData<typeof loader>();
  console.log(pendingRequests);

  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  return (
    <Box>
      <Center>
        <Flex gap="md">
          <Button color="platinum.9" component="a" href="/imowed">
            <FiArrowLeft />
          </Button>
          <Title order={2} mb="md">
            Requests
          </Title>
        </Flex>
      </Center>
      {pendingRequests.length > 0 ? (
        <>
          {pendingRequests.map((request) => (
            <Card
              c="white"
              key={request.id}
              shadow="md"
              padding="md"
              bg="platinum.4"
              my="md"
            >
              <Card.Section p="md" withBorder>
                <Center>
                  <Text>To: {request.debtor.username}</Text>
                </Center>
              </Card.Section>
              <Stack key={request.id} gap="sm" p="md">
                <Text>{request.title}</Text>
                <NumberFormatter
                  prefix={`${request.currency} `}
                  value={request.amount}
                  thousandSeparator
                />
                {Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }).format(new Date(request.createdAt))}
              </Stack>
              <Card.Section>
                <Form method="post">
                  <input hidden name="requestId" defaultValue={request.id} />
                  <Button
                    fullWidth
                    color="bittersweet.8"
                    type="submit"
                    leftSection={<FiTrash />}
                    loading={submitting}
                  >
                    Cancel Request
                  </Button>
                </Form>
              </Card.Section>
            </Card>
          ))}
        </>
      ) : null}
    </Box>
  );
}
