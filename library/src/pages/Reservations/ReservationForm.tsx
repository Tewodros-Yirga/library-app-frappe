import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  Callout,
  Spinner,
  Select,
  Card,
} from "@radix-ui/themes";
import MainLayout from "../../components/MainLayout";
import { useFrappePostCall, useFrappeAuth } from "frappe-react-sdk";
import { useUserRoles } from "../../hooks/useUserRoles";

interface ReservationData {
  book: string;
  member: string;
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

const ReservationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useFrappeAuth();
  const { isLibrarian, isAdmin, isMember } = useUserRoles();
  const [books, setBooks] = useState<BookOption[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [currentUserMember, setCurrentUserMember] = useState<any>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Get pre-selected book from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const preselectedBook = searchParams.get('book');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReservationData>();

  // Move all API hooks to the top level
  const { call: fetchBooks } = useFrappePostCall<{ message: BookOption[] }>(
    "library_app.api.get_books"
  );
  const { call: fetchMembers } = useFrappePostCall<{ message: MemberOption[] }>(
    "library_app.api.get_members"
  );
  const { call: createReservation, loading: isCreating } = useFrappePostCall(
    "library_app.api.create_reservation"
  );
  const { call: getCurrentUserMember } = useFrappePostCall(
    "library_app.api.get_member_by_user"
  );
  const { call: createMemberForUser } = useFrappePostCall(
    "library_app.api.create_member_for_user"
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

        // If current user is a member, get their member information
        if (isMember && currentUser) {
          try {
            const memberData = await getCurrentUserMember({ user: currentUser });
            setCurrentUserMember(memberData.message || memberData);
          } catch (error: any) {
            // If member doesn't exist, create one
            if (error.message && error.message.includes("No member found")) {
              try {
                await createMemberForUser({ user: currentUser });
                
                // Try to get member data again
                const memberData = await getCurrentUserMember({ user: currentUser });
                setCurrentUserMember(memberData.message || memberData);
              } catch (createError) {
                console.error("Failed to create member:", createError);
              }
            } else {
              console.error("Failed to get current user member data:", error);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load options:", error);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, [fetchBooks, fetchMembers, getCurrentUserMember, createMemberForUser, isMember, currentUser]);

  // Set pre-selected book when options are loaded
  useEffect(() => {
    if (preselectedBook && books.length > 0) {
      setValue("book", preselectedBook);
    }
  }, [preselectedBook, books, setValue]);

  // Set current user as member if they are a member
  useEffect(() => {
    if (isMember && currentUserMember && !isLibrarian && !isAdmin) {
      setValue("member", currentUserMember.name);
    }
  }, [currentUserMember, isMember, isLibrarian, isAdmin, setValue]);

  const onSubmit = async (data: ReservationData) => {
    try {
      await createReservation({
        book_name: data.book,
        member_name: data.member,
      });
      navigate("/reservations");
    } catch (error: any) {
      console.error("Failed to create reservation:", error);
      alert(`Error: ${error.message || "Failed to create reservation"}`);
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
              Reserve a Book
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
                      <Select.Trigger placeholder="Select a book to reserve" />
                      <Select.Content>
                        <Select.Group>
                          <Select.Label>Unavailable Books (Can be reserved)</Select.Label>
                          {books
                            .filter((book) => book.status !== "Available")
                            .map((book) => (
                              <Select.Item key={book.value} value={book.value}>
                                {book.label} ({book.status})
                              </Select.Item>
                            ))}
                        </Select.Group>
                        <Select.Separator />
                        <Select.Group>
                          <Select.Label>Available Books (No reservation needed)</Select.Label>
                          {books
                            .filter((book) => book.status === "Available")
                            .map((book) => (
                              <Select.Item
                                key={book.value}
                                value={book.value}
                                disabled
                              >
                                {book.label} (Available - Loan directly)
                              </Select.Item>
                            ))}
                        </Select.Group>
                      </Select.Content>
                    </Select.Root>
                    <Text size="1" color="gray">Select a book that is currently unavailable to reserve it.</Text>
                    {errors.book && <Text color="red">{errors.book.message}</Text>}
                    {selectedBook && bookStatus && (
                      <Text
                        size="1"
                        mt="1"
                        color={bookStatus === "Available" ? "green" : "orange"}
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
                    {(isLibrarian || isAdmin) ? (
                      // Admin/Librarian can select any member
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
                    ) : (
                      // Member can only reserve for themselves
                      <TextField.Root
                        value={currentUserMember ? `${currentUserMember.member_name} (${currentUserMember.membership_id})` : "Loading..."}
                        disabled
                        {...register("member", { required: "Member is required" })}
                      />
                    )}
                    <Text size="1" color="gray">
                      {isMember && !isLibrarian && !isAdmin 
                        ? "You can only reserve books for yourself." 
                        : "Select the member making the reservation."
                      }
                    </Text>
                    {errors.member && (
                      <Text color="red">{errors.member.message}</Text>
                    )}
                  </Box>

                  <Flex gap="3" mt="4" className="flex-col sm:flex-row">
                    <Button type="submit" disabled={isCreating} className="w-full sm:w-auto">
                      {isCreating ? (
                        <>
                          <Spinner size="1" /> Creating...
                        </>
                      ) : (
                        "Create Reservation"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="soft"
                      color="gray"
                      onClick={() => navigate("/reservations")}
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

export default ReservationForm; 