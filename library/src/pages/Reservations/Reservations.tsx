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
  Badge,
} from "@radix-ui/themes";
import MainLayout from "../../components/MainLayout";
import { useNavigate } from "react-router-dom";
import { useFrappePostCall } from "frappe-react-sdk";
import { TrashIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

// Define the type for Reservation data
interface ReservationData {
  name: string;
  book: string;
  member: string;
  reservation_date: string;
  status: "Pending" | "Completed" | "Cancelled";
  book_title?: string;
  member_name?: string;
}

// Define the type for the API response
interface GetReservationsResponse {
  message: ReservationData[];
}

const Reservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  // Hook to fetch all reservations
  const { call: fetchReservationsCall } = useFrappePostCall<GetReservationsResponse>(
    "library_app.api.get_reservations"
  );

  // Hook for cancelling reservations
  const { call: cancelReservationCall } = useFrappePostCall(
    "library_app.api.cancel_reservation"
  );

  // Fetch reservations on component mount
  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchReservationsCall({});
      setReservations(response?.message || []);
    } catch (err: any) {
      console.error("Error fetching reservations:", err);
      setError(err.message || "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancellation of a reservation
  const handleCancel = async (reservationName: string, bookTitle: string) => {
    try {
      setCancelling(reservationName);
      await cancelReservationCall({ reservation_name: reservationName });
      console.log(`Reservation for "${bookTitle}" cancelled successfully.`);
      fetchReservations(); // Re-fetch the list after successful cancellation
    } catch (err: any) {
      console.error("Failed to cancel reservation:", err);
      const errorMessage = err.messages
        ? err.messages[0]
        : err.message || "An unknown error occurred.";
      alert(`Error cancelling reservation: ${errorMessage}`);
    } finally {
      setCancelling(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "yellow";
      case "Completed":
        return "green";
      case "Cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Flex justify="center" align="center" className="h-full">
          <Spinner size="3" />
          <Text ml="2" className="text-gray-600 dark:text-gray-300">Loading reservations...</Text>
        </Flex>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Callout.Root color="red" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <Callout.Text className="text-red-700 dark:text-red-200">Error: {error}</Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Heading className="text-gray-900 dark:text-gray-100">Book Reservations</Heading>
          <Button onClick={() => navigate("/books")} variant="soft"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl dark:shadow-xl"
          >
            Browse Books
          </Button>
        </Flex>

        {cancelling && (
          <Callout.Root color="yellow" className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
            <Callout.Text className="text-yellow-700 dark:text-yellow-200">
              <Spinner size="1" /> Cancelling reservation...
            </Callout.Text>
          </Callout.Root>
        )}

        {reservations.length > 0 ? (
          <Table.Root variant="surface" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Book</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Member</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Reservation Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {reservations.map((reservation: ReservationData) => (
                <Table.Row key={reservation.name} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Table.Cell>
                    <Text weight="medium" className="text-gray-900 dark:text-gray-100">{reservation.book_title || reservation.book}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text className="text-gray-700 dark:text-gray-300">{reservation.member_name || reservation.member}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text className="text-gray-700 dark:text-gray-300">{new Date(reservation.reservation_date).toLocaleDateString()}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={getStatusColor(reservation.status)}>
                      {reservation.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {reservation.status === "Pending" && (
                      <AlertDialog.Root>
                        <AlertDialog.Trigger>
                          <IconButton
                            variant="ghost"
                            color="red"
                            disabled={cancelling === reservation.name}
                          >
                            <TrashIcon />
                          </IconButton>
                        </AlertDialog.Trigger>
                        <AlertDialog.Content>
                          <AlertDialog.Title className="text-gray-900 dark:text-gray-100">Cancel Reservation</AlertDialog.Title>
                          <AlertDialog.Description size="2" className="text-gray-700 dark:text-gray-300">
                            Are you sure you want to cancel the reservation for "{reservation.book_title || reservation.book}"?
                            This action cannot be undone.
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
                                onClick={() =>
                                  handleCancel(reservation.name, reservation.book_title || reservation.book)
                                }
                                disabled={cancelling === reservation.name}
                              >
                                {cancelling === reservation.name ? "Cancelling..." : "Cancel Reservation"}
                              </Button>
                            </AlertDialog.Action>
                          </Flex>
                        </AlertDialog.Content>
                      </AlertDialog.Root>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        ) : (
          <Box className="p-12 bg-white dark:bg-gray-900 border-0 shadow-lg dark:shadow-xl text-center rounded-lg">
            <div className="space-y-4">
              <div className="text-6xl">⏰</div>
              <Heading size="4" className="text-gray-900 dark:text-gray-100">
                No reservations found
              </Heading>
              <Text className="text-gray-600 dark:text-gray-300">
                Get started by reserving a book
              </Text>
              <Button 
                onClick={() => navigate("/books")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl dark:shadow-xl"
              >
                Browse Books
              </Button>
            </div>
          </Box>
        )}
      </Flex>
    </MainLayout>
  );
};

export default Reservations; 