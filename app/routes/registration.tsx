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
import { useForm, zodResolver } from "@mantine/form";
import { Form, json, useActionData, useSubmit } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createUserSession } from "~/auth.server";
import { z } from "zod";

const prisma = new PrismaClient();

const registrationFormValidation = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" }),
  password: z
    .string()
    .min(8, { message: "password must be at least 8 characters long" }),
});

interface ActionData {
  type: string;
  message: string;
}

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

  return createUserSession({
    request,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    redirectTo: "/",
  });
}

export default function Registration() {
  const action = useActionData<ActionData>();
  const submit = useSubmit();
  const form = useForm({
    validate: zodResolver(registrationFormValidation),
    initialValues: {
      email: "",
      username: "",
      password: "",
      passwordConfirmation: "",
    },
  });
  const handleRegistrationFormSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    form.onSubmit(
      () => {
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
      <Container miw={"90%"}>
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
            {action && action.type === "userEmailExists" ? (
              <Text my={"xs"} c="vermilion.7" size="sm">
                {action.message}
              </Text>
            ) : null}
            <TextInput
              label="Username"
              placeholder="uoweme"
              name="username"
              {...form.getInputProps("username")}
              required
            />
            {action && action.type === "usernameExists" ? (
              <Text my={"xs"} c="vermilion.7" size="sm">
                {action.message}
              </Text>
            ) : null}
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

            <Button fullWidth mt={"xl"} color="platinum.8" type="submit">
              Sign in
            </Button>
          </Form>
        </Paper>
      </Container>
    </Stack>
  );
}
