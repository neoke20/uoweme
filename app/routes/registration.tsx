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
import { useForm } from "@mantine/form";
import { Form, json, useSubmit } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const { email, username, password, passwordConfirmation } =
    Object.fromEntries(formData);

  const existingUserEmail = await prisma.user.findUnique({
    where: {
      email: email as string,
    },
  });

  const existingUsername = await prisma.user.findUnique({
    where: {
      username: username as string,
    },
  });

  if (existingUserEmail) {
    return json(
      {
        type: "userEmailExists",
        message: "Email is already in use",
      },
      {
        status: 401,
      }
    );
  }

  if (existingUsername) {
    return json(
      {
        type: "usernameExists",
        message: "Username is already in use",
      },
      {
        status: 401,
      }
    );
  }

  if (password !== passwordConfirmation) {
    return json(
      {
        type: "passwordMismatch",
        message: "Passwords do not match",
      },
      {
        status: 401,
      }
    );
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password as string, salt);

  const user = await prisma.user.create({
    data: {
      email: email as string,
      username: username as string,
      password: hashedPassword,
    },
  });

  return user;
}

export default function Registration() {
  const submit = useSubmit();
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });
  const handleRegistrationFormSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
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
          <Form method="post" onSubmit={handleRegistrationFormSubmit}>
            <TextInput
              label="Email"
              placeholder="uowe@me.com"
              name="email"
              {...form.getInputProps("email")}
              required
            />
            <TextInput
              label="Username"
              placeholder="uoweme"
              name="username"
              {...form.getInputProps("username")}
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
            <PasswordInput
              label="Password confirmation"
              placeholder="Your password"
              name="passwordConfirmation"
              {...form.getInputProps("passwordConfirmation")}
              required
              mt="md"
            />
            <Button fullWidth mt="xl" color="platinum.8" type="submit">
              Sign in
            </Button>
          </Form>
        </Paper>
      </Container>
    </Stack>
  );
}
