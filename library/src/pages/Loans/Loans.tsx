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
          <Spinner size="3" /> <Text ml="2">Loading loans...</Text>
        </Flex>
      </MainLayout>
    );
  }

  if (fetchError && !apiResponse) {
    return (
      <MainLayout>
        <Callout.Root color="red">
          <Callout.Text>
            Error loading loans:{" "}
            {fetchError.message || JSON.stringify(fetchError)}
          </Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Heading>Loan List</Heading>
          <Button onClick={() => navigate("/loans/new")}>New Loan</Button>
        </Flex>

        {fetchError && (
          <Callout.Root color="red" mt="2">
            <Callout.Text>
              Error: {fetchError.message || JSON.stringify(fetchError)}
            </Callout.Text>
          </Callout.Root>
        )}

        {loans.length > 0 ? (
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
              {loans.map((loan) => (
                <Table.Row key={loan.name}>
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
          <Box>
            <Text>No loans found. Click "New Loan" to create one.</Text>
          </Box>
        )}
      </Flex>
    </MainLayout>
  );
};

export default Loans;
