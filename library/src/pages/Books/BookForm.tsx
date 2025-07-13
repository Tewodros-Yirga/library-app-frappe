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
} from "@radix-ui/themes";
import MainLayout from "../../components/MainLayout";
import {
  useFrappePostCall, // <--- For fetching specific book data (custom API)
  useFrappeCreateDoc, // <--- For creating new DocTypes
  useFrappeUpdateDoc, // <--- For updating DocTypes
} from "frappe-react-sdk";

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
      setValue("title", book.title);
      setValue("author", book.author);
      setValue("publish_date", book.publish_date);
      setValue("isbn", book.isbn);
      setValue("status", book.status); // Set the status value
    }
  }, [book, bookName, setValue]);

  // Handle form submission
  const onSubmit = async (formData: BookData) => {
    try {
      if (bookName) {
        // Update existing book
        // Pass the document name (ID) and the partial document object
        await updateDoc("Book", bookName, formData);
        console.log("Book updated successfully!");
        navigate("/books");
      } else {
        // Create new book
        // Pass the DocType name and the new document object
        await createDoc("Book", formData);
        console.log("Book created successfully!");
        navigate("/books");
      }
    } catch (error: any) {
      console.error("Failed to save book:", error);
      const errorMessage = error.messages
        ? error.messages[0]
        : error.message || "An unknown error occurred.";
      alert(`Error saving book: ${errorMessage}`);
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
      <Flex direction="column" gap="4">
        <Heading>{bookName ? "Edit Book" : "Create New Book"}</Heading>

        {formError && (
          <Callout.Root color="red">
            <Callout.Text>
              {formError.message || JSON.stringify(formError)}
            </Callout.Text>
          </Callout.Root>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="3">
            <Box>
              <Text as="label" htmlFor="title" size="2" mb="1">
                Title
              </Text>
              <TextField.Root
                id="title"
                placeholder="Book Title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && <Text color="red">{errors.title.message}</Text>}
            </Box>

            <Box>
              <Text as="label" htmlFor="author" size="2" mb="1">
                Author
              </Text>
              <TextField.Root
                id="author"
                placeholder="Author Name"
                {...register("author", { required: "Author is required" })}
              />
              {errors.author && (
                <Text color="red">{errors.author.message}</Text>
              )}
            </Box>

            <Box>
              <Text as="label" htmlFor="publish_date" size="2" mb="1">
                Publish Date
              </Text>
              <TextField.Root
                id="publish_date"
                type="date"
                {...register("publish_date", {
                  required: "Publish Date is required",
                })}
              />
              {errors.publish_date && (
                <Text color="red">{errors.publish_date.message}</Text>
              )}
            </Box>

            <Box>
              <Text as="label" htmlFor="isbn" size="2" mb="1">
                ISBN
              </Text>
              <TextField.Root
                id="isbn"
                placeholder="ISBN"
                {...register("isbn", { required: "ISBN is required" })}
              />
              {errors.isbn && <Text color="red">{errors.isbn.message}</Text>}
            </Box>

            {bookName && ( // Only show status field in edit mode
              <Box>
                <Text as="label" htmlFor="status" size="2" mb="1">
                  Status
                </Text>
                <Select.Root
                  defaultValue="Available"
                  {...register("status", { required: "Status is required" })}
                  onValueChange={(value: any) => setValue("status", value)}
                  value={currentStatus || "Available"} // Ensure value is controlled by react-hook-form's watch
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
                {errors.status && (
                  <Text color="red">{errors.status.message}</Text>
                )}
              </Box>
            )}

            <Flex gap="3" mt="4">
              <Button type="submit" disabled={isLoading}>
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
              >
                Cancel
              </Button>
            </Flex>
          </Flex>
        </form>
      </Flex>
    </MainLayout>
  );
};

export default BookForm;
