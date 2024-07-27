import { requireUser } from "~/auth.server";
import { Currency, PrismaClient } from "@prisma/client";
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
} from "@mantine/core";
import { FiCheck, FiTrash } from "react-icons/fi";
import { commitSession, getSession } from "~/session.server";
const prisma = new PrismaClient();

export async function loader({ request }: { request: Request }) {
  const currentUser = await requireUser(request);
  const pendingDebitList = await prisma.debtRequest.findMany({
    where: {
      debtorId: currentUser.userId,
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

export async function action({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const intent = formData.get("intent");
  const requestId = formData.get("requestId");

  if (intent === "accept") {
    let errorCount = 0;

    try {
      await prisma.debtRequest.update({
        where: {
          id: Number(requestId),
        },
        data: {
          isAccepted: true,
        },
      });

      const debtRequest = await prisma.debtRequest.findUnique({
        where: {
          id: Number(requestId),
        },
      });

      await prisma.debt.create({
        data: {
          amount: debtRequest?.amount as number,
          creditorId: debtRequest?.creditorId as number,
          debtorId: debtRequest?.debtorId as number,
          currency: debtRequest?.currency as Currency,
          title: debtRequest?.title as string,
          description: debtRequest?.description as string,
          isPaidInFull: false,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      errorCount++;
    }

    if (errorCount > 0) {
      session.flash("flashMessage", {
        type: "error",
        message: `Could not accept the request.`,
      });
    } else {
      session.flash("flashMessage", {
        type: "success",
        message: `Debt request accepted successfully.`,
      });
    }
    return redirect("/iowe", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  if (intent === "reject") {
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
    return redirect("/iowe", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
}

export default function IOwePendingRequests() {
  const { pendingDebitList } = useLoaderData<typeof loader>();

  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  return (
    <Box>
      {pendingDebitList.length > 0 ? (
        <>
          {pendingDebitList.map((request) => (
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
                  <Text>To: {request.creditor.username}</Text>
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
                  <Flex justify="space-between">
                    <Button
                      color="bittersweet.8"
                      type="submit"
                      name="intent"
                      value="reject"
                      leftSection={<FiTrash />}
                      loading={submitting}
                    >
                      Reject Request
                    </Button>
                    <Button
                      color="charcoal.8"
                      type="submit"
                      name="intent"
                      value="accept"
                      leftSection={<FiCheck />}
                      loading={submitting}
                    >
                      Accept Request
                    </Button>
                  </Flex>
                </Form>
              </Card.Section>
            </Card>
          ))}
        </>
      ) : null}
    </Box>
  );
}
