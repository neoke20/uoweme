import {
  Alert,
  Badge,
  Button,
  Card,
  Flex,
  NumberFormatter,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { CreditProps } from "~/routes/_app.imowed";
import { FiAlertCircle, FiTrash2 } from "react-icons/fi";
import { modals } from "@mantine/modals";
import { useFetcher } from "@remix-run/react";
import { useRef } from "react";

export default function DebtCard({ details }: { details: CreditProps }) {
  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);
  const alertIcon = <FiAlertCircle />;

  const openModal = () =>
    modals.openConfirmModal({
      title: "Cancel this debt?",
      children: (
        <Alert my="md" color="vermilion.6" icon={alertIcon}>
          Are you sure you want to cancel this debt? This action cannot be
          undone.
        </Alert>
      ),
      centered: true,
      labels: { confirm: "Yes, cancel it", cancel: "No, keep it" },
      confirmProps: { type: "submit", color: "platinum.4" },
      onConfirm: () => {
        formRef.current!.submit();
      },
      closeOnConfirm: true,
      closeOnCancel: true,
    });
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder my="lg">
      <Card.Section bg={details.amount > 0 ? "vermilion.3" : "platinum.4"}>
        <Stack justify="center" h={80}>
          <Text ta="center" fz="lg" c="white">
            {details.debtor.username}
            <br />
            <span>
              {details.debtor.name} {details.debtor.surname}
            </span>
          </Text>
        </Stack>
      </Card.Section>
      <Card.Section p="md" withBorder>
        <Flex justify="space-between" gap="lg" align="center">
          <Text maw="70%">{details.title}</Text>
          {details.isPaidInFull ? (
            <Badge color="green" variant="filled">
              Paid
            </Badge>
          ) : (
            <Badge color="red" variant="filled">
              Due
            </Badge>
          )}
        </Flex>
      </Card.Section>

      <Card.Section p="md" withBorder>
        <Table withRowBorders={false}>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Amount left:</Table.Td>
              <Table.Td>
                <NumberFormatter
                  prefix={`${details.currency} `}
                  value={details.amount}
                  thousandSeparator
                />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Since:</Table.Td>
              <Table.Td>
                <Text>
                  {Intl.DateTimeFormat().format(new Date(details.createdAt))}
                </Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Card.Section>
      <Card.Section p="md" withBorder>
        <Text>{details.description}</Text>
      </Card.Section>
      {details.isPaidInFull ? null : (
        <Card.Section>
          <fetcher.Form method="post" ref={formRef}>
            <input hidden name="formId" defaultValue="cancelDebt" />
            <input hidden name="debtId" defaultValue={details.id} />
            <Button
              color="vermilion.4"
              fullWidth
              leftSection={<FiTrash2 />}
              onClick={openModal}
            >
              Cancel this debt
            </Button>
          </fetcher.Form>
        </Card.Section>
      )}
    </Card>
  );
}
