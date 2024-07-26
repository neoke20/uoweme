import { Text, Card, Stack, Table } from "@mantine/core";
import { HistoryProps } from "~/routes/_app.imowed_.history";

export default function HistoryCard({ details }: { details: HistoryProps }) {
  return (
    <Card bg="green.9" c="white" my="md">
      <Table>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>
              <Text>Who</Text>
            </Table.Td>
            <Table.Td>
              <Text>{details.debtor.username}</Text>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>
              <Text>What</Text>
            </Table.Td>
            <Table.Td>
              <Stack gap="xs">
                <Text>{details.title}</Text>
                <Text>{details.description}</Text>
              </Stack>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>
              <Text>When</Text>
            </Table.Td>
            <Table.Td>
              <Text>
                {Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }).format(new Date(details.updatedAt))}
              </Text>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Card>
  );
}
