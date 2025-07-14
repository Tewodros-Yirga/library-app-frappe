import MainLayout from "../components/MainLayout";
import { Button, Heading, Card, Text } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";

export default function MemberDashboard() {
  const navigate = useNavigate();

  const handleExportLoanHistory = async () => {
    // Call your backend API to get CSV, then trigger download
    const response = await fetch("/api/export_my_loan_history");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "loan_history.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <Heading>Member Dashboard</Heading>
      <Card>
        <Text>Quick Actions:</Text>
        <Button onClick={() => navigate("/books")}>Browse Books</Button>
        <Button onClick={() => navigate("/my-loans")}>My Loans</Button>
        <Button onClick={() => navigate("/my-reservations")}>My Reservations</Button>
        <Button onClick={handleExportLoanHistory}>Export My Loan History</Button>
      </Card>
    </MainLayout>
  );
}