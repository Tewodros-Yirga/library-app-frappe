import MainLayout from "../components/MainLayout";
import { Button, Heading, Card, Text } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <Heading>Admin Dashboard</Heading>
      <Card>
        <Text>Quick Actions:</Text>
        <Button onClick={() => navigate("/books")}>Manage Books</Button>
        <Button onClick={() => navigate("/members")}>Manage Members</Button>
        <Button onClick={() => navigate("/loans/new")}>Create Loan</Button>
        <Button onClick={() => navigate("/reservations")}>Manage Reservations</Button>
        <Button onClick={() => navigate("/reports/loans")}>Books on Loan Report</Button>
        <Button onClick={() => navigate("/reports/overdue")}>Overdue Books Report</Button>
        <Button onClick={() => navigate("/overdue/notify")}>Send Overdue Reminders</Button>
        <Button onClick={() => navigate("/users")}>User/Role Management</Button>
      </Card>
    </MainLayout>
  );
}