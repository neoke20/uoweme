import { Text, Flex, Card } from "@mantine/core";

export type UserProps = {
  id?: number;
  username: string;
  name?: string;
  surname?: string;
};

export default function UserCard({
  user,
  friendshipDate,
}: {
  user: UserProps;
  friendshipDate: string;
}) {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      bg="platinum.4"
      my="md"
    >
      <Flex gap="md" c="white">
        <Text fw="bold">{user.username}</Text>
        {user.name || user.surname ? (
          <>
            ({user.name ? <>{user.name}</> : null}
            {user.surname ? <> {user.surname}</> : null})
          </>
        ) : null}
      </Flex>
      <Text mt="sm" c="white">
        Friends since:{" "}
        {Intl.DateTimeFormat("en-US", {
          dateStyle: "full",
        }).format(new Date(friendshipDate))}
      </Text>
    </Card>
  );
}
