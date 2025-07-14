import { BookmarkFilledIcon, FileTextIcon, BookmarkIcon } from "@radix-ui/react-icons";
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

interface MemberStats {
  totalBooks: number;
  availableBooks: number;
  booksOnLoan: number;
  reservedBooks: number;
}

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // API calls for statistics
  const { call: getBooksCall } = useFrappePostCall("library_app.api.get_books");
  // For exporting loan history
  const { call: exportLoanHistoryCall } = useFrappePostCall("library_app.api.export_member_loan_history");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const booksResponse = await getBooksCall({});
        const books = booksResponse?.message || [];
        const totalBooks = books.length;
        const availableBooks = books.filter((book: any) => book.status === "Available").length;
        const booksOnLoan = books.filter((book: any) => book.status === "On Loan").length;
        const reservedBooks = books.filter((book: any) => book.status === "Reserved").length;
        setStats({ totalBooks, availableBooks, booksOnLoan, reservedBooks });
      } catch (err: any) {
        setError(err.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [getBooksCall]);

  // Export loan history as CSV
  const handleExportLoanHistory = async () => {
    setExporting(true);
    try {
      // The backend should return a CSV file as a blob
      const response = await exportLoanHistoryCall({ format: "csv" });
      // If using frappe-react-sdk, you may need to fetch the file from a URL or handle differently
      // Here, we assume the response contains a 'file_url' or 'csv_content'
      if (response?.file_url) {
        window.open(response.file_url, "_blank");
      } else if (response?.csv_content) {
        // Download CSV from content
        const blob = new Blob([response.csv_content], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "loan_history.csv";
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Export failed: No CSV data returned.");
      }
    } catch (err: any) {
      alert("Export failed: " + (err.message || "Unknown error"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div className="space-y-2">
          <Heading size="8" className="text-gray-900 dark:text-gray-100">Member Dashboard</Heading>
          <Text className="text-gray-600 dark:text-gray-300 text-lg">
            Welcome! Here you can browse books, manage your loans and reservations, and export your loan history.
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
            <Grid columns={{ initial: "1", md: "2" }} gap="4">
              <Card className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900">
                <BookmarkFilledIcon width={32} height={32} className="text-blue-600 mb-2" />
                <Heading size="6">{stats?.totalBooks}</Heading>
                <Text>Total Books</Text>
              </Card>
              <Card className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900">
                <BookmarkFilledIcon width={32} height={32} className="text-green-600 mb-2" />
                <Heading size="6">{stats?.availableBooks}</Heading>
                <Text>Available Books</Text>
              </Card>
              <Card className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900">
                <FileTextIcon width={32} height={32} className="text-purple-600 mb-2" />
                <Heading size="6">{stats?.booksOnLoan}</Heading>
                <Text>Books on Loan</Text>
              </Card>
              <Card className="flex flex-col items-center p-4 bg-yellow-50 dark:bg-yellow-900">
                <BookmarkIcon width={32} height={32} className="text-yellow-600 mb-2" />
                <Heading size="6">{stats?.reservedBooks}</Heading>
                <Text>Reserved Books</Text>
              </Card>
            </Grid>
          )}
        </section>

        {/* No available books callout */}
        {stats && stats.availableBooks === 0 && (
          <Callout.Root color="yellow" className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
            <Callout.Text className="text-yellow-700 dark:text-yellow-200">
              <strong>Notice:</strong> No books are currently available for loan. Please check back later!
            </Callout.Text>
          </Callout.Root>
        )}

        {/* Quick Actions */}
        <section>
          <Heading size="5" className="mb-4">Quick Actions</Heading>
          <Grid columns={{ initial: "1", md: "2" }} gap="4">
            <Card className="flex flex-col gap-2 p-6">
              <Heading size="4">Browse Books</Heading>
              <Text>See all available books in the library.</Text>
              <Button onClick={() => navigate("/books")}>Browse Books</Button>
            </Card>
            <Card className="flex flex-col gap-2 p-6">
              <Heading size="4">My Loans</Heading>
              <Text>View your current and past loans.</Text>
              <Button onClick={() => navigate("/my-loans")}>My Loans</Button>
            </Card>
            <Card className="flex flex-col gap-2 p-6">
              <Heading size="4">My Reservations</Heading>
              <Text>View and manage your book reservations.</Text>
              <Button onClick={() => navigate("/my-reservations")}>My Reservations</Button>
            </Card>
            <Card className="flex flex-col gap-2 p-6">
              <Heading size="4">Make a Reservation</Heading>
              <Text>Reserve a book to borrow when it becomes available.</Text>
              <Button onClick={() => navigate("/reservations")}>Make Reservation</Button>
            </Card>
            <Card className="flex flex-col gap-2 p-6">
              <Heading size="4">Export Loan History</Heading>
              <Text>Download your loan history as a CSV file.</Text>
              <Button onClick={handleExportLoanHistory} disabled={exporting}>
                {exporting ? <Spinner size="1" /> : "Export Loan History"}
              </Button>
            </Card>
          </Grid>
        </section>

        {/* Future features for members can be added here */}
      </div>
    </MainLayout>
  );
}