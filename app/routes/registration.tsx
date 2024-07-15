import {
  Text,
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  TextInput,
  Title,
  Stack,
} from "@mantine/core";

export default function Registration() {
  return (
    <Stack h={"100vh"} bg={"charcoal.6"} justify={"center"}>
      <Container>
        <Title ta="center">Create an account</Title>
        <Text c="white" size="sm" ta="center" mt={5}>
          Already have an account?{" "}
          <Anchor
            c="white"
            td={"underline"}
            size="sm"
            component="a"
            href="login"
          >
            Sign in
          </Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <TextInput label="Email" required />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
          />

          <Button fullWidth mt="xl" color="platinum.8">
            Register
          </Button>
        </Paper>
      </Container>
    </Stack>
  );
}
