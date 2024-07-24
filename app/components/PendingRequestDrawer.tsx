import {
  Box,
  Button,
  Card,
  Center,
  NumberFormatter,
  Stack,
  Text,
} from "@mantine/core";
import { useFetcher } from "@remix-run/react";
import { PendingRequestProps } from "~/routes/_app.imowed";

export default function PendingRequestDrawer({
  requests,
  close,
}: {
  requests: PendingRequestProps[];
  close: () => void;
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
  return (
    <Box>
      {requests.map((request) => {
        return (
          <Card
            c="white"
            key={request.id}
            shadow="md"
            padding="md"
            bg="platinum.4"
          >
            <Card.Section p="md" withBorder>
              <Center>To: {request.debtor.username}</Center>
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
              <Button
                fullWidth
                color="bittersweet.8"
                onClick={handleDebtRequestDeletion(request.id)}
              >
                Cancel Request
              </Button>
            </Card.Section>
          </Card>
        );
      })}
    </Box>
  );
}
