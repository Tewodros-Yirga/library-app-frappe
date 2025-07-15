// library-bench/apps/library_app/library/src/pages/Books/BookForm.tsx
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  Callout,
  Select,
  Spinner,
  Card,
  Separator
} from "@radix-ui/themes";
import MainLayout from "../../components/MainLayout";
import {
  useFrappePostCall, // <--- For fetching specific book data (custom API)
  useFrappeCreateDoc, // <--- For creating new DocTypes
  useFrappeUpdateDoc, // <--- For updating DocTypes
} from "frappe-react-sdk";
import { toast } from 'sonner';

// Define the type for Book data
interface BookData {
  name?: string; // Frappe's internal ID, optional for creation, needed for update
  title: string;
  author: string;
  publish_date: string; // Frappe expects YYYY-MM-DD
  isbn: string;
  status?: "Available" | "On Loan" | "Reserved";
}

const BookForm = () => {
  const { name: bookName } = useParams<{ name: string }>();
  const navigate = useNavigate();

  // Hook for fetching a single book for editing using useFrappePostCall
  const {
    call: fetchBookCall,
    result: book,
    loading: isLoadingBook,
    error: bookFetchError,
  } = useFrappePostCall("library_app.api.get_book"); // custom API method

  // Hooks for creating and updating books
  const {
    createDoc,
    loading: isCreating,
    error: createError,
  } = useFrappeCreateDoc();
  const {
    updateDoc,
    loading: isUpdating,
    error: updateError,
  } = useFrappeUpdateDoc();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch, // Use watch to get current form values for Select
  } = useForm<BookData>();

  // Watch the status field to control the Select component
  const currentStatus = watch("status");

  // Effect to trigger fetching book details when in edit mode
  useEffect(() => {
    if (bookName) {
      fetchBookCall({ name: bookName }); // Pass book name as param to the API
    }
  }, [bookName, fetchBookCall]);

  // Effect to populate form when book data is loaded (for editing)
  useEffect(() => {
    if (book && bookName) {
      const data = book.message || book; // fallback if already flat
      setValue("title", data.title);
      setValue("author", data.author);
      setValue("publish_date", data.publish_date);
      setValue("isbn", data.isbn);
      setValue("status", data.status);
    }
  }, [book, bookName, setValue]);

  // Handle form submission
  const onSubmit = async (formData: BookData) => {
    try {
      if (bookName) {
        // Update existing book
        await updateDoc("Book", bookName, formData);
        toast.success("Book updated successfully!");
        navigate("/books");
      } else {
        // Create new book
        await createDoc("Book", formData);
        toast.success("Book created successfully!");
        navigate("/books");
      }
    } catch (error: any) {
      console.error("Failed to save book:", error);
      const errorMessage = error.messages
        ? error.messages[0]
        : error.message || "An unknown error occurred.";
      toast.error(`Error saving book: ${errorMessage}`);
    }
  };

  const isLoading = isLoadingBook || isCreating || isUpdating;
  const formError = bookFetchError || createError || updateError;

  if (isLoadingBook && bookName) {
    return (
      <MainLayout>
        <Flex justify="center" align="center" className="h-full">
          <Spinner size="3" /> <Text ml="2">Loading book details...</Text>
        </Flex>
      </MainLayout>
    );
  }

  if (formError && bookName) {
    return (
      <MainLayout>
        <Callout.Root color="red">
          <Callout.Text>
            Error loading book: {formError.message || JSON.stringify(formError)}
          </Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Fade-in animation for the form */}
      <div className="flex justify-center items-center min-h-[110vh] animate-fade-in">
        <Card className="w-full max-w-xl p-8 shadow-xl rounded-2xl bg-white dark:bg-gray-900">
          <Flex direction="column" gap="6">
            <Heading size="7" className="text-center text-blue-700 dark:text-blue-200 font-bold mb-2">
              {bookName ? "Edit Book" : "Add New Book"}
            </Heading>
            <Separator size="4" className="mb-2" />
            {formError && (
              <Callout.Root color="red" className="mb-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950">
                <Callout.Text>
                  {formError.message || JSON.stringify(formError)}
                </Callout.Text>
              </Callout.Root>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Flex direction="column" gap="4">
                <Box>
                  <Text as="label" htmlFor="title" size="3" mb="1" weight="bold">
                    Title
                  </Text>
                  <TextField.Root
                    id="title"
                    placeholder="e.g. The Great Gatsby"
                    aria-label="Book Title"
                    {...register("title", { required: "Title is required" })}
                  />
                  <Text size="1" color="gray">Enter the full title of the book.</Text>
                  {errors.title && <Text color="red">{errors.title.message}</Text>}
                </Box>

                <Box>
                  <Text as="label" htmlFor="author" size="3" mb="1" weight="bold">
                    Author
                  </Text>
                  <TextField.Root
                    id="author"
                    placeholder="e.g. F. Scott Fitzgerald"
                    aria-label="Author Name"
                    {...register("author", { required: "Author is required" })}
                  />
                  <Text size="1" color="gray">Enter the author's name.</Text>
                  {errors.author && (
                    <Text color="red">{errors.author.message}</Text>
                  )}
                </Box>

                <Box>
                  <Text as="label" htmlFor="publish_date" size="3" mb="1" weight="bold">
                    Publish Date
                  </Text>
                  <TextField.Root
                    id="publish_date"
                    type="date"
                    aria-label="Publish Date"
                    {...register("publish_date", {
                      required: "Publish Date is required",
                    })}
                  />
                  <Text size="1" color="gray">Select the date the book was published.</Text>
                  {errors.publish_date && (
                    <Text color="red">{errors.publish_date.message}</Text>
                  )}
                </Box>

                <Box>
                  <Text as="label" htmlFor="isbn" size="3" mb="1" weight="bold">
                    ISBN
                  </Text>
                  <TextField.Root
                    id="isbn"
                    placeholder="e.g. 978-3-16-148410-0"
                    aria-label="ISBN"
                    {...register("isbn", { required: "ISBN is required" })}
                  />
                  <Text size="1" color="gray">Enter the unique ISBN for this book.</Text>
                  {errors.isbn && <Text color="red">{errors.isbn.message}</Text>}
                </Box>

                {bookName && (
                  <Box>
                    <Text as="label" htmlFor="status" size="3" mb="1" weight="bold">
                      Status
                    </Text>
                    <Select.Root
                      defaultValue="Available"
                      {...register("status", { required: "Status is required" })}
                      onValueChange={(value: any) => setValue("status", value)}
                      value={currentStatus || "Available"}
                    >
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Group>
                          <Select.Label>Book Status</Select.Label>
                          <Select.Item value="Available">Available</Select.Item>
                          <Select.Item value="On Loan">On Loan</Select.Item>
                          <Select.Item value="Reserved">Reserved</Select.Item>
                        </Select.Group>
                      </Select.Content>
                    </Select.Root>
                    <Text size="1" color="gray">Set the current status of the book.</Text>
                    {errors.status && (
                      <Text color="red">{errors.status.message}</Text>
                    )}
                  </Box>
                )}

                <Flex gap="3" mt="4" className="flex-col sm:flex-row">
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? (
                      <>
                        <Spinner size="1" />{" "}
                        {bookName ? "Updating..." : "Creating..."}
                      </>
                    ) : bookName ? (
                      "Update Book"
                    ) : (
                      "Create Book"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="soft"
                    color="gray"
                    onClick={() => navigate("/books")}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </Flex>
              </Flex>
            </form>
          </Flex>
        </Card>
      </div>
    </MainLayout>
  );
};

export default BookForm;
