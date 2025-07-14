import {
  Heading,
  Button,
  Flex,
  Table,
  Text,
  Box,
  Callout,
  Spinner,
  Badge,
  IconButton,
} from "@radix-ui/themes";
import MainLayout from "../../components/MainLayout";
import { Link, useNavigate } from "react-router-dom";
import { useFrappePostCall } from "frappe-react-sdk";
import { useEffect } from "react";

interface LoanData {
  name: string;
  book: string;
  member: string;
  loan_date: string;
  return_date: string;
  returned: boolean;
  overdue: boolean;
  book_title?: string;
  member_name?: string;
}

interface GetLoansResponse {
  message: LoanData[];
}

const Loans = () => {
  const navigate = useNavigate();

  const {
    call: fetchLoans,
    result: apiResponse,
    loading: isLoading,
    error: fetchError,
  } = useFrappePostCall<GetLoansResponse>("library_app.api.get_loans");

  const loans: LoanData[] = apiResponse?.message || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchLoans({});
      } catch (error) {
        console.error("Failed to fetch loans:", error);
        // Error is already captured in fetchError
      }
    };
    fetchData();
  }, [fetchLoans]);

  if (isLoading && !apiResponse) {
    return (
      <MainLayout>
        <Flex justify="center" align="center" className="h-full">
          <Spinner size="3" /> <Text ml="2" className="text-gray-600 dark:text-gray-300">Loading loans...</Text>
        </Flex>
      </MainLayout>
    );
  }

  if (fetchError && !apiResponse) {
    return (
      <MainLayout>
        <Callout.Root color="red" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <Callout.Text className="text-red-700 dark:text-red-200">
            Error loading loans: {fetchError.message || JSON.stringify(fetchError)}
          </Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Heading className="text-gray-900 dark:text-gray-100">Loan List</Heading>
          <Button onClick={() => navigate("/loans/new")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl dark:shadow-xl"
          >New Loan</Button>
        </Flex>

        {fetchError && (
          <Callout.Root color="red" mt="2" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <Callout.Text className="text-red-700 dark:text-red-200">
              Error: {fetchError.message || JSON.stringify(fetchError)}
            </Callout.Text>
          </Callout.Root>
        )}

        {loans.length > 0 ? (
          <Table.Root variant="surface" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Book</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Member</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Loan Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Return Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Status</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {loans.map((loan) => (
                <Table.Row key={loan.name} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Table.Cell>{loan.book_title || loan.book}</Table.Cell>
                  <Table.Cell>{loan.member_name || loan.member}</Table.Cell>
                  <Table.Cell>{loan.loan_date}</Table.Cell>
                  <Table.Cell>{loan.return_date}</Table.Cell>
                  <Table.Cell>
                    <Flex gap="2" align="center">
                      {loan.returned ? (
                        <Badge color="green">Returned</Badge>
                      ) : loan.overdue ? (
                        <Badge color="red">Overdue</Badge>
                      ) : (
                        <Badge color="blue">Active</Badge>
                      )}
                      {!loan.returned && (
                        <IconButton
                          size="1"
                          variant="soft"
                          color="green"
                          onClick={() => navigate(`/loans/return/${loan.name}`)}
                        >
                          Mark Returned
                        </IconButton>
                      )}
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        ) : (
          <Box className="p-12 bg-white dark:bg-gray-900 border-0 shadow-lg dark:shadow-xl text-center rounded-lg">
            <div className="space-y-4">
              <div className="text-6xl">📋</div>
              <Heading size="4" className="text-gray-900 dark:text-gray-100">
                No loans found
              </Heading>
              <Text className="text-gray-600 dark:text-gray-300">
                Get started by creating a new loan
              </Text>
              <Button 
                onClick={() => navigate("/loans/new")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl dark:shadow-xl"
              >
                Add Your First Loan
              </Button>
            </div>
          </Box>
        )}
      </Flex>
    </MainLayout>
  );
};

export default Loans;
