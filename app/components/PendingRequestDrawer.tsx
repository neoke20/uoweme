import { Box, Button, Card, Flex, Text } from "@mantine/core";

export default function PendingRequestDrawer({ requests, close }) {
  console.log("REQUESTS FROM COMPONENT", requests);
  return (
    <Box>
      <Text ta="center" fz="h2">
        Current pending requests
      </Text>
      {requests.map((request) => {
        return (
          <Card key={request.id} shadow="md" padding="md">
            <Flex key={request.id}>
              <p>{request.amount}</p>
            </Flex>
          </Card>
        );
      })}
    </Box>
  );
}
