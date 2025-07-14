import {
  BookmarkFilledIcon,
  AvatarIcon,
  FileTextIcon,
  ExclamationTriangleIcon,
  BookmarkIcon,
  GearIcon
} from "@radix-ui/react-icons";
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
  reservations: number;
  users: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API calls for statistics
  const { call: getBooksCall } = useFrappePostCall("library_app.api.get_books");
  const { call: getMembersCall } = useFrappePostCall("library_app.api.get_members");
  const { call: getLoansCall } = useFrappePostCall("library_app.api.get_loans");
  const { call: getOverdueCall } = useFrappePostCall("library_app.api.get_overdue_books_report");
  const { call: getReservationsCall } = useFrappePostCall("library_app.api.get_reservations");
  // If you have a users endpoint, use it; otherwise, use members count for now
  // const { call: getUsersCall } = useFrappePostCall("library_app.api.get_users");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [
          booksResponse,
          membersResponse,
          loansResponse,
          overdueResponse,
          reservationsResponse
          // usersResponse
        ] = await Promise.all([
          getBooksCall({}),
          getMembersCall({}),
          getLoansCall({}),
          getOverdueCall({}),
          getReservationsCall({})
          // getUsersCall({})
        ]);

        const books = booksResponse?.message || [];
        const members = membersResponse?.message || [];
        const loans = loansResponse?.message || [];
        const overdueBooks = overdueResponse?.message || [];
        const reservations = reservationsResponse?.message || [];
        // const users = usersResponse?.message || [];

        // Calculate statistics
        const totalBooks = books.length;
        const availableBooks = books.filter((book: any) => book.status === "Available").length;
        const booksOnLoan = books.filter((book: any) => book.status === "On Loan").length;
        const reservedBooks = books.filter((book: any) => book.status === "Reserved").length;
        const totalMembers = members.length;
        const totalLoans = loans.length;
        const overdueCount = overdueBooks.length;
        const reservationsCount = reservations.length;
        // const usersCount = users.length;
        const usersCount = members.length; // fallback if no users endpoint

        setStats({
          totalBooks,
          availableBooks,
          booksOnLoan,
          reservedBooks,
          totalMembers,
          totalLoans,
          overdueBooks: overdueCount,
          reservations: reservationsCount,
          users: usersCount
        });

      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getBooksCall, getMembersCall, getLoansCall, getOverdueCall, getReservationsCall]);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <Heading size="8" className="text-gray-900 dark:text-gray-100">Admin Dashboard</Heading>
          <Text className="text-gray-600 dark:text-gray-300 text-lg">
            Welcome, Admin. Here’s a complete overview and management panel for your library system.
          </Text>
        </div>

        {/* Stats Overview */}
        <section>
          <Heading size="5" className="mb-4">Library Overview</Heading>
          {loading ? (
            <Flex justify="center" align="center" className="h-32">
              <Spinner size="3" />
              <Text ml="2">Loading stats...</Text>
            </Flex>
          ) : error ? (
            <Callout.Root color="red"><Callout.Text>{error}</Callout.Text></Callout.Root>
          ) : (
            <Grid columns={{ initial: "1", md: "2", lg: "3" }} gap="4">
              <Card className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900">
                <BookmarkFilledIcon width={32} height={32} className="text-blue-600 mb-2" />
                <Heading size="6">{stats?.totalBooks}</Heading>
                <Text>Books</Text>
              </Card>
              <Card className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900">
                <AvatarIcon width={32} height={32} className="text-green-600 mb-2" />
                <Heading size="6">{stats?.totalMembers}</Heading>
                <Text>Members</Text>
              </Card>
              <Card className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900">
                <FileTextIcon width={32} height={32} className="text-purple-600 mb-2" />
                <Heading size="6">{stats?.totalLoans}</Heading>
                <Text>Loans</Text>
              </Card>
              <Card className="flex flex-col items-center p-4 bg-red-50 dark:bg-red-900">
                <ExclamationTriangleIcon width={32} height={32} className="text-red-600 mb-2" />
                <Heading size="6">{stats?.overdueBooks}</Heading>
                <Text>Overdue</Text>
              </Card>
              <Card className="flex flex-col items-center p-4 bg-yellow-50 dark:bg-yellow-900">
                <BookmarkIcon width={32} height={32} className="text-yellow-600 mb-2" />
                <Heading size="6">{stats?.reservations}</Heading>
                <Text>Reservations</Text>
              </Card>
              <Card className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900">
                <AvatarIcon width={32} height={32} className="text-gray-600 mb-2" />
                <Heading size="6">{stats?.users}</Heading>
                <Text>Users</Text>
              </Card>
            </Grid>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <Heading size="5" className="mb-4">Quick Actions</Heading>
          <Grid columns={{ initial: "1", md: "2", lg: "3" }} gap="4">
            <Card className="flex flex-col gap-2 p-6">
              <Heading size="4">Manage Books</Heading>
              <Text>View, add, edit, or remove books from the catalog.</Text>
              <Button onClick={() => navigate("/books")}>Go to Books</Button>
            </Card>
            <Card className="flex flex-col gap-2 p-6">
              <Heading size="4">Manage Members</Heading>
              <Text>Register, edit, or remove library members.</Text>
              <Button onClick={() => navigate("/members")}>Go to Members</Button>
            </Card>
            <Card className="flex flex-col gap-2 p-6">
              <Heading size="4">Manage Loans</Heading>
              <Text>Loan out books and manage returns.</Text>
              <Button onClick={() => navigate("/loans")}>Go to Loans</Button>
            </Card>
            <Card className="flex flex-col gap-2 p-6">
              <Heading size="4">Manage Reservations</Heading>
              <Text>View and manage book reservations and queues.</Text>
              <Button onClick={() => navigate("/reservations")}>Go to Reservations</Button>
            </Card>
            <Card className="flex flex-col gap-2 p-6">
              <Heading size="4">User & Role Management</Heading>
              <Text>Assign roles, reset passwords, and manage users.</Text>
              <Button onClick={() => navigate("/users")}>Go to Users</Button>
            </Card>
            <Card className="flex flex-col gap-2 p-6">
              <Heading size="4">Send Overdue Reminders</Heading>
              <Text>Trigger email reminders for overdue books.</Text>
              <Button color="red" onClick={() => navigate("/overdue/notify")}>Send Reminders</Button>
            </Card>
          </Grid>
        </section>

        {/* Reports Section */}
        <section>
          <Heading size="5" className="mb-4">Reports</Heading>
          <Flex gap="4">
            <Button variant="soft" onClick={() => navigate("/reports/loans")}>Books on Loan Report</Button>
            <Button variant="soft" color="red" onClick={() => navigate("/reports/overdue")}>Overdue Books Report</Button>
          </Flex>
        </section>

        {/* System Settings Section */}
        <section>
          <Heading size="5" className="mb-4">System Settings</Heading>
          <Card className="flex flex-col gap-2 p-6">
            <Flex align="center" gap="2">
              <GearIcon />
              <Text>System configuration and advanced settings (coming soon).</Text>
            </Flex>
            {/* Add real settings here in the future */}
          </Card>
        </section>
      </div>
    </MainLayout>
  );
}