import {
  Text,
  Anchor,
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  TextInput,
  Title,
  Stack,
} from "@mantine/core";
// import classes from "~/style/AuthenticationTitle.module.css";

export default function Login() {
  return (
    <Stack h={"100vh"} bg={"charcoal.6"} justify={"center"}>
      <Container>
        <Title ta="center">Welcome back!</Title>
        <Text c="white" size="sm" ta="center" mt={5}>
          Do not have an account yet?{" "}
          <Anchor c="white" td={"underline"} size="sm" component="button">
            Create account
          </Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <TextInput label="Email" placeholder="you@mantine.dev" required />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
          />
          <Group justify="space-between" mt="lg">
            <Anchor component="button" size="sm">
              Forgot password?
            </Anchor>
          </Group>
          <Button fullWidth mt="xl" color="platinum.8">
            Sign in
          </Button>
        </Paper>
      </Container>
    </Stack>
  );
}
