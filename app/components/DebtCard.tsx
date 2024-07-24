import { Text, Card, NumberFormatter, Table } from "@mantine/core";
import { DebtProps } from "~/routes/_app.iowe";

export default function DebtCard({ debt }: { debt: DebtProps }) {
  return (
    <Card key={debt.id} shadow="md" p="md">
      <Card.Section withBorder p="md" bg="bittersweet.8" c="white">
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
              <Table.Td>Due to:</Table.Td>
              <Table.Td>
                <Text>{debt.creditor.username}</Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Card.Section>
    </Card>
  );
}
