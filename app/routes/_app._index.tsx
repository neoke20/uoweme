import type { MetaFunction } from "@remix-run/node";
import { Box } from "@mantine/core";
import { redirect, useLoaderData } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { getSession } from "~/session.server";

const prisma = new PrismaClient();

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session?.data.loginUser?.userId;
  if (!userId) {
    return redirect("/login");
  } else {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return { user };
  }
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <Box>
      <p>Hi, {user?.name}</p>
    </Box>
  );
}
