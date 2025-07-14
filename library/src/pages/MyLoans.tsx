import {
  Heading,
  Flex,
  Table,
  Text,
  Box,
  Callout,
  Spinner,
  Badge,
} from "@radix-ui/themes";
import MainLayout from "../components/MainLayout";
import { useFrappePostCall } from "frappe-react-sdk";
import { useEffect, useState } from "react";

interface MyLoanData {
  name: string;
  book: string;
  book_title: string;
  book_author: string;
  loan_date: string;
  return_date: string;
  returned: boolean;
  overdue: boolean;
}

const MyLoans = () => {
  const [loans, setLoans] = useState<MyLoanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { call: getMyLoansCall } = useFrappePostCall("library_app.api.get_my_loans");

  useEffect(() => {
    const fetchMyLoans = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getMyLoansCall({});
        const myLoans = response?.message || [];
        setLoans(myLoans);
      } catch (err: any) {
        console.error("Error fetching my loans:", err);
        setError(err.message || "Failed to load your loans");
      } finally {
        setLoading(false);
      }
    };

    fetchMyLoans();
  }, [getMyLoansCall]);

  if (loading) {
    return (
      <MainLayout>
        <Flex justify="center" align="center" className="h-64">
          <Spinner size="3" />
          <Text ml="2">Loading your loans...</Text>
        </Flex>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Callout.Root color="red">
          <Callout.Text>Error: {error}</Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Flex direction="column" gap="4">
        <Heading>My Loans</Heading>

        {loans.length > 0 ? (
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Book Title</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Author</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Loan Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Return Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {loans.map((loan) => (
                <Table.Row key={loan.name}>
                  <Table.Cell>{loan.book_title}</Table.Cell>
                  <Table.Cell>{loan.book_author}</Table.Cell>
                  <Table.Cell>{loan.loan_date}</Table.Cell>
                  <Table.Cell>{loan.return_date}</Table.Cell>
                  <Table.Cell>
                    {loan.returned ? (
                      <Badge color="green">Returned</Badge>
                    ) : loan.overdue ? (
                      <Badge color="red">Overdue</Badge>
                    ) : (
                      <Badge color="blue">Active</Badge>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        ) : (
          <Box>
            <Text>You don't have any loans yet.</Text>
          </Box>
        )}
      </Flex>
    </MainLayout>
  );
};

export default MyLoans; 