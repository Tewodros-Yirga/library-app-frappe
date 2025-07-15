import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Spinner,
  Select,
  Card,
} from "@radix-ui/themes";
import MainLayout from "../../components/MainLayout";
import { useFrappePostCall } from "frappe-react-sdk";
import  DatePicker  from "../../components/DatePicker";
import { toast } from 'sonner';

interface LoanData {
  book: string;
  member: string;
  loan_date: string;
  return_date: string;
}

interface BookOption {
  value: string;
  label: string;
  status: string;
}

interface MemberOption {
  value: string;
  label: string;
}

const LoanForm = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookOption[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoanData>();

  const { call: fetchBooks } = useFrappePostCall<{ message: BookOption[] }>(
    "library_app.api.get_books"
  );
  const { call: fetchMembers } = useFrappePostCall<{ message: MemberOption[] }>(
    "library_app.api.get_members"
  );
  const { call: createLoan, loading: isCreating } = useFrappePostCall(
    "library_app.api.create_loan"
  );

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [booksRes, membersRes] = await Promise.all([
          fetchBooks({}),
          fetchMembers({}),
        ]);

        setBooks(
          booksRes.message.map((book: any) => ({
            value: book.name,
            label: `${book.title} (${book.isbn})`,
            status: book.status,
          }))
        );

        setMembers(
          membersRes.message.map((member: any) => ({
            value: member.name,
            label: `${member.member_name} (${member.membership_id})`,
          }))
        );
      } catch (error) {
        console.error("Failed to load options:", error);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, [fetchBooks, fetchMembers]);

  const onSubmit = async (data: LoanData) => {
    try {
      await createLoan({
        book_name: data.book,
        member_name: data.member,
        loan_date: data.loan_date,
        return_date: data.return_date,
      });
      toast.success("Loan created successfully!");
      navigate("/loans");
    } catch (error: any) {
      console.error("Failed to create loan:", error);
      toast.error(error.message || "Failed to create loan");
    }
  };

  const selectedBook = watch("book");
  const bookStatus = books.find((b) => b.value === selectedBook)?.status;

  return (
    <MainLayout>
      {/* Fade-in animation for the form */}
      <div className="flex justify-center items-center min-h-[110vh] animate-fade-in">
        <Card className="w-full max-w-xl p-8 shadow-xl rounded-2xl bg-white dark:bg-gray-900">
          <Flex direction="column" gap="6">
            <Heading size="7" className="text-center text-blue-700 dark:text-blue-200 font-bold mb-2">
              Create New Loan
            </Heading>
            <Box className="mb-2"><hr className="border-t-2 border-gray-200 dark:border-gray-700" /></Box>
            {isLoadingOptions ? (
              <Flex justify="center" align="center" className="h-40">
                <Spinner size="3" />
                <Text ml="2">Loading books and members...</Text>
              </Flex>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Flex direction="column" gap="4">
                  {/* Book Selection */}
                  <Box>
                    <Text as="label" htmlFor="book" size="3" mb="1" weight="bold">
                      Book
                    </Text>
                    <Select.Root
                      onValueChange={(value) => setValue("book", value)}
                      {...register("book", { required: "Book is required" })}
                    >
                      <Select.Trigger placeholder="Select a book" />
                      <Select.Content>
                        <Select.Group>
                          <Select.Label>Available Books</Select.Label>
                          {books
                            .filter((book) => book.status === "Available")
                            .map((book) => (
                              <Select.Item key={book.value} value={book.value}>
                                {book.label}
                              </Select.Item>
                            ))}
                        </Select.Group>
                        <Select.Separator />
                        <Select.Group>
                          <Select.Label>Unavailable Books</Select.Label>
                          {books
                            .filter((book) => book.status !== "Available")
                            .map((book) => (
                              <Select.Item
                                key={book.value}
                                value={book.value}
                                disabled
                              >
                                {book.label} ({book.status})
                              </Select.Item>
                            ))}
                        </Select.Group>
                      </Select.Content>
                    </Select.Root>
                    <Text size="1" color="gray">Select a book to loan. Only available books can be loaned.</Text>
                    {errors.book && <Text color="red">{errors.book.message}</Text>}
                    {selectedBook && bookStatus && (
                      <Text
                        size="1"
                        mt="1"
                        color={bookStatus === "Available" ? "green" : "red"}
                      >
                        Status: {bookStatus}
                      </Text>
                    )}
                  </Box>

                  {/* Member Selection */}
                  <Box>
                    <Text as="label" htmlFor="member" size="3" mb="1" weight="bold">
                      Member
                    </Text>
                    <Select.Root
                      onValueChange={(value) => setValue("member", value)}
                      {...register("member", { required: "Member is required" })}
                    >
                      <Select.Trigger placeholder="Select a member" />
                      <Select.Content>
                        {members.map((member) => (
                          <Select.Item key={member.value} value={member.value}>
                            {member.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                    <Text size="1" color="gray">Select the member borrowing the book.</Text>
                    {errors.member && (
                      <Text color="red">{errors.member.message}</Text>
                    )}
                  </Box>

                  {/* Loan Date */}
                  <Box>
                    <Text as="label" htmlFor="loan_date" size="3" mb="1" weight="bold">
                      Loan Date
                    </Text>
                    <DatePicker
                      id="loan_date"
                      {...register("loan_date", {
                        required: "Loan date is required",
                      })}
                      onChange={(date) => setValue("loan_date", date)}
                    />
                    <Text size="1" color="gray">Select the date the loan starts.</Text>
                    {errors.loan_date && (
                      <Text color="red">{errors.loan_date.message}</Text>
                    )}
                  </Box>

                  {/* Return Date */}
                  <Box>
                    <Text as="label" htmlFor="return_date" size="3" mb="1" weight="bold">
                      Return Date
                    </Text>
                    <DatePicker
                      id="return_date"
                      {...register("return_date", {
                        required: "Return date is required",
                      })}
                      onChange={(date) => setValue("return_date", date)}
                    />
                    <Text size="1" color="gray">Select the expected return date.</Text>
                    {errors.return_date && (
                      <Text color="red">{errors.return_date.message}</Text>
                    )}
                  </Box>

                  <Flex gap="3" mt="4" className="flex-col sm:flex-row">
                    <Button type="submit" disabled={isCreating} className="w-full sm:w-auto">
                      {isCreating ? (
                        <>
                          <Spinner size="1" /> Creating...
                        </>
                      ) : (
                        "Create Loan"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="soft"
                      color="gray"
                      onClick={() => navigate("/loans")}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                  </Flex>
                </Flex>
              </form>
            )}
          </Flex>
        </Card>
      </div>
    </MainLayout>
  );
};

export default LoanForm;
