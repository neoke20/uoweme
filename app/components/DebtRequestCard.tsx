import { FriendsProps } from "~/routes/_app.imowed";
import { useState } from "react";
import { Autocomplete, Button, Textarea, TextInput, Text } from "@mantine/core";
import { Form, useSubmit } from "@remix-run/react";
import { CURRENCIES } from "~/currencies";
import { z } from "zod";
import { useForm, zodResolver } from "@mantine/form";

const debtRequestSchema = z.object({
  amount: z.string().min(1, { message: "Amount must be greater than 0" }),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
});

export default function DebtRequestCard({
  friends,
  close,
}: {
  friends: FriendsProps[];
  close: () => void;
}) {
  const [friendValue, setFriendValue] = useState("");
  const [currencyValue, setCurrencyValue] = useState("");
  const [description, setDescription] = useState("");

  const debtRequestForm = useForm({
    validate: zodResolver(debtRequestSchema),
    initialValues: {
      receiver: friendValue,
      amount: "",
      currency: currencyValue,
      title: "",
      formId: "sendDebtRequest",
      description: description,
    },
  });

  const submit = useSubmit();

  const handlePostDebtRequest = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    debtRequestForm.onSubmit(
      (values, _event) => {
        console.log("!!!!Form values", values);
        submit({ method: "post" });
        close();
      },
      (validationErrors, _values) => {
        console.log("Validation errors", validationErrors);
      }
    )(event);
    event.preventDefault();
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };
  const data = friends.map((friend) => {
    return friend.receiver.username;
  });
  console.log("FRIENDS DATA", data);
  return (
    <Form method="post" onSubmit={handlePostDebtRequest}>
      <input hidden name="formId" defaultValue="sendDebtRequest" />
      <input hidden name="receiver" defaultValue={friendValue} />
      <Autocomplete
        label="Find a friend"
        description="Find a friend by username"
        data={data}
        value={friendValue}
        limit={5}
        onChange={setFriendValue}
      />
      {friendValue ? (
        <>
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
            value={currencyValue}
            limit={5}
            onChange={setCurrencyValue}
          />
          {currencyValue ? (
            <>
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
                value={description}
                onChange={handleChange}
                autosize
                minRows={2}
                maxLength={250}
              />
              <Text
                size="sm"
                c={description.length < 250 ? "dimmed" : "bittersweet.6"}
              >
                {description.length}/250 characters
              </Text>
              <Button type="submit" color="platinum.4" fullWidth my="md">
                Send request
              </Button>
            </>
          ) : null}
        </>
      ) : null}
    </Form>
  );
}
