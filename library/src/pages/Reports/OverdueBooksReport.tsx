// src/pages/Reports/OverdueBooksReport.tsx
import { useFrappePostCall } from "frappe-react-sdk";
import { useEffect } from "react";
import { Spinner, Table, Callout, Heading, Flex, Card, Text, Button } from "@radix-ui/themes";
import MainLayout from "../../components/MainLayout";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function OverdueBooksReport() {
  const { call, result, loading, error } = useFrappePostCall("library_app.api.get_overdue_books_report");
  const navigate = useNavigate();

  useEffect(() => {
    call({});
  }, [call]);

  useEffect(() => {
    if (error) toast.error(error.message || "Failed to load report");
  }, [error]);

  return (
    <MainLayout>
      <Flex direction="column" gap="4" className="mt-20">
        <Flex justify="between" align="center">
          <Heading>Overdue Books Report</Heading>
          <Button variant="soft" onClick={() => navigate(-1)}>Back</Button>
        </Flex>
        <Card>
          {loading ? (
            <Flex justify="center" align="center" className="h-32">
              <Spinner size="3" />
              <Text ml="2">Loading report...</Text>
            </Flex>
          ) : error ? (
            <Callout.Root color="red"><Callout.Text>{error.message || "Failed to load report"}</Callout.Text></Callout.Root>
          ) : (
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Book Title</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Member</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Member Email</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Loan Date</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Return Date</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {(result?.message || []).map((row: any) => (
                  <Table.Row key={row.loan_id}>
                    <Table.Cell>{row.book_title}</Table.Cell>
                    <Table.Cell>{row.member_name}</Table.Cell>
                    <Table.Cell>{row.member_email}</Table.Cell>
                    <Table.Cell>{row.loan_date}</Table.Cell>
                    <Table.Cell>{row.return_date}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </Card>
      </Flex>
    </MainLayout>
  );
}