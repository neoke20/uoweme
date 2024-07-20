import { PrismaClient } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/auth.server";

const prisma = new PrismaClient();

export async function loader({ request }: { request: Request }) {
  const sessionUser = await requireUser(request);
  const friendships = await prisma.friendship.findMany({
    where: {
      userId: sessionUser.userId,
    },
  });
  return { friendships };
}

export default function Friends() {
  const { friendships } = useLoaderData<typeof loader>();
  console.log(friendships);
  return (
    <div>
      <p>Friends</p>
    </div>
  );
}
