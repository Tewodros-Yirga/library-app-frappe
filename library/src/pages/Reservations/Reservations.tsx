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
          <Text ml="2">Loading reservations...</Text>
        </Flex>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Callout.Root color="red">
          <Callout.Text>Error: {error}</Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Heading>Book Reservations</Heading>
          <Button onClick={() => navigate("/books")} variant="soft">
            Browse Books
          </Button>
        </Flex>

        {cancelling && (
          <Callout.Root color="yellow">
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
                          <IconButton
                            variant="ghost"
                            color="red"
                            disabled={cancelling === reservation.name}
                          >
                            <TrashIcon />
                          </IconButton>
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
          <Box>
            <Text>No reservations found.</Text>
          </Box>
        )}
      </Flex>
    </MainLayout>
  );
};

export default Reservations; 