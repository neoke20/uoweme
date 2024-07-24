import {
  Text,
  Card,
  NumberFormatter,
  Table,
  Button,
  Flex,
  Alert,
  Stack,
  NumberInput,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useFetcher } from "@remix-run/react";
import { useRef, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { DebtProps } from "~/routes/_app.iowe";

export default function DebtCard({ debt }: { debt: DebtProps }) {
  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);
  const alertIcon = <FiAlertCircle />;

  const [partialAmount, setPartialAmount] = useState<number>(0);
  console.log("Partial payment", partialAmount);

  const openPaidInFullModal = () =>
    modals.openConfirmModal({
      title: "Paid in full?",
      children: (
        <Alert my="md" color="vermilion.6" icon={alertIcon}>
          This will inform your creditor that you have paid this debt in full.
          Are you sure you want to continue?
        </Alert>
      ),
      centered: true,
      labels: { confirm: "Yes!", cancel: "Wait, I have not paid yet!" },
      confirmProps: { type: "submit", color: "charcoal.8" },
      onConfirm: () => {
        formRef.current!.submit();
      },
      closeOnConfirm: true,
      closeOnCancel: true,
    });
  const openPaidPartiallyModal = () =>
    modals.openConfirmModal({
      title: "Paid partially?",
      children: (
        <>
          {partialAmount === 0 ? (
            <Text>
              You have not entered any amount. Please enter the amount you have
              paid.
            </Text>
          ) : (
            <Text>
              Do you want to inform your creditor that you have paid{" "}
              <NumberFormatter
                prefix={`${debt.currency} `}
                value={partialAmount}
                thousandSeparator
              />{" "}
              of this debt?
            </Text>
          )}
        </>
      ),
      centered: true,
      labels: { confirm: "Send partial request", cancel: "Not yet" },
      confirmProps: {
        type: "submit",
        color: "charcoal.8",
        disabled: partialAmount === 0 ? true : false,
      },
      onConfirm: () => {
        formRef.current!.submit();
      },
      closeOnConfirm: true,
      closeOnCancel: true,
    });

  return (
    <Card key={debt.id} shadow="md" p="md">
      <Card.Section withBorder p="md" bg="vermilion.3" c="white">
        <Text ta="center" fz="lg" fw="bold">
          <NumberFormatter
            prefix={`${debt.currency} `}
            value={debt.amount}
            thousandSeparator
          />
        </Text>
        <Text ta="center">({debt.title})</Text>
      </Card.Section>
      <Card.Section p="md" withBorder>
        <Table withRowBorders={false}>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Amount left:</Table.Td>
              <Table.Td>
                <NumberFormatter
                  prefix={`${debt.currency} `}
                  value={debt.amount}
                  thousandSeparator
                />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Description:</Table.Td>
              <Table.Td>
                <Text>{debt.description}</Text>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Since:</Table.Td>
              <Table.Td>
                <Text>
                  {Intl.DateTimeFormat().format(new Date(debt.createdAt))}
                </Text>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Owed to:</Table.Td>
              <Table.Td>
                <Text>{debt.creditor.username}</Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Card.Section>
      <Card.Section p="md">
        <Stack justify="space-between">
          <fetcher.Form method="post" ref={formRef}>
            <input hidden name="formId" defaultValue="paidInFull" />
            <input hidden name="debtId" defaultValue={debt.id} />
            <Button color="charcoal.8" onClick={openPaidInFullModal}>
              Paid in full
            </Button>
          </fetcher.Form>
          <fetcher.Form method="post" ref={formRef}>
            <input hidden name="formId" defaultValue="paidPartially" />
            <input hidden name="debtId" defaultValue={debt.id} />
            <input hidden name="partialAmount" defaultValue={partialAmount} />
            <Flex gap="sm" justify="space-between" align="flex-end">
              <Flex align="flex-end" gap="sm" maw="50%">
                <Text>{debt.currency} </Text>
                <NumberInput
                  required
                  description={`(max: ${debt.amount})`}
                  onChange={(event) => setPartialAmount(event as number)}
                  max={debt.amount}
                />
              </Flex>
              <Button color="payneGray.4" onClick={openPaidPartiallyModal}>
                Paid partially
              </Button>
            </Flex>
          </fetcher.Form>
        </Stack>
      </Card.Section>
    </Card>
  );
}
