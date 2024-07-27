import { Autocomplete, Box, Button, Textarea, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import {
  Form,
  json,
  redirect,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { z } from "zod";
import { CURRENCIES } from "~/currencies";
import { Currency, PrismaClient } from "@prisma/client";
import { requireUser } from "~/auth.server";
import { commitSession, getSession } from "~/session.server";
const prisma = new PrismaClient();

export async function loader({ request }: { request: Request }) {
  const currentUser = await requireUser(request);
  const friends = await prisma.friendship.findMany({
    where: {
      userId: currentUser.userId,
    },
    include: {
      receiver: {
        select: {
          username: true,
          surname: true,
          name: true,
        },
      },
    },
  });

  return { friends };
}

export async function action({ request }: { request: Request }) {
  const sessionUser = await requireUser(request);
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const amount = formData.get("amount");
  const currency = formData.get("currency");
  const description = formData.get("description");
  const receiver = formData.get("receiver");
  const title = formData.get("title");

  const debtReceiver = await prisma.user.findUnique({
    where: {
      username: receiver as string,
    },
  });

  let errorCount = 0;
  if (debtReceiver) {
    try {
      await prisma.debtRequest.create({
        data: {
          amount: Number(amount),
          currency: currency as Currency,
          description: description as string,
          title: title as string,
          debtorId: debtReceiver?.id as unknown as number,
          creditorId: sessionUser.userId,
        },
      });
    } catch (error) {
      errorCount++;
    }

    if (errorCount > 0) {
      session.flash("flashMessage", {
        type: "error",
        message: `Could not send the request.`,
      });
    } else {
      session.flash("flashMessage", {
        type: "success",
        message: `Debt request sent successfully.`,
      });
    }
    return redirect("/imowed", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } else {
    session.flash("flashMessage", {
      type: "error",
      message: `Could not find the receiver.`,
    });
    return json(
      {
        errorCount: errorCount,
      },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }
}

export default function SendDebtRequest() {
  const { friends } = useLoaderData<typeof loader>();
  const data = friends.map((friend) => {
    return friend.receiver.username;
  });
  const debtRequestSchema = z.object({
    receiver: z.string().refine((value) => data.includes(value), {
      message: "Receiver must be a valid friend username",
    }),
    amount: z.string().min(1, { message: "Amount must be greater than 0" }),
    currency: z.string().refine((value) => CURRENCIES.includes(value), {
      message: "Currency must be a valid currency",
    }),
    title: z
      .string()
      .min(3, { message: "Title must be at least 3 characters" }),
    description: z
      .string()
      .min(1, { message: "Description must be at least 1 character" }),
  });

  const debtRequestForm = useForm({
    validate: zodResolver(debtRequestSchema),
    initialValues: {
      receiver: "",
      amount: "",
      currency: "",
      title: "",
      description: "",
    },
  });

  const submit = useSubmit();

  const handlePostDebtRequest = (event: React.FormEvent<HTMLFormElement>) => {
    debtRequestForm.onSubmit(
      (values) => {
        submit(event.currentTarget);
        console.log("VALUES", values);
      },
      (validationErrors) => {
        console.log(validationErrors);
      }
    )(event);
    event.preventDefault();
  };

  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Box>
      <Form method="post" onSubmit={handlePostDebtRequest}>
        <input type="hidden" name="formId" defaultValue="debtRequestForm" />
        <Autocomplete
          withAsterisk
          label="Find a friend"
          description="Find a friend by username"
          data={data}
          limit={5}
          name="receiver"
          {...debtRequestForm.getInputProps("receiver")}
        />
        <TextInput
          withAsterisk
          label="Amount"
          name="amount"
          type="number"
          {...debtRequestForm.getInputProps("amount")}
        />
        <Autocomplete
          withAsterisk
          label="Currency"
          description="Select the currency"
          data={CURRENCIES}
          limit={5}
          name="currency"
          {...debtRequestForm.getInputProps("currency")}
        />
        <TextInput
          withAsterisk
          label="Title"
          name="title"
          description="Name the debt"
          {...debtRequestForm.getInputProps("title")}
        />
        <Textarea
          withAsterisk
          label="Description"
          description="Describe what this debt is about (max 250 characters)"
          name="description"
          {...debtRequestForm.getInputProps("description")}
          autosize
          minRows={2}
          maxLength={250}
        />
        <Button
          type="submit"
          color="platinum.4"
          fullWidth
          my="md"
          loading={submitting}
        >
          Send request
        </Button>
      </Form>
    </Box>
  );
}
