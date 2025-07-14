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
  Card,
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
// In your Loans.tsx, filter out returned loans
const activeLoans: LoanData[] = loans.filter(loan => !loan.returned);
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
        <Flex justify="center" align="center" className="h-full mt-20">
          <Spinner size="3" /> <Text ml="2" className="text-gray-600 dark:text-gray-300">Loading loans...</Text>
        </Flex>
      </MainLayout>
    );
  }

  if (fetchError && !apiResponse) {
    return (
      <MainLayout>
        <Callout.Root color="red" className="mt-20 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <Callout.Text className="text-red-700 dark:text-red-200">
            Error loading loans: {fetchError.message || JSON.stringify(fetchError)}
          </Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Card className="p-6 mt-20">
        <Flex direction="column" gap="4">
          <Flex justify="between" align="center" className="mb-6">
            <Heading size="6">Loans Catalog</Heading>
            <Button onClick={() => navigate("/loans/new")} aria-label="Add new loan">
              New Loan
            </Button>
          </Flex>

          {fetchError && (
            <Callout.Root color="red" mt="2">
              <Callout.Text>
                Error: {fetchError.message || JSON.stringify(fetchError)}
              </Callout.Text>
            </Callout.Root>
          )}

          {activeLoans.length > 0 ? (
            <Table.Root variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Book</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Member</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Loan Date</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Return Date</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {activeLoans.map((loan) => (
                  <Table.Row key={loan.name}>
                    <Table.Cell>{loan.book_title }</Table.Cell>
                    <Table.Cell>{loan.member_name}</Table.Cell>
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
                          <Button
                            size="1"
                            variant="soft"
                            color="green"
                            onClick={() => navigate(`/loans/return/${loan.name}`)}
                          >
                            Mark Returned
                          </Button>
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
      </Card>
    </MainLayout>
  );
};

export default Loans;
