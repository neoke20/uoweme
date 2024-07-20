import { Text, Box, Card, Flex, Button } from "@mantine/core";
import { Form } from "@remix-run/react";
import { FriendshipRequestReceivedProps } from "~/routes/_app.friends";
import { FiTrash2, FiCheckCircle } from "react-icons/fi";

export default function FriendshipRequestReceivedDrawer({
  requests,
  close,
}: FriendshipRequestReceivedProps & { close: () => void }) {
  return (
    <Box>
      <Text ta="center" fz="h2" tt="uppercase" fw="bold" mb="sm">
        Requests received
      </Text>
      {requests.map((request) => {
        return (
          <Card radius="md" shadow="md" bg="platinum.4" p="md" key={request.id}>
            <Flex justify="center" gap="md" c="white">
              <Text>{request.sender.username}</Text>
              {request.sender.name || request.sender.surname ? (
                <>
                  ({request.sender.name ? <>{request.sender.name}</> : null}
                  {request.sender.surname ? (
                    <> {request.sender.surname}</>
                  ) : null}
                  )
                </>
              ) : null}
            </Flex>
            <Text ta="center" c="white">
              Request sent on:{" "}
              {Intl.DateTimeFormat("en-US", {
                dateStyle: "full",
              }).format(new Date(request.createdAt))}
            </Text>
            <Flex justify="space-between">
              <Form method="post">
                <input
                  hidden
                  name="formId"
                  defaultValue="acceptFriendshipRequest"
                />
                <input
                  hidden
                  name="friendshipRequestId"
                  defaultValue={request.id}
                />
                <input
                  hidden
                  name="requestSenderId"
                  defaultValue={request.sender.id}
                />
                <Button
                  type="submit"
                  color="platinum.6"
                  fullWidth
                  mt="md"
                  onClick={close}
                  leftSection={<FiCheckCircle />}
                >
                  Accept
                </Button>
              </Form>
              <Form method="post">
                <input
                  hidden
                  name="formId"
                  defaultValue="cancelFriendshipRequest"
                />
                <input
                  hidden
                  name="friendshipRequestId"
                  defaultValue={request.id}
                />
                <Button
                  type="submit"
                  color="vermilion.9"
                  fullWidth
                  mt="md"
                  onClick={close}
                  leftSection={<FiTrash2 />}
                >
                  Reject
                </Button>
              </Form>
            </Flex>
          </Card>
        );
      })}
    </Box>
  );
}
