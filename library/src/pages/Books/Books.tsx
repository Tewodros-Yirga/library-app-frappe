// library-bench/apps/library_app/library/src/pages/Books/Books.tsx
import {
  Heading,
  Button,
  Flex,
  Table,
  Text,
  Box,
  Callout,
  Spinner,
  IconButton,
  AlertDialog,
} from "@radix-ui/themes";
import MainLayout from "../../components/MainLayout";
import { Link, useNavigate } from "react-router-dom";
import { useFrappePostCall, useFrappeDeleteDoc } from "frappe-react-sdk";
import { Pencil1Icon, TrashIcon, BookmarkIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";

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
  message: BookData[]; // The actual list of books is inside 'message'
}

const Books = () => {
  const navigate = useNavigate();

  // Hook to fetch all books using useFrappePostCall
  const {
    call: fetchBooksCall,
    result: apiResponse, // Renamed 'books' to 'apiResponse' to clarify it's the full API object
    loading: isLoading,
    error: fetchError,
    isCompleted: fetchCompleted,
  } = useFrappePostCall<GetBooksResponse>("library_app.api.get_books"); // Use the new interface

  // Extract the actual array of books from the message property
  const books: BookData[] = apiResponse?.message || []; // <--- CRITICAL CHANGE HERE

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

  // Handle deletion of a book
  const handleDelete = async (name: string, title: string) => {
    try {
      await deleteDoc("Book", name);
      console.log(`Book "${title}" deleted successfully.`);
      fetchBooksCall({}); // Re-fetch the list after successful deletion
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
      // For now, we'll use a simple prompt to get member name
      // In a real app, you'd get this from the current user's context
      const memberName = prompt("Enter member name for reservation:");
      if (!memberName) return;

      await createReservationCall({
        book_name: bookName,
        member_name: memberName
      });
      alert(`Reservation created successfully for "${bookTitle}"`);
      fetchBooksCall({}); // Re-fetch to update status
    } catch (err: any) {
      console.error("Failed to create reservation:", err);
      const errorMessage = err.messages
        ? err.messages[0]
        : err.message || "An unknown error occurred.";
      alert(`Error creating reservation: ${errorMessage}`);
    }
  };

  const combinedLoading = isLoading || isDeleting;
  const combinedError = fetchError || deleteError;

  if (combinedLoading && !apiResponse) {
    // Check apiResponse for initial load state
    return (
      <MainLayout>
        <Flex justify="center" align="center" className="h-full">
          <Spinner size="3" /> <Text ml="2">Loading books...</Text>
        </Flex>
      </MainLayout>
    );
  }

  if (combinedError && !apiResponse) {
    return (
      <MainLayout>
        <Callout.Root color="red">
          <Callout.Text>
            Error loading books:{" "}
            {combinedError.message || JSON.stringify(combinedError)}
          </Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Heading>Book List</Heading>
          <Button onClick={() => navigate("/books/new")}>New Book</Button>
        </Flex>

        {isDeleting && (
          <Callout.Root color="yellow">
            <Callout.Text>
              <Spinner size="1" /> Deleting book...
            </Callout.Text>
          </Callout.Root>
        )}
        {combinedError && ( // Show error overlay regardless of initial data
          <Callout.Root color="red" mt="2">
            <Callout.Text>
              Error: {combinedError.message || JSON.stringify(combinedError)}
            </Callout.Text>
          </Callout.Root>
        )}

        {/* Now 'books' is correctly the array */}
        {books.length > 0 ? ( // Removed Array.isArray(books) as we're sure it's an array now
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Author</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Publish Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>ISBN</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {books.map((book: BookData) => (
                <Table.Row key={book.name}>
                  <Table.Cell>{book.title}</Table.Cell>
                  <Table.Cell>{book.author}</Table.Cell>
                  <Table.Cell>{book.publish_date}</Table.Cell>
                  <Table.Cell>{book.isbn}</Table.Cell>
                  <Table.Cell>
                    <Text
                      color={
                        book.status === "Available"
                          ? "green"
                          : book.status === "On Loan"
                          ? "red"
                          : "yellow"
                      }
                    >
                      {book.status}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <IconButton
                        variant="ghost"
                        color="iris"
                        onClick={() => navigate(`/books/edit/${book.name}`)}
                        disabled={isDeleting}
                      >
                        <Pencil1Icon />
                      </IconButton>

                      {book.status !== "Available" && (
                        <IconButton
                          variant="ghost"
                          color="yellow"
                          onClick={() => handleReserve(book.name, book.title)}
                          disabled={isDeleting}
                          title="Reserve this book"
                        >
                          <BookmarkIcon />
                        </IconButton>
                      )}

                      <AlertDialog.Root>
                        <AlertDialog.Trigger>
                          <IconButton
                            variant="ghost"
                            color="red"
                            disabled={isDeleting}
                          >
                            <TrashIcon />
                          </IconButton>
                        </AlertDialog.Trigger>
                        <AlertDialog.Content>
                          <AlertDialog.Title>
                            Confirm Deletion
                          </AlertDialog.Title>
                          <AlertDialog.Description size="2">
                            Are you sure you want to delete book "{book.title}"?
                            This action cannot be undone.
                          </AlertDialog.Description>

                          <Flex gap="3" mt="4" justify="end">
                            <AlertDialog.Cancel>
                              <Button
                                variant="soft"
                                color="gray"
                                disabled={isDeleting}
                              >
                                Cancel
                              </Button>
                            </AlertDialog.Cancel>
                            <AlertDialog.Action>
                              <Button
                                variant="solid"
                                color="red"
                                onClick={() =>
                                  handleDelete(book.name, book.title)
                                }
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Deleting..." : "Delete"}
                              </Button>
                            </AlertDialog.Action>
                          </Flex>
                        </AlertDialog.Content>
                      </AlertDialog.Root>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        ) : (
          <Box>
            <Text>No books found. Click "New Book" to add one.</Text>
          </Box>
        )}
      </Flex>
    </MainLayout>
  );
};

export default Books;
