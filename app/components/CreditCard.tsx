import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  NumberFormatter,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { CreditProps } from "~/routes/_app.imowed";
import { FiAlertCircle, FiCheck, FiTrash2 } from "react-icons/fi";
import { modals } from "@mantine/modals";
import { useFetcher } from "@remix-run/react";
import { useRef } from "react";

export default function CreditCard({ details }: { details: CreditProps }) {
  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);
  const alertIcon = <FiAlertCircle />;

  const formRefs = useRef<Map<number, HTMLFormElement>>(new Map());

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

  const openPaymentConfirmationModal = (paymentRequestId: number) =>
    modals.openConfirmModal({
      title: "Accept this payment?",
      children: (
        <Alert my="md" color="vermilion.6" icon={<FiCheck />}>
          Are you sure you want to accept? This action cannot be undone.
        </Alert>
      ),
      centered: true,
      labels: { confirm: "Yes, accept the payment", cancel: "No, not yet" },
      confirmProps: { type: "submit", color: "platinum.4" },
      onConfirm: () => {
        const form = formRefs.current.get(paymentRequestId);
        if (form) {
          form.submit(); // Submit the correct form instance
        }
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
      {details.DebtPaymentRequest.length > 0 ? (
        <>
          {details.DebtPaymentRequest.map((paymentRequest) => (
            <Box key={paymentRequest.id}>
              {!paymentRequest.isAccepted ? (
                <Card.Section p="md" withBorder>
                  <Text ta="center" my="sm">
                    <span style={{ fontWeight: "bold" }}>
                      {details.debtor.username}
                    </span>{" "}
                    say they have sent you the following payment:
                  </Text>
                  <Table withTableBorder withColumnBorders>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Amount:</Table.Th>
                        <Table.Th>Requested On</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td>
                          <NumberFormatter
                            value={paymentRequest.amount}
                            thousandSeparator
                            prefix={`${details.currency} `}
                          />
                        </Table.Td>
                        <Table.Td>
                          {Intl.DateTimeFormat("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                          }).format(new Date(paymentRequest.createdAt))}
                        </Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                  <fetcher.Form
                    method="post"
                    ref={(el) => {
                      if (el) formRefs.current.set(paymentRequest.id, el);
                      else formRefs.current.delete(paymentRequest.id);
                    }}
                  >
                    <input hidden name="formId" defaultValue="acceptPayment" />
                    <input
                      hidden
                      name="paymentRequestId"
                      defaultValue={paymentRequest.id}
                    />
                    <input hidden name="debtId" defaultValue={details.id} />
                    <input
                      hidden
                      name="amount"
                      defaultValue={paymentRequest.amount}
                    />
                    <Button
                      fullWidth
                      my="sm"
                      leftSection={<FiCheck />}
                      color="charcoal.6"
                      onClick={() =>
                        openPaymentConfirmationModal(paymentRequest.id)
                      }
                    >
                      Confirm this payment
                    </Button>
                  </fetcher.Form>
                </Card.Section>
              ) : (
                <Card.Section withBorder m="md">
                  <Flex gap="md" align="center">
                    <FiCheck color="green" />
                    <Text>
                      Paid:{" "}
                      <NumberFormatter
                        prefix={`${details.currency} `}
                        value={paymentRequest.amount}
                        thousandSeparator
                      />{" "}
                      on{" "}
                      {Intl.DateTimeFormat().format(
                        new Date(paymentRequest.createdAt)
                      )}
                    </Text>
                  </Flex>
                </Card.Section>
              )}
            </Box>
          ))}
        </>
      ) : null}

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
