import {
  Text,
  Box,
  Center,
  Title,
  Button,
  Card,
  Flex,
  Alert,
} from "@mantine/core";
import { PrismaClient } from "@prisma/client";
import { Form, json, useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { requireUser } from "~/auth.server";
import { DatePickerInput } from "@mantine/dates";
import HistoryCard from "~/components/HistoryCard";
import { FiArrowLeft, FiMeh } from "react-icons/fi";
const prisma = new PrismaClient();

export type HistoryProps = {
  id: number;
  amount: number;
  creditorId: number;
  currency: string;
  title: string;
  description: string;
  isPaidInFull: boolean;
  debtorId: number;
  debtor?: {
    username: string;
  };
  creditor?: {
    username: string;
  };
  createdAt: string;
  updatedAt: string;
  message?: string;
};

type SearchedHistory = HistoryProps[] | { message: string };

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

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const dateRangeFromForm = formData.get("dateRange");
  const sessionUser = await requireUser(request);

  if (!dateRangeFromForm) {
    return json({ type: "noDateError", message: "Please select a date range" });
  }
  if (dateRangeFromForm) {
    const [startDateString, endDateString] = (
      dateRangeFromForm as string
    ).split(" – ");
    const searchedHistory = await prisma.debt.findMany({
      where: {
        creditorId: sessionUser.userId,
        isPaidInFull: true,
        updatedAt: {
          gte: startDateString as unknown as string,
          lte: endDateString as unknown as string,
        },
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
    if (searchedHistory.length > 0) {
      return json(searchedHistory);
    } else {
      return json({ type: "noHistory", message: "No history found" });
    }
  } else {
    return null;
  }
}

export default function ImowedHistory() {
  const { creditHistory } = useLoaderData<typeof loader>();
  const searchedHistory = useActionData<SearchedHistory>();

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const isHistoryArray = (data: SearchedHistory): data is HistoryProps[] => {
    return Array.isArray(data);
  };

  return (
    <Box>
      <Center>
        <Flex gap="md">
          <Button color="platinum.9" component="a" href="/imowed">
            <FiArrowLeft />
          </Button>
          <Title order={2} mb="md">
            Credit History
          </Title>
        </Flex>
      </Center>
      {creditHistory.length > 0 ? (
        <>
          <Card withBorder bg="charcoal.5" c="white">
            <Card.Section withBorder p="md">
              <Text ta="center">Search history by date range</Text>
            </Card.Section>
            <Card.Section p="md">
              <Form method="post">
                <Flex align="flex-end" justify="space-between">
                  <DatePickerInput
                    w="60%"
                    withAsterisk
                    type="range"
                    label="Pick date"
                    placeholder="Pick date"
                    name="dateRange"
                    value={dateRange}
                    onChange={setDateRange}
                  />

                  <Button type="submit" color="charcoal.9">
                    Check history
                  </Button>
                </Flex>
                {searchedHistory &&
                "type" in searchedHistory &&
                searchedHistory.type === "noDateError" ? (
                  <Text
                    ta="center"
                    bg="vermilion.6"
                    p="2px"
                    mt="2px"
                    w="60%"
                    style={{ borderRadius: "4px" }}
                  >
                    Input dates
                  </Text>
                ) : null}
              </Form>
            </Card.Section>
          </Card>
          {searchedHistory && isHistoryArray(searchedHistory) ? (
            <Box>
              <Title order={3} ta="center" mt="md">
                Search results:
              </Title>
              {searchedHistory.map((history) => (
                <HistoryCard type="credit" key={history.id} details={history} />
              ))}
            </Box>
          ) : searchedHistory &&
            "type" in searchedHistory &&
            searchedHistory.type === "noHistory" ? (
            <Alert color="red" title={searchedHistory.message} mt="md">
              We could not find any records. Try again with a different date
              range.
            </Alert>
          ) : null}
          {searchedHistory === undefined ? (
            <Title order={3} ta="center" mt="md">
              Most recent
            </Title>
          ) : null}
          {searchedHistory === undefined &&
            creditHistory.map((history) => (
              <HistoryCard type="credit" key={history.id} details={history} />
            ))}
        </>
      ) : (
        <Alert color="red" title="No history found" mt="md" icon={<FiMeh />}>
          You do not have any credit history
        </Alert>
      )}
    </Box>
  );
}
