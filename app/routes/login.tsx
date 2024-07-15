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
import { useForm } from "@mantine/form";
import { Form, json, useSubmit } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { createUserSession } from "~/auth.server";

const prisma = new PrismaClient();

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const { email, password } = Object.fromEntries(formData);

  const user = await prisma.user.findUnique({
    where: {
      email: email as string,
    },
  });

  function checkPassword(inputPassword: string) {
    return inputPassword === user?.password;
  }

  if (!checkPassword(password as string)) {
    return json(
      {
        type: "wrongPassword",
        message: "Password is incorrect",
      },
      {
        status: 401,
      }
    );
  }

  return createUserSession({
    request,
    user: {
      id: user?.id as number,
      email: user?.email as string,
      username: user?.username as string,
    },
    redirectTo: "/",
  });
}

export default function Login() {
  const submit = useSubmit();
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
  });

  const handleLoginFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    form.onSubmit(
      () => {
        console.log(form.values);
        submit(event.currentTarget);
      },
      () => {
        console.log(form.errors);
      }
    )(event);
    event.preventDefault();
  };

  return (
    <Stack h={"100vh"} bg={"charcoal.6"} justify={"center"}>
      <Container>
        <Title ta="center">Welcome back!</Title>
        <Text c="white" size="sm" ta="center" mt={5}>
          Do not have an account yet?{" "}
          <Anchor
            c="white"
            td={"underline"}
            size="sm"
            component="a"
            href="registration"
          >
            Create account
          </Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Form method="post" onSubmit={handleLoginFormSubmit}>
            <TextInput
              label="Email"
              placeholder="uowe@me.com"
              name="email"
              {...form.getInputProps("email")}
              required
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              name="password"
              {...form.getInputProps("password")}
              required
              mt="md"
            />
            <Group justify="space-between" mt="lg">
              <Anchor component="button" size="sm">
                Forgot password?
              </Anchor>
            </Group>
            <Button fullWidth mt="xl" color="platinum.8" type="submit">
              Sign in
            </Button>
          </Form>
        </Paper>
      </Container>
    </Stack>
  );
}
