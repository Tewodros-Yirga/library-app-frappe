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
          <Text ml="2" className="text-gray-600 dark:text-gray-300">Loading your loans...</Text>
        </Flex>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Callout.Root color="red" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <Callout.Text className="text-red-700 dark:text-red-200">Error: {error}</Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Flex direction="column" gap="4">
        <Heading className="text-gray-900 dark:text-gray-100">My Loans</Heading>

        {loans.length > 0 ? (
          <Table.Root variant="surface" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Book Title</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Author</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Loan Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Return Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Status</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {loans.map((loan) => (
                <Table.Row key={loan.name} className="hover:bg-gray-50 dark:hover:bg-gray-800">
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
          <Box className="p-12 bg-white dark:bg-gray-900 border-0 shadow-lg dark:shadow-xl text-center rounded-lg">
            <div className="space-y-4">
              <div className="text-6xl">📚</div>
              <Heading size="4" className="text-gray-900 dark:text-gray-100">
                You don't have any loans yet.
              </Heading>
              <Text className="text-gray-600 dark:text-gray-300">
                Browse books and borrow your first one!
              </Text>
            </div>
          </Box>
        )}
      </Flex>
    </MainLayout>
  );
};

export default MyLoans; 