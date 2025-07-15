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
  Card,
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
    console.log("Component mounted, fetching reservations...");
    fetchReservations();
  }, []);

  // Debug log for reservations state
  useEffect(() => {
    console.log("Reservations state updated:", reservations);
  }, [reservations]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchReservationsCall({});
      
      console.log("Raw API response:", response);
      
      // Handle the response format
      let reservationsData;
      if (response && typeof response === 'object' && 'message' in response) {
        // Backend returns { message: [...] }
        reservationsData = response.message;
      } else if (Array.isArray(response)) {
        // Backend returns [...] directly
        reservationsData = response;
      } else {
        // Fallback
        reservationsData = [];
      }
      
      console.log("Processed reservations data:", reservationsData);
      setReservations(reservationsData);
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
      <Card className="p-6 mt-20">
        <Flex direction="column" gap="4">
          <Flex justify="between" align="center" className="mb-6">
            <Heading size="6">Book Reservations</Heading>
            <Flex gap="2">
              <Button onClick={() => navigate("/reservations/new")} aria-label="Add new reservation">
                New Reservation
              </Button>
              <Button onClick={() => navigate("/books")} variant="soft">
                Browse Books
              </Button>
            </Flex>
          </Flex>

          {cancelling && (
            <Callout.Root color="yellow" mt="2">
              <Callout.Text>
                <Spinner size="1" /> Cancelling reservation...
              </Callout.Text>
            </Callout.Root>
          )}

          {reservations.length > 0 ? (
            <Table.Root variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Book</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Member</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Reservation Date</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {reservations.map((reservation: ReservationData) => (
                  <Table.Row key={reservation.name}>
                    <Table.Cell>
                      <Text weight="medium">{reservation.book_title || reservation.book}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text>{reservation.member_name || reservation.member}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text>{new Date(reservation.reservation_date).toLocaleDateString()}</Text>
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
                            <Button
                              size="1"
                              variant="soft"
                              color="red"
                              disabled={cancelling === reservation.name}
                            >
                              Cancel
                            </Button>
                          </AlertDialog.Trigger>
                          <AlertDialog.Content>
                            <AlertDialog.Title>Cancel Reservation</AlertDialog.Title>
                            <AlertDialog.Description size="2">
                              Are you sure you want to cancel the reservation for "{reservation.book_title || reservation.book}"?
                              This action cannot be undone.
                            </AlertDialog.Description>

                            <Flex gap="3" mt="4" justify="end">
                              <AlertDialog.Cancel>
                                <Button variant="soft" color="gray">
                                  Keep
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
                <Flex gap="2" justify="center">
                  <Button 
                    onClick={() => navigate("/reservations/new")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl dark:shadow-xl"
                  >
                    Make a Reservation
                  </Button>
                  <Button 
                    onClick={() => navigate("/books")}
                    variant="soft"
                    className="font-medium px-6 py-3 rounded-lg transition-all duration-200"
                  >
                    Browse Books
                  </Button>
                </Flex>
              </div>
            </Box>
          )}
        </Flex>
      </Card>
    </MainLayout>
  );
};

export default Reservations; 