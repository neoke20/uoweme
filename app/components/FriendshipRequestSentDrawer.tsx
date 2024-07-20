import { Text, Box, Card, Flex, Button } from "@mantine/core";
import { Form } from "@remix-run/react";
import { FriendshipRequestSentProps } from "~/routes/_app.friends";
import { FiTrash2 } from "react-icons/fi";

export default function FriendshipRequestSentDrawer({
  requests,
  close,
}: FriendshipRequestSentProps & { close: () => void }) {
  return (
    <Box>
      <Text ta="center" fz="h2" tt="uppercase" fw="bold" mb="sm">
        Requests sent
      </Text>
      {requests.map((request) => {
        return (
          <Card radius="md" shadow="md" bg="platinum.4" p="md" key={request.id}>
            <Flex justify="center" gap="md" c="white">
              <Text>{request.receiver.username}</Text>
              {request.receiver.name || request.receiver.surname ? (
                <>
                  ({request.receiver.name ? <>{request.receiver.name}</> : null}
                  {request.receiver.surname ? (
                    <> {request.receiver.surname}</>
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
            <Flex justify="flex-end">
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
                  color="platinum.9"
                  fullWidth
                  mt="md"
                  onClick={close}
                >
                  <FiTrash2 />
                </Button>
              </Form>
            </Flex>
          </Card>
        );
      })}
    </Box>
  );
}
