import { Text, Box, Card, Center, Table, Title, Stack } from "@mantine/core";
import { PrismaClient } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/auth.server";
const prisma = new PrismaClient();

export async function loader({ request }: { request: Request }) {
  const sessionUser = await requireUser(request);

  const creditHistory = await prisma.debt.findMany({
    where: {
      creditorId: sessionUser.userId,
      isPaidInFull: true,
    },
    include: {
      debtor: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
    take: 10,
  });

  return { creditHistory };
}

export default function ImowedHistory() {
  const { creditHistory } = useLoaderData<typeof loader>();
  console.log(creditHistory);
  return (
    <Box>
      <Center>
        <Title order={2} mb="md">
          History
        </Title>
      </Center>
      {creditHistory.length > 0 ? (
        <>
          {creditHistory.map((history) => (
            <Card bg="green.9" key={history.id} c="white" my="md">
              <Table>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td>
                      <Text>Who</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text>{history.debtor.username}</Text>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>
                      <Text>What</Text>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap="xs">
                        <Text>{history.title}</Text>
                        <Text>{history.description}</Text>
                      </Stack>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>
                      <Text>When</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text>
                        {Intl.DateTimeFormat("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        }).format(new Date(history.updatedAt))}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Card>
          ))}
        </>
      ) : (
        <Text>No history</Text>
      )}
    </Box>
  );
}
