// library-bench/apps/library_app/library/src/pages/Books/Books.tsx
import {
  Heading,
  Button,
  Flex,
  Text,
  Box,
  Callout,
  Spinner,
  IconButton,
  AlertDialog,
  TextField,
  Badge,
  Card,
  Grid,
} from "@radix-ui/themes";
import MainLayout from "../../components/MainLayout";
import { Link, useNavigate } from "react-router-dom";
import { useFrappePostCall, useFrappeDeleteDoc } from "frappe-react-sdk";
import { Pencil1Icon, TrashIcon, BookmarkIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useUserRoles } from "../../hooks/useUserRoles";

// Define the type for Book data
interface BookData {
  name: string;
  title: string;
  author: string;
  publish_date: string;
  isbn: string;
  status: "Available" | "On Loan" | "Reserved";
}

// Define the type for the API response
interface GetBooksResponse {
  message: BookData[];
}

const Books = () => {
  const navigate = useNavigate();
  const { isLibrarian } = useUserRoles();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Hook to fetch all books using useFrappePostCall
  const {
    call: fetchBooksCall,
    result: apiResponse,
    loading: isLoading,
    error: fetchError,
    isCompleted: fetchCompleted,
  } = useFrappePostCall<GetBooksResponse>("library_app.api.get_books");

  // Extract the actual array of books from the message property
  const books: BookData[] = apiResponse?.message || [];

  // Hook for deleting a book
  const {
    deleteDoc,
    loading: isDeleting,
    error: deleteError,
    isCompleted: deleteCompleted,
    reset: resetDelete,
  } = useFrappeDeleteDoc();

  // Hook for creating reservations
  const { call: createReservationCall } = useFrappePostCall(
    "library_app.api.create_reservation"
  );

  // Use useEffect to trigger the initial fetch when component mounts
  useEffect(() => {
    fetchBooksCall({});
  }, [fetchBooksCall]);

  // Filter books based on search term and status
  const filteredBooks = books.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || book.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Handle deletion of a book
  const handleDelete = async (name: string, title: string) => {
    try {
      await deleteDoc("Book", name);
      console.log(`Book "${title}" deleted successfully.`);
      fetchBooksCall({});
      resetDelete();
    } catch (err: any) {
      console.error("Failed to delete book:", err);
      const errorMessage = err.messages
        ? err.messages[0]
        : err.message || "An unknown error occurred.";
      alert(`Error deleting book: ${errorMessage}`);
    }
  };

  // Handle reservation of a book
  const handleReserve = async (bookName: string, bookTitle: string) => {
    try {
      const memberName = prompt("Enter member name for reservation:");
      if (!memberName) return;

      await createReservationCall({
        book_name: bookName,
        member_name: memberName
      });
      alert(`Reservation created successfully for "${bookTitle}"`);
      fetchBooksCall({});
    } catch (err: any) {
      console.error("Failed to create reservation:", err);
      const errorMessage = err.messages
        ? err.messages[0]
        : err.message || "An unknown error occurred.";
      alert(`Error creating reservation: ${errorMessage}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "green";
      case "On Loan": return "red";
      case "Reserved": return "yellow";
      default: return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Available": return "✅";
      case "On Loan": return "📖";
      case "Reserved": return "⏰";
      default: return "❓";
    }
  };

  const combinedLoading = isLoading || isDeleting;
  const combinedError = fetchError || deleteError;

  if (combinedLoading && !apiResponse) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Spinner size="3" />
            <Text className="mt-4 text-gray-600 dark:text-gray-300">Loading books...</Text>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (combinedError && !apiResponse) {
    return (
      <MainLayout>
        <Callout.Root color="red" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <Callout.Text className="text-red-700 dark:text-red-200">
            Error loading books: {combinedError.message || JSON.stringify(combinedError)}
          </Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Heading size="7" className="text-gray-900 dark:text-gray-100">Book Catalog</Heading>
            <Text className="text-gray-600 dark:text-gray-300 mt-1">
              Browse and manage your library's book collection
            </Text>
          </div>
          {isLibrarian && (
            <Button 
              onClick={() => navigate("/books/new")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl dark:shadow-xl"
            >
              <span className="mr-2">📚</span>
              Add New Book
            </Button>
          )}
        </div>

        {/* Search and Filter */}
        <Card className="p-6 bg-white dark:bg-gray-900 border-0 shadow-lg dark:shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">Search Books</Text>
              <TextField.Root
                placeholder="Search by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              >
                <TextField.Slot>
                  <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>
              </TextField.Root>
            </div>
            <div>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">Filter by Status</Text>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="On Loan">On Loan</option>
                <option value="Reserved">Reserved</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Status Messages */}
        {isDeleting && (
          <Callout.Root color="yellow" className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
            <Callout.Text className="text-yellow-700 dark:text-yellow-200">
              <Spinner size="1" /> Deleting book...
            </Callout.Text>
          </Callout.Root>
        )}
        
        {combinedError && (
          <Callout.Root color="red" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <Callout.Text className="text-red-700 dark:text-red-200">
              Error: {combinedError.message || JSON.stringify(combinedError)}
            </Callout.Text>
          </Callout.Root>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <Text className="text-gray-600 dark:text-gray-300">
            Showing {filteredBooks.length} of {books.length} books
          </Text>
          {searchTerm && (
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Search results for: "{searchTerm}"
            </Text>
          )}
        </div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <Grid columns={{ initial: "1", sm: "2", lg: "3" }} gap="4">
            {filteredBooks.map((book: BookData) => (
              <Card key={book.name} className="p-6 bg-white dark:bg-gray-900 border-0 shadow-lg dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl transition-shadow">
                <div className="space-y-4">
                  {/* Book Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Heading size="4" className="text-gray-900 dark:text-gray-100 line-clamp-2">
                        {book.title}
                      </Heading>
                      <Text className="text-gray-600 dark:text-gray-300 mt-1">by {book.author}</Text>
                    </div>
                    <Badge 
                      variant="soft" 
                      color={getStatusColor(book.status) as any}
                      className="ml-2"
                    >
                      <span className="mr-1">{getStatusIcon(book.status)}</span>
                      {book.status}
                    </Badge>
                  </div>

                  {/* Book Details */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium w-20">ISBN:</span>
                      <span className="font-mono">{book.isbn}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium w-20">Published:</span>
                      <span>{book.publish_date}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    {isLibrarian && (
                      <>
                        <IconButton
                          variant="soft"
                          color="blue"
                          onClick={() => navigate(`/books/edit/${book.name}`)}
                          className="flex-1"
                        >
                          <Pencil1Icon />
                          <span className="ml-1 text-xs">Edit</span>
                        </IconButton>
                        
                        <AlertDialog.Root>
                          <AlertDialog.Trigger>
                            <IconButton
                              variant="soft"
                              color="red"
                              className="flex-1"
                            >
                              <TrashIcon />
                              <span className="ml-1 text-xs">Delete</span>
                            </IconButton>
                          </AlertDialog.Trigger>
                          <AlertDialog.Content>
                            <AlertDialog.Title>Delete Book</AlertDialog.Title>
                            <AlertDialog.Description>
                              Are you sure you want to delete "{book.title}"? This action cannot be undone.
                            </AlertDialog.Description>
                            <Flex gap="3" mt="4" justify="end">
                              <AlertDialog.Cancel>
                                <Button variant="soft" color="gray">
                                  Cancel
                                </Button>
                              </AlertDialog.Cancel>
                              <AlertDialog.Action>
                                <Button 
                                  variant="solid" 
                                  color="red"
                                  onClick={() => handleDelete(book.name, book.title)}
                                >
                                  Delete
                                </Button>
                              </AlertDialog.Action>
                            </Flex>
                          </AlertDialog.Content>
                        </AlertDialog.Root>
                      </>
                    )}
                    
                    {book.status === "Available" && (
                      <Button
                        variant="soft"
                        color="green"
                        onClick={() => handleReserve(book.name, book.title)}
                        className="flex-1"
                      >
                        <BookmarkIcon />
                        <span className="ml-1 text-xs">Reserve</span>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </Grid>
        ) : (
          <Card className="p-12 bg-white dark:bg-gray-900 border-0 shadow-lg dark:shadow-xl text-center">
            <div className="space-y-4">
              <div className="text-6xl">📚</div>
              <Heading size="4" className="text-gray-900 dark:text-gray-100">
                {searchTerm ? "No books found" : "No books available"}
              </Heading>
              <Text className="text-gray-600 dark:text-gray-300">
                {searchTerm 
                  ? `No books match your search for "${searchTerm}"`
                  : "Get started by adding some books to your library"
                }
              </Text>
              {isLibrarian && !searchTerm && (
                <Button 
                  onClick={() => navigate("/books/new")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl dark:shadow-xl"
                >
                  Add Your First Book
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Books;
