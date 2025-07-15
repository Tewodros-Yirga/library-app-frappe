import { useParams, useNavigate } from "react-router-dom";
import { useFrappePostCall,useFrappeDeleteCall } from "frappe-react-sdk";
import { useUserRoles } from "../../hooks/useUserRoles";
import {
  Card, Heading, Text, Flex, Button, Spinner, Callout, Dialog
} from "@radix-ui/themes";
import MainLayout from "../../components/MainLayout";
import { useEffect, useState } from "react";
import { toast } from 'sonner';

export default function BookDetail() {
  const { name: bookName } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { isLibrarian, isAdmin } = useUserRoles();
  const { call: fetchBook, result: book, loading, error } = useFrappePostCall("library_app.api.get_book");
  const { call: deleteBookCall } = useFrappeDeleteCall("library_app.api.delete_book");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch book on mount
  useEffect(() => {
    if (bookName) fetchBook({ name: bookName });
  }, [bookName, fetchBook]);

  const handleDelete = async () => {
    try {
      await deleteBookCall({ name: bookName });
      toast.success("Book deleted successfully.");
      navigate("/books");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete book");
    }
  };
  const bookData = book?.message || book;

  if (loading) {
    return (
      <MainLayout>
        <Flex justify="center" align="center" className="h-64">
          <Spinner size="3" />
          <Text ml="2">Loading book details...</Text>
        </Flex>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Callout.Root color="red">
          <Callout.Text>Error: {error.message || JSON.stringify(error)}</Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  if (!bookData) {
    return (
      <MainLayout>
        <Callout.Root color="yellow">
          <Callout.Text>Book not found.</Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  if (successMsg) {
    // After delete, redirect to books list
    setTimeout(() => navigate("/books"), 1500);
    return (
      <MainLayout>
        <Callout.Root color="green">
          <Callout.Text>{successMsg}</Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Flex justify="center" align="center" className="min-h-[60vh]">
        <Card className="w-full max-w-xl p-8 shadow-xl rounded-2xl bg-white dark:bg-gray-900">
          <Heading size="7" className="mb-4">{bookData.title}</Heading>
          <Text size="4" className="block mb-2"><b>Author:</b> {bookData.author}</Text>
          <Text size="4" className="block mb-2"><b>Publish Date:</b> {bookData.publish_date}</Text>
          <Text size="4" className="block mb-2"><b>ISBN:</b> {bookData.isbn}</Text>
          <Text size="4" className="block mb-2"><b>Status:</b> {bookData.status}</Text>
          <Flex gap="3" mt="6">
            <Button variant="soft" onClick={() => navigate("/books")}>Back to List</Button>
            {(isLibrarian || isAdmin) && (
              <>
                <Button variant="soft" color="blue" onClick={() => navigate(`/books/${bookData.name}/edit`)}>Edit</Button>
                <Button variant="soft" color="red" onClick={() => setDeleteDialog(true)}>Delete</Button>
              </>
            )}
          </Flex>
        </Card>
      </Flex>
      {/* Delete confirmation dialog */}
      <Dialog.Root open={deleteDialog} onOpenChange={setDeleteDialog}>
        <Dialog.Content>
          <Dialog.Title>Delete Book</Dialog.Title>
          <Dialog.Description>
            Are you sure you want to delete the book "{bookData.title}"? This action cannot be undone.
          </Dialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <Button variant="soft" onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button color="red" onClick={handleDelete} aria-label="Confirm delete">Delete</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </MainLayout>
  );
}