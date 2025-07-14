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
  Table,
  Dialog,
} from "@radix-ui/themes";
import MainLayout from "../../components/MainLayout";
import { Link, useNavigate } from "react-router-dom";
import { useFrappePostCall, useFrappeDeleteDoc, useFrappeDeleteCall } from "frappe-react-sdk";
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

export default function Books() {
  const navigate = useNavigate();
  const { isLibrarian, isAdmin } = useUserRoles();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; book?: any }>({ open: false });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // API hooks
  const { call: getBooksCall } = useFrappePostCall("library_app.api.get_books");
  const { call: deleteBookCall } = useFrappeDeleteCall("library_app.api.delete_book");

  // Fetch books
  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBooksCall({});
      setBooks(Array.isArray(response) ? response : response?.message || []);
    } catch (err: any) {
      setError(err.message || "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Delete book handler
  const handleDeleteBook = async (book: any) => {
    try {
      await deleteBookCall({ name: book.name });
      setSuccessMsg(`Book "${book.title}" deleted successfully.`);
      setDeleteDialog({ open: false });
      fetchBooks();
    } catch (err: any) {
      setError("Failed to delete book: You cannot not delete a book with status On Loan or Reserved");
      setDeleteDialog({ open: false });
    }
  };

  // Pagination (optional)
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const paginatedBooks = books.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(books.length / pageSize);

  return (
    <MainLayout>
    <Card className="p-6 mt-20">
      <Flex justify="between" align="center" className="mb-6">
        <Heading size="6">Books Catalog</Heading>
        {(isLibrarian || isAdmin) && (
          <Button onClick={() => navigate("/books/new")} aria-label="Add new book">Add Book</Button>
        )}
      </Flex>
      {loading ? (
        <Flex justify="center" align="center" className="h-32">
          <Spinner size="3" />
          <Text ml="2">Loading books...</Text>
        </Flex>
      ) : error ? (
        <Callout.Root color="red"><Callout.Text>{error}</Callout.Text></Callout.Root>
      ) : books.length === 0 ? (
        <Callout.Root color="yellow"><Callout.Text>No books found.</Callout.Text></Callout.Root>
      ) : (
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
            {paginatedBooks.map((book) => (
              <Table.Row key={book.name}>
                <Table.Cell>{book.title}</Table.Cell>
                <Table.Cell>{book.author}</Table.Cell>
                <Table.Cell>{book.publish_date}</Table.Cell>
                <Table.Cell>{book.isbn}</Table.Cell>
                <Table.Cell>{book.status}</Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <Button size="1" variant="soft" onClick={() => navigate(`/books/${book.name}`)} aria-label="View book">View</Button>
                    {(isLibrarian || isAdmin) && (
                      <>
                        <Button size="1" variant="soft" color="blue" onClick={() => navigate(`/books/${book.name}/edit`)} aria-label="Edit book">Edit</Button>
                        <Button size="1" variant="soft" color="red" onClick={() => setDeleteDialog({ open: true, book })} aria-label="Delete book">Delete</Button>
                      </>
                    )}
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
      {/* Pagination controls */}
      {totalPages > 1 && (
        <Flex justify="center" align="center" gap="2" className="mt-4">
          <Button size="1" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <Text size="2">Page {page} of {totalPages}</Text>
          <Button size="1" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </Flex>
      )}
      {/* Delete confirmation dialog */}
      <Dialog.Root open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, book: open ? deleteDialog.book : undefined })}>
        <Dialog.Content>
          <Dialog.Title>Delete Book</Dialog.Title>
          <Dialog.Description>Are you sure you want to delete the book "{deleteDialog.book?.title}"? This action cannot be undone.</Dialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <Button variant="soft" onClick={() => setDeleteDialog({ open: false })}>Cancel</Button>
            <Button color="red" onClick={() => handleDeleteBook(deleteDialog.book)} aria-label="Confirm delete">Delete</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
      {/* Success message dialog */}
      <Dialog.Root open={!!successMsg} onOpenChange={() => setSuccessMsg(null)}>
        <Dialog.Content>
          <Dialog.Title>Success</Dialog.Title>
          <Dialog.Description>{successMsg}</Dialog.Description>
          <Flex justify="end" mt="4">
            <Button onClick={() => setSuccessMsg(null)}>OK</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Card>
    </MainLayout>
  );
}
