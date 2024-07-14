import type { MetaFunction } from "@remix-run/node";
import { Box } from "@mantine/core";
import { useLoaderData } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader() {
  const user = await prisma.user.findUnique({
    where: {
      email: "kevin@k.com",
    },
  });
  return { user };
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  console.log(user);
  return (
    <Box>
      <p>Hi, {user?.name}</p>
    </Box>
  );
}
