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
import { useForm, zodResolver } from "@mantine/form";
import {
  Form,
  json,
  useActionData,
  useSubmit,
  useNavigation,
} from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { createUserSession } from "~/auth.server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const loginFormValidation = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "password should be 8 characters long" }),
});

interface ActionData {
  type: string;
  message: string;
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const { email, password } = Object.fromEntries(formData);

  const user = await prisma.user.findUnique({
    where: {
      email: email as string,
    },
  });

  if (!user) {
    return json(
      {
        type: "userNotFound",
        message: "User not found",
      },
      {
        status: 401,
      }
    );
  }

  function checkPassword(inputPassword: string) {
    const password_match = bcrypt.compareSync(
      inputPassword,
      user?.password as string
    );
    return password_match;
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
  const action = useActionData<ActionData>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const form = useForm({
    validate: zodResolver(loginFormValidation),
    initialValues: {
      email: "",
      password: "",
    },
  });

  const handleLoginFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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
            {action && action.type === "userNotFound" ? (
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
            {action && action.type === "wrongPassword" ? (
              <Text my={"xs"} c="vermilion.7" size="sm">
                {action.message}
              </Text>
            ) : null}
            <Group justify="space-between" mt="lg">
              <Anchor component="button" size="sm">
                Forgot password?
              </Anchor>
            </Group>
            <Button
              fullWidth
              mt="xl"
              color="platinum.8"
              type="submit"
              loading={submitting}
            >
              Sign in
            </Button>
          </Form>
        </Paper>
      </Container>
    </Stack>
  );
}
