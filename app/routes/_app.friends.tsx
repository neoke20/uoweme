import { Alert, Box, Text } from "@mantine/core";
import { PrismaClient } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/auth.server";
import { FiAlertCircle } from "react-icons/fi";
import UserCard, { UserProps } from "~/components/UserCard";

const prisma = new PrismaClient();

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

export default function Friends() {
  const { friendships } = useLoaderData<typeof loader>();
  console.log(friendships);
  const icon = <FiAlertCircle />;
  return (
    <Box>
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
        <Alert color="vermilion.6" icon={icon}>
          You do not have any friends at the moment
        </Alert>
      )}
    </Box>
  );
}
