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
  const users = await prisma.user.findMany();
  return { users };
}

export default function Index() {
  const { users } = useLoaderData<typeof loader>();
  console.log(users);
  return (
    <Box>
      <p>Index</p>
    </Box>
  );
}
