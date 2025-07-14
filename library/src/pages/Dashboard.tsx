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
            <Text className="mt-4 text-gray-600">Loading dashboard...</Text>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Callout.Root color="red" className="border-red-200 bg-red-50">
          <Callout.Text className="text-red-700">Error: {error}</Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Heading size="8" className="text-gray-900">Library Dashboard</Heading>
          <Text className="text-gray-600 text-lg">
            Welcome to your library management system. Here's an overview of your library.
          </Text>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-blue-600 font-medium text-sm uppercase tracking-wide">Total Books</Text>
                <Heading size="6" className="text-gray-900 mt-1">{stats?.totalBooks || 0}</Heading>
                <Text className="text-blue-600 text-sm mt-1">In library catalog</Text>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📚</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-green-600 font-medium text-sm uppercase tracking-wide">Available Books</Text>
                <Heading size="6" className="text-gray-900 mt-1">{stats?.availableBooks || 0}</Heading>
                <Text className="text-green-600 text-sm mt-1">Ready for loan</Text>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">✅</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-purple-600 font-medium text-sm uppercase tracking-wide">Books on Loan</Text>
                <Heading size="6" className="text-gray-900 mt-1">{stats?.booksOnLoan || 0}</Heading>
                <Text className="text-purple-600 text-sm mt-1">Currently borrowed</Text>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📖</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-yellow-600 font-medium text-sm uppercase tracking-wide">Reserved Books</Text>
                <Heading size="6" className="text-gray-900 mt-1">{stats?.reservedBooks || 0}</Heading>
                <Text className="text-yellow-600 text-sm mt-1">Waiting for pickup</Text>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">⏰</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Second Row of Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-indigo-600 font-medium text-sm uppercase tracking-wide">Total Members</Text>
                <Heading size="6" className="text-gray-900 mt-1">{stats?.totalMembers || 0}</Heading>
                <Text className="text-indigo-600 text-sm mt-1">Registered members</Text>
              </div>
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">👥</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-cyan-600 font-medium text-sm uppercase tracking-wide">Active Loans</Text>
                <Heading size="6" className="text-gray-900 mt-1">{stats?.totalLoans || 0}</Heading>
                <Text className="text-cyan-600 text-sm mt-1">Current loans</Text>
              </div>
              <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📋</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-red-600 font-medium text-sm uppercase tracking-wide">Overdue Books</Text>
                <Heading size="6" className="text-gray-900 mt-1">{stats?.overdueBooks || 0}</Heading>
                <Text className="text-red-600 text-sm mt-1">Need attention</Text>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚠️</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-8 bg-white border-0 shadow-lg">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Heading size="5" className="text-gray-900">Quick Actions</Heading>
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
                    className="h-20 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">📚</span>
                      <div className="text-center">
                        <Text className="font-medium">Add New Book</Text>
                        <Text className="text-xs text-blue-600">Add to catalog</Text>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="soft" 
                    onClick={() => navigate("/members/new")}
                    className="h-20 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 text-green-700 hover:text-green-800 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">👤</span>
                      <div className="text-center">
                        <Text className="font-medium">Add New Member</Text>
                        <Text className="text-xs text-green-600">Register member</Text>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="soft" 
                    onClick={() => navigate("/loans/new")}
                    className="h-20 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 text-purple-700 hover:text-purple-800 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">📖</span>
                      <div className="text-center">
                        <Text className="font-medium">Create Loan</Text>
                        <Text className="text-xs text-purple-600">Loan a book</Text>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="soft" 
                    onClick={() => navigate("/loans")}
                    className="h-20 bg-gradient-to-r from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 border border-cyan-200 text-cyan-700 hover:text-cyan-800 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">📋</span>
                      <div className="text-center">
                        <Text className="font-medium">Manage Loans</Text>
                        <Text className="text-xs text-cyan-600">View all loans</Text>
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
                    className="h-20 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">🔍</span>
                      <div className="text-center">
                        <Text className="font-medium">Browse Books</Text>
                        <Text className="text-xs text-blue-600">View available books</Text>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="soft" 
                    onClick={() => navigate("/my-loans")}
                    className="h-20 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 text-green-700 hover:text-green-800 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">📚</span>
                      <div className="text-center">
                        <Text className="font-medium">My Loans</Text>
                        <Text className="text-xs text-green-600">View my loans</Text>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="soft" 
                    onClick={() => navigate("/my-reservations")}
                    className="h-20 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 text-purple-700 hover:text-purple-800 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">⏰</span>
                      <div className="text-center">
                        <Text className="font-medium">My Reservations</Text>
                        <Text className="text-xs text-purple-600">View my reservations</Text>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="soft" 
                    onClick={() => navigate("/reservations")}
                    className="h-20 bg-gradient-to-r from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 border border-cyan-200 text-cyan-700 hover:text-cyan-800 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">📝</span>
                      <div className="text-center">
                        <Text className="font-medium">Make Reservation</Text>
                        <Text className="text-xs text-cyan-600">Reserve a book</Text>
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
          <Callout.Root color="red" className="border-red-200 bg-red-50">
            <Callout.Text className="text-red-700">
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
          <Callout.Root color="yellow" className="border-yellow-200 bg-yellow-50">
            <Callout.Text className="text-yellow-700">
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