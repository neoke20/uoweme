import {
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
import { FiTrash2 } from "react-icons/fi";

export default function DebtCard({ details }: { details: CreditProps }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
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
        </Table>
      </Card.Section>
      <Card.Section p="md" withBorder>
        <Text>{details.description}</Text>
      </Card.Section>
      {details.isPaidInFull ? null : (
        <Card.Section>
          <Button color="vermilion.4" fullWidth leftSection={<FiTrash2 />}>
            Cancel this debt
          </Button>
        </Card.Section>
      )}
    </Card>
  );
}
