import type { MetaFunction } from "@remix-run/node";
import { Box } from "@mantine/core";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <Box>
      <p>Index</p>
    </Box>
  );
}
