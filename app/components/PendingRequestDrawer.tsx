import {
  Box,
  Button,
  Card,
  Center,
  Flex,
  NumberFormatter,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useFetcher } from "@remix-run/react";
import { PendingRequestProps } from "~/routes/_app.imowed";

export default function PendingRequestDrawer({
  requests,
  close,
  type,
}: {
  requests: PendingRequestProps[];
  close: () => void;
  type: string;
}) {
  const actionFetcher = useFetcher();

  const handleDebtRequestDeletion = (id: number) => async () => {
    await actionFetcher.submit(
      {},
      {
        method: "post",
        action: `/action/delete-debt-request/${id}`,
        encType: "application/json",
      }
    );
    close();
  };

  const handleAcceptDebtRequest = (requestId: number) => async () => {
    await actionFetcher.submit(
      {},
      {
        method: "post",
        action: `/action/accept-debt-request/${requestId}`,
        encType: "application/json",
      }
    );
    close();
  };
  return (
    <Box>
      <Center>
        <Title order={2}>Pending Requests</Title>
      </Center>
      {requests.map((request) => {
        return (
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
                {type === "credit" ? (
                  <Text>To: {request.debtor.username}</Text>
                ) : (
                  <Text>From: {request.creditor.username}</Text>
                )}
              </Center>
            </Card.Section>
            <Stack key={request.id} gap="sm" p="md">
              <Text>{request.title}</Text>

              {type === "debt" ? <Text>{request.description}</Text> : null}
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
              <Flex justify="space-between">
                <Button
                  fullWidth={type === "credit"}
                  color="bittersweet.8"
                  onClick={handleDebtRequestDeletion(request.id)}
                >
                  Cancel Request
                </Button>
                {type === "debt" ? (
                  <Button
                    color="platinum.8"
                    onClick={handleAcceptDebtRequest(request.id)}
                  >
                    Accept
                  </Button>
                ) : null}
              </Flex>
            </Card.Section>
          </Card>
        );
      })}
    </Box>
  );
}
