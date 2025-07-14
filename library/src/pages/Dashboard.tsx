import { 
  Heading, 
  Flex, 
  Card, 
  Text, 
  Button, 
  Grid, 
  Spinner,
  Callout,
  Badge
} from "@radix-ui/themes";
import { useFrappePostCall } from "frappe-react-sdk";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { useUserRoles } from "../hooks/useUserRoles";

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
  const { isLibrarian, isMember, isAdmin } = useUserRoles();
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
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Spinner size="3" />
            <Text className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard...</Text>
          </div>
        </div>
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
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Heading size="8" className="text-gray-900 dark:text-gray-100">Library Dashboard</Heading>
          <Text className="text-gray-600 dark:text-gray-300 text-lg">
            Welcome to your library management system. Here's an overview of your library.
          </Text>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-blue-600 dark:text-blue-300 font-medium text-sm uppercase tracking-wide">Total Books</Text>
                <Heading size="6" className="text-gray-900 dark:text-gray-100 mt-1">{stats?.totalBooks || 0}</Heading>
                <Text className="text-blue-600 dark:text-blue-300 text-sm mt-1">In library catalog</Text>
              </div>
              <div className="w-12 h-12 bg-blue-500 dark:bg-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📚</span>
              </div>
            </div>
          </Card>

          {/* Card 2 */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-950 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-green-600 dark:text-green-300 font-medium text-sm uppercase tracking-wide">Available Books</Text>
                <Heading size="6" className="text-gray-900 dark:text-gray-100 mt-1">{stats?.availableBooks || 0}</Heading>
                <Text className="text-green-600 dark:text-green-300 text-sm mt-1">Ready for loan</Text>
              </div>
              <div className="w-12 h-12 bg-green-500 dark:bg-green-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">✅</span>
              </div>
            </div>
          </Card>

          {/* Card 3 */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-950 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-purple-600 dark:text-purple-300 font-medium text-sm uppercase tracking-wide">Books on Loan</Text>
                <Heading size="6" className="text-gray-900 dark:text-gray-100 mt-1">{stats?.booksOnLoan || 0}</Heading>
                <Text className="text-purple-600 dark:text-purple-300 text-sm mt-1">Currently borrowed</Text>
              </div>
              <div className="w-12 h-12 bg-purple-500 dark:bg-purple-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📖</span>
              </div>
            </div>
          </Card>

          {/* Card 4 */}
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-950 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-yellow-600 dark:text-yellow-300 font-medium text-sm uppercase tracking-wide">Reserved Books</Text>
                <Heading size="6" className="text-gray-900 dark:text-gray-100 mt-1">{stats?.reservedBooks || 0}</Heading>
                <Text className="text-yellow-600 dark:text-yellow-300 text-sm mt-1">Waiting for pickup</Text>
              </div>
              <div className="w-12 h-12 bg-yellow-500 dark:bg-yellow-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">⏰</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Second Row of Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-950 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-indigo-600 dark:text-indigo-300 font-medium text-sm uppercase tracking-wide">Total Members</Text>
                <Heading size="6" className="text-gray-900 dark:text-gray-100 mt-1">{stats?.totalMembers || 0}</Heading>
                <Text className="text-indigo-600 dark:text-indigo-300 text-sm mt-1">Registered members</Text>
              </div>
              <div className="w-12 h-12 bg-indigo-500 dark:bg-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">👥</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900 dark:to-cyan-950 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-cyan-600 dark:text-cyan-300 font-medium text-sm uppercase tracking-wide">Active Loans</Text>
                <Heading size="6" className="text-gray-900 dark:text-gray-100 mt-1">{stats?.totalLoans || 0}</Heading>
                <Text className="text-cyan-600 dark:text-cyan-300 text-sm mt-1">Current loans</Text>
              </div>
              <div className="w-12 h-12 bg-cyan-500 dark:bg-cyan-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📋</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-950 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-red-600 dark:text-red-300 font-medium text-sm uppercase tracking-wide">Overdue Books</Text>
                <Heading size="6" className="text-gray-900 dark:text-gray-100 mt-1">{stats?.overdueBooks || 0}</Heading>
                <Text className="text-red-600 dark:text-red-300 text-sm mt-1">Need attention</Text>
              </div>
              <div className="w-12 h-12 bg-red-500 dark:bg-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚠️</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-8 bg-white dark:bg-gray-900 border-0 shadow-lg dark:shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Heading size="5" className="text-gray-900 dark:text-gray-100">Quick Actions</Heading>
              <Badge variant="soft" color="blue">
                {isLibrarian ? "Librarian" : isMember ? "Member" : "Admin"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Librarian Actions */}
              {isLibrarian && (
                <>
                  <Button 
                    variant="soft" 
                    onClick={() => navigate("/books/new")}
                    className="h-20 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800 dark:hover:to-blue-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200 hover:text-blue-800 dark:hover:text-blue-100 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">📚</span>
                      <div className="text-center">
                        <Text className="font-medium">Add New Book</Text>
                        <Text className="text-xs text-blue-600 dark:text-blue-200">Add to catalog</Text>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="soft" 
                    onClick={() => navigate("/members/new")}
                    className="h-20 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-950 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800 dark:hover:to-green-900 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-200 hover:text-green-800 dark:hover:text-green-100 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">👤</span>
                      <div className="text-center">
                        <Text className="font-medium">Add New Member</Text>
                        <Text className="text-xs text-green-600 dark:text-green-200">Register member</Text>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="soft" 
                    onClick={() => navigate("/loans/new")}
                    className="h-20 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-950 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800 dark:hover:to-purple-900 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-200 hover:text-purple-800 dark:hover:text-purple-100 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">📖</span>
                      <div className="text-center">
                        <Text className="font-medium">Create Loan</Text>
                        <Text className="text-xs text-purple-600 dark:text-purple-200">Loan a book</Text>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="soft" 
                    onClick={() => navigate("/loans")}
                    className="h-20 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900 dark:to-cyan-950 hover:from-cyan-100 hover:to-cyan-200 dark:hover:from-cyan-800 dark:hover:to-cyan-900 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-200 hover:text-cyan-800 dark:hover:text-cyan-100 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">📋</span>
                      <div className="text-center">
                        <Text className="font-medium">Manage Loans</Text>
                        <Text className="text-xs text-cyan-600 dark:text-cyan-200">View all loans</Text>
                      </div>
                    </div>
                  </Button>
                </>
              )}

              {/* Member Actions */}
              {isMember && !isLibrarian && (
                <>
                  <Button 
                    variant="soft" 
                    onClick={() => navigate("/books")}
                    className="h-20 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800 dark:hover:to-blue-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200 hover:text-blue-800 dark:hover:text-blue-100 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">🔍</span>
                      <div className="text-center">
                        <Text className="font-medium">Browse Books</Text>
                        <Text className="text-xs text-blue-600 dark:text-blue-200">View available books</Text>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="soft" 
                    onClick={() => navigate("/my-loans")}
                    className="h-20 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-950 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800 dark:hover:to-green-900 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-200 hover:text-green-800 dark:hover:text-green-100 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">📚</span>
                      <div className="text-center">
                        <Text className="font-medium">My Loans</Text>
                        <Text className="text-xs text-green-600 dark:text-green-200">View my loans</Text>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="soft" 
                    onClick={() => navigate("/my-reservations")}
                    className="h-20 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-950 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800 dark:hover:to-purple-900 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-200 hover:text-purple-800 dark:hover:text-purple-100 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">⏰</span>
                      <div className="text-center">
                        <Text className="font-medium">My Reservations</Text>
                        <Text className="text-xs text-purple-600 dark:text-purple-200">View my reservations</Text>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="soft" 
                    onClick={() => navigate("/reservations")}
                    className="h-20 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900 dark:to-cyan-950 hover:from-cyan-100 hover:to-cyan-200 dark:hover:from-cyan-800 dark:hover:to-cyan-900 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-200 hover:text-cyan-800 dark:hover:text-cyan-100 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">📝</span>
                      <div className="text-center">
                        <Text className="font-medium">Make Reservation</Text>
                        <Text className="text-xs text-cyan-600 dark:text-cyan-200">Reserve a book</Text>
                      </div>
                    </div>
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Alerts Section */}
        {stats && stats.overdueBooks > 0 && (
          <Callout.Root color="red" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <Callout.Text className="text-red-700 dark:text-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Attention:</strong> You have {stats.overdueBooks} overdue book(s) that need attention.
                </div>
                <Button 
                  variant="soft" 
                  color="red" 
                  onClick={() => navigate("/loans")}
                  className="ml-4"
                >
                  View Overdue Books
                </Button>
              </div>
            </Callout.Text>
          </Callout.Root>
        )}

        {stats && stats.availableBooks === 0 && (
          <Callout.Root color="yellow" className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
            <Callout.Text className="text-yellow-700 dark:text-yellow-200">
              <strong>Notice:</strong> No books are currently available for loan. 
              Consider adding more books to your catalog.
            </Callout.Text>
          </Callout.Root>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;