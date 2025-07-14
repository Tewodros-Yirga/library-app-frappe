import { useParams, useNavigate } from "react-router-dom";
import { useFrappePostCall } from "frappe-react-sdk";
import { useEffect } from "react";
import MainLayout from "../../components/MainLayout";
import { Flex, Spinner, Callout, Button, Heading, Card } from "@radix-ui/themes";

export default function LoanReturn() {
  const { loan_name } = useParams<{ loan_name: string }>();
  const navigate = useNavigate();
  const { call: returnLoan, loading, error, result } = useFrappePostCall("library_app.api.return_book");

  useEffect(() => {
    if (loan_name) {
      returnLoan({loan_name: loan_name });
    }
  }, [loan_name, returnLoan]);

  if (loading) {
    return (
      <MainLayout>
        <Flex justify="center" align="center" className="h-64 mt-20">
          <Spinner size="3" />
          <Heading ml="2">Marking loan as returned...</Heading>
        </Flex>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Callout.Root color="red" className="mt-20">
          <Callout.Text>
            Error: {error.message || JSON.stringify(error)}
          </Callout.Text>
          <Button mt="4" onClick={() => navigate("/loans")}>Back to Loans</Button>
        </Callout.Root>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Card className="max-w-lg mx-auto mt-20 p-8 text-center">
        <Heading size="5" color="green" mb="4">
          Loan marked as returned!
        </Heading>
        <Button onClick={() => navigate("/loans")}>Back to Loans</Button>
      </Card>
    </MainLayout>
  );
}