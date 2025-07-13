import { 
  Heading, 
  Flex, 
  Card, 
  Text, 
  Button, 
  Grid, 
  Spinner,
  Callout 
} from "@radix-ui/themes";
import { useFrappePostCall } from "frappe-react-sdk";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";

interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  booksOnLoan: number;
  reservedBooks: number;
  totalMembers: number;
  totalLoans: number;
  overdueBooks: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API calls for statistics
  const { call: getBooksCall } = useFrappePostCall("library_app.api.get_books");
  const { call: getMembersCall } = useFrappePostCall("library_app.api.get_members");
  const { call: getLoansCall } = useFrappePostCall("library_app.api.get_loans");
  const { call: getOverdueCall } = useFrappePostCall("library_app.api.get_overdue_books_report");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [booksResponse, membersResponse, loansResponse, overdueResponse] = await Promise.all([
          getBooksCall({}),
          getMembersCall({}),
          getLoansCall({}),
          getOverdueCall({})
        ]);

        const books = booksResponse?.message || [];
        const members = membersResponse?.message || [];
        const loans = loansResponse?.message || [];
        const overdueBooks = overdueResponse?.message || [];

        // Calculate statistics
        const totalBooks = books.length;
        const availableBooks = books.filter(book => book.status === "Available").length;
        const booksOnLoan = books.filter(book => book.status === "On Loan").length;
        const reservedBooks = books.filter(book => book.status === "Reserved").length;
        const totalMembers = members.length;
        const totalLoans = loans.length;
        const overdueCount = overdueBooks.length;

        setStats({
          totalBooks,
          availableBooks,
          booksOnLoan,
          reservedBooks,
          totalMembers,
          totalLoans,
          overdueBooks: overdueCount
        });

      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getBooksCall, getMembersCall, getLoansCall, getOverdueCall]);

  if (loading) {
    return (
      <MainLayout>
        <Flex justify="center" align="center" className="h-64">
          <Spinner size="3" />
          <Text ml="2">Loading dashboard...</Text>
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
      <Flex direction="column" gap="6">
        {/* Header */}
        <Flex direction="column" gap="2">
          <Heading size="8">Library Management Dashboard</Heading>
          <Text color="gray" size="3">
            Welcome to your library management system. Here's an overview of your library.
          </Text>
        </Flex>

        {/* Statistics Cards */}
        <Grid columns="4" gap="4">
          <Card className="p-4">
            <Flex direction="column" gap="2">
              <Text size="2" color="gray">Total Books</Text>
              <Heading size="6">{stats?.totalBooks || 0}</Heading>
              <Text size="1" color="gray">In library catalog</Text>
            </Flex>
          </Card>

          <Card className="p-4">
            <Flex direction="column" gap="2">
              <Text size="2" color="gray">Available Books</Text>
              <Heading size="6" color="green">{stats?.availableBooks || 0}</Heading>
              <Text size="1" color="gray">Ready for loan</Text>
            </Flex>
          </Card>

          <Card className="p-4">
            <Flex direction="column" gap="2">
              <Text size="2" color="gray">Books on Loan</Text>
              <Heading size="6" color="blue">{stats?.booksOnLoan || 0}</Heading>
              <Text size="1" color="gray">Currently borrowed</Text>
            </Flex>
          </Card>

          <Card className="p-4">
            <Flex direction="column" gap="2">
              <Text size="2" color="gray">Reserved Books</Text>
              <Heading size="6" color="yellow">{stats?.reservedBooks || 0}</Heading>
              <Text size="1" color="gray">Waiting for pickup</Text>
            </Flex>
          </Card>
        </Grid>

        {/* Second Row of Statistics */}
        <Grid columns="3" gap="4">
          <Card className="p-4">
            <Flex direction="column" gap="2">
              <Text size="2" color="gray">Total Members</Text>
              <Heading size="6">{stats?.totalMembers || 0}</Heading>
              <Text size="1" color="gray">Registered members</Text>
            </Flex>
          </Card>

          <Card className="p-4">
            <Flex direction="column" gap="2">
              <Text size="2" color="gray">Active Loans</Text>
              <Heading size="6" color="blue">{stats?.totalLoans || 0}</Heading>
              <Text size="1" color="gray">Current loans</Text>
            </Flex>
          </Card>

          <Card className="p-4">
            <Flex direction="column" gap="2">
              <Text size="2" color="gray">Overdue Books</Text>
              <Heading size="6" color="red">{stats?.overdueBooks || 0}</Heading>
              <Text size="1" color="gray">Need attention</Text>
            </Flex>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Card className="p-6">
          <Flex direction="column" gap="4">
            <Heading size="5">Quick Actions</Heading>
            <Grid columns="4" gap="3">
              <Button 
                variant="soft" 
                onClick={() => navigate("/books/new")}
                className="h-16"
              >
                <Flex direction="column" gap="1" align="center">
                  <Text size="2">Add New Book</Text>
                  <Text size="1" color="gray">Add to catalog</Text>
                </Flex>
              </Button>

              <Button 
                variant="soft" 
                onClick={() => navigate("/members/new")}
                className="h-16"
              >
                <Flex direction="column" gap="1" align="center">
                  <Text size="2">Register Member</Text>
                  <Text size="1" color="gray">New member signup</Text>
                </Flex>
              </Button>

              <Button 
                variant="soft" 
                onClick={() => navigate("/loans/new")}
                className="h-16"
              >
                <Flex direction="column" gap="1" align="center">
                  <Text size="2">Create Loan</Text>
                  <Text size="1" color="gray">Lend a book</Text>
                </Flex>
              </Button>

              <Button 
                variant="soft" 
                onClick={() => navigate("/loans")}
                className="h-16"
              >
                <Flex direction="column" gap="1" align="center">
                  <Text size="2">Manage Loans</Text>
                  <Text size="1" color="gray">View all loans</Text>
                </Flex>
              </Button>
            </Grid>
          </Flex>
        </Card>

        {/* Alerts Section */}
        {stats && stats.overdueBooks > 0 && (
          <Callout.Root color="red">
            <Callout.Text>
              <strong>Attention:</strong> You have {stats.overdueBooks} overdue book(s) that need attention. 
              <Button 
                variant="soft" 
                color="red" 
                ml="3"
                onClick={() => navigate("/loans")}
              >
                View Overdue Books
              </Button>
            </Callout.Text>
          </Callout.Root>
        )}

        {stats && stats.availableBooks === 0 && (
          <Callout.Root color="yellow">
            <Callout.Text>
              <strong>Notice:</strong> No books are currently available for loan. 
              Consider adding more books to your catalog.
            </Callout.Text>
          </Callout.Root>
        )}
      </Flex>
    </MainLayout>
  );
};

export default Dashboard;