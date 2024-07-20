import {
  Alert,
  Box,
  Button,
  Card,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { PrismaClient } from "@prisma/client";
import { Form, json, useActionData, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/auth.server";
import { FiAlertCircle, FiAtSign } from "react-icons/fi";
import UserCard, { UserProps } from "~/components/UserCard";

const prisma = new PrismaClient();

interface actionDataProps {
  type: string;
  user?: UserProps;
}

export async function loader({ request }: { request: Request }) {
  const sessionUser = await requireUser(request);
  const friendships = await prisma.friendship.findMany({
    where: {
      userId: sessionUser.userId,
    },
    include: {
      receiver: {
        select: {
          username: true,
          surname: true,
          name: true,
        },
      },
    },
  });
  return { friendships };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const username = formData.get("username");
  const formId = formData.get("formId");
  const currentUser = await requireUser(request);
  const friendshipUserId = formData.get("friendshipUserId");
  if (formId === "searchFriends") {
    const user = await prisma.user.findUnique({
      where: {
        username: username?.toString().toLowerCase(),
      },
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
      },
    });
    if (!user) {
      return json(
        {
          type: "userNotFound",
        },
        {
          status: 401,
        }
      );
    }

    if (user.id === currentUser.userId) {
      return json(
        {
          type: "userIsCurrentUser",
        },
        {
          status: 401,
        }
      );
    }

    return { user, currentUser };
  }

  if (formId === "sendFriendshipRequest") {
    const existingRequest = await prisma.friendshipRequest.findFirst({
      where: {
        senderId: currentUser.userId,
        receiverId: parseInt(friendshipUserId as unknown as string),
      },
    });
    if (existingRequest) {
      return json(
        {
          type: "friendshipRequestAlreadySent",
        },
        {
          status: 401,
        }
      );
    } else {
      const friendshipRequest = await prisma.friendshipRequest.create({
        data: {
          senderId: currentUser.userId,
          receiverId: parseInt(friendshipUserId as unknown as string),
          status: "PENDING",
          createdAt: new Date(),
        },
      });
      return json({ friendshipRequest });
    }
  }
}

export default function Friends() {
  const { friendships } = useLoaderData<typeof loader>();
  const actionData = useActionData<actionDataProps>();
  console.log(actionData);
  console.log(friendships);
  const alertIcon = <FiAlertCircle />;
  const atSignIcon = <FiAtSign />;
  return (
    <Box>
      <Form method="post">
        <input hidden name="formId" defaultValue="searchFriends" />
        <TextInput
          label="Search for friends"
          description="You can find friends searching for their usernames"
          placeholder="username"
          name="username"
          leftSectionPointerEvents="none"
          leftSection={atSignIcon}
        />
        <Button my="sm" type="submit" color="platinum.4" fullWidth>
          Search for a friend
        </Button>
      </Form>
      {actionData?.type === "userNotFound" ? (
        <Alert my="md" color="charcoal.2" icon={alertIcon}>
          User not found :(
        </Alert>
      ) : actionData?.type === "userIsCurrentUser" ? (
        <Text ta="center" p="md" bg="platinum.6" c="white">
          You are your own best friend already, you silly goose!
        </Text>
      ) : actionData?.user ? (
        <Card radius="md" shadow="md">
          <Stack align="center" gap="sm">
            <Text ta="center">{actionData?.user?.username}</Text>
            {actionData?.user.name || actionData?.user.surname ? (
              <>
                ({actionData?.user.name ? <>{actionData?.user.name}</> : null}
                {actionData?.user.surname ? (
                  <> {actionData?.user.surname}</>
                ) : null}
                )
              </>
            ) : null}
            <Form method="post">
              <input
                hidden
                name="formId"
                defaultValue="sendFriendshipRequest"
              />
              <input
                hidden
                name="friendshipUserId"
                defaultValue={actionData.user.id}
              />
              <Button type="submit" color="platinum.4">
                Send Friendship Request
              </Button>
            </Form>
          </Stack>
        </Card>
      ) : null}
      {friendships.length > 0 ? (
        <Box>
          <Text>You are friends with:</Text>
          {friendships.map((friendship) => (
            <Box key={friendship.id}>
              <UserCard
                user={friendship.receiver as UserProps}
                friendshipDate={friendship.updatedAt}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Alert my="md" color="vermilion.6" icon={alertIcon}>
          You do not have any friends at the moment
        </Alert>
      )}
    </Box>
  );
}
