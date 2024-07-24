import { FriendsProps } from "~/routes/_app.imowed";
import { Autocomplete, Box, Button, Textarea, TextInput } from "@mantine/core";
import { useFetcher } from "@remix-run/react";
import { CURRENCIES } from "~/currencies";
import { z } from "zod";
import { useForm, zodResolver } from "@mantine/form";

export default function DebtRequestCard({
  friends,
  close,
}: {
  friends: FriendsProps[];
  close: () => void;
}) {
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

  const actionFetcher = useFetcher();

  const handlePostDebtRequest = () => {
    if (debtRequestForm.validate().hasErrors) {
      debtRequestForm.validate();
    } else {
      actionFetcher.submit(
        {
          values: debtRequestForm.values,
        },
        {
          method: "post",
          action: "/action/send-debt-request",
          encType: "application/json",
        }
      );
      close();
    }
  };

  return (
    <Box>
      <Autocomplete
        label="Find a friend"
        description="Find a friend by username"
        data={data}
        limit={5}
        {...debtRequestForm.getInputProps("receiver")}
      />
      <TextInput
        label="Amount"
        name="amount"
        type="number"
        {...debtRequestForm.getInputProps("amount")}
      />
      <Autocomplete
        label="Currency"
        description="Select the currency"
        data={CURRENCIES}
        limit={5}
        {...debtRequestForm.getInputProps("currency")}
      />
      <TextInput
        label="Title"
        name="title"
        description="Name the debt"
        {...debtRequestForm.getInputProps("title")}
      />
      <Textarea
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
        onClick={handlePostDebtRequest}
      >
        Send request
      </Button>
    </Box>
  );
}
