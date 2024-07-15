import { Form, redirect, useLoaderData, useSubmit } from "@remix-run/react";
import { requireUser } from "~/auth.server";
import { PrismaClient } from "@prisma/client";
import { Box, Button, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

const prisma = new PrismaClient();

export async function loader({ request }: { request: Request }) {
  const sessionUser = await requireUser(request);
  const user = await prisma.user.findUnique({
    where: {
      id: sessionUser.userId,
    },
    select: {
      name: true,
      surname: true,
    },
  });
  return { user };
}

export async function action({ request }: { request: Request }) {
  const sessionUser = await requireUser(request);
  const formData = new URLSearchParams(await request.text());
  const { name, surname } = Object.fromEntries(formData);
  await prisma.user.update({
    where: {
      id: sessionUser.userId,
    },
    data: {
      name: name,
      surname: surname,
    },
  });
  return redirect("/settings");
}

export default function Settings() {
  const { user } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const form = useForm({
    initialValues: {
      name: user?.name,
      surname: user?.surname,
    },
  });

  const handleSettingsFormSubmit = (
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
  console.log(user);
  return (
    <Box>
      <Form method="post" onSubmit={handleSettingsFormSubmit}>
        <TextInput label="Name" name="name" {...form.getInputProps("name")} />
        <TextInput
          label="Surname"
          name="surname"
          {...form.getInputProps("surname")}
        />
        <Button color="charcoal.4" my={"md"} type="submit">
          Save
        </Button>
      </Form>
    </Box>
  );
}
