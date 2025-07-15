import {
  Heading,
  Flex,
  Table,
  Text,
  Box,
  Callout,
  Spinner,
  Badge,
  IconButton,
} from "@radix-ui/themes";
import MainLayout from "../components/MainLayout";
import { useFrappePostCall } from "frappe-react-sdk";
import { useEffect, useState } from "react";
import { Cross1Icon } from "@radix-ui/react-icons";

interface MyReservationData {
  name: string;
  book: string;
  book_title: string;
  book_author: string;
  reservation_date: string;
  status: string;
}

const MyReservations = () => {
  const [reservations, setReservations] = useState<MyReservationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { call: getMyReservationsCall } = useFrappePostCall("library_app.api.get_my_reservations");
  const { call: cancelReservationCall } = useFrappePostCall("library_app.api.cancel_reservation");

  useEffect(() => {
    const fetchMyReservations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getMyReservationsCall({});
        const myReservations = response?.message || [];
        setReservations(myReservations);
      } catch (err: any) {
        console.error("Error fetching my reservations:", err);
        setError(err.message || "Failed to load your reservations");
      } finally {
        setLoading(false);
      }
    };

    fetchMyReservations();
  }, [getMyReservationsCall]);

  const handleCancelReservation = async (reservationName: string, bookTitle: string) => {
    if (!confirm(`Are you sure you want to cancel your reservation for "${bookTitle}"?`)) {
      return;
    }

    try {
      await cancelReservationCall({ reservation_name: reservationName });
      alert("Reservation cancelled successfully");
      // Refresh the list
      const response = await getMyReservationsCall({});
      const myReservations = response?.message || [];
      setReservations(myReservations);
    } catch (err: any) {
      console.error("Error cancelling reservation:", err);
      alert(`Error cancelling reservation: ${err.message || "Unknown error"}`);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Flex justify="center" align="center" className="h-64 mt-20">
          <Spinner size="3" />
          <Text ml="2" className="text-gray-600 dark:text-gray-300">Loading your reservations...</Text>
        </Flex>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Callout.Root color="red" className="mt-20 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <Callout.Text className="text-red-700 dark:text-red-200">Error: {error}</Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Flex direction="column" gap="4" className="mt-20">
        <Heading className="text-gray-900 dark:text-gray-100">My Reservations</Heading>

        {reservations.length > 0 ? (
          <Table.Root variant="surface" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Book Title</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Author</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Reservation Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {reservations.map((reservation) => (
                <Table.Row key={reservation.name} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Table.Cell>{reservation.book_title}</Table.Cell>
                  <Table.Cell>{reservation.book_author}</Table.Cell>
                  <Table.Cell>{reservation.reservation_date}</Table.Cell>
                  <Table.Cell>
                    <Badge 
                      color={
                        reservation.status === "Pending" ? "yellow" :
                        reservation.status === "Completed" ? "green" :
                        "red"
                      }
                    >
                      {reservation.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {reservation.status === "Pending" && (
                      <IconButton
                        size="1"
                        variant="soft"
                        color="red"
                        onClick={() => handleCancelReservation(reservation.name, reservation.book_title)}
                      >
                        <Cross1Icon />
                      </IconButton>
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
                You don't have any reservations yet.
              </Heading>
              <Text className="text-gray-600 dark:text-gray-300">
                Reserve a book to get started!
              </Text>
            </div>
          </Box>
        )}
      </Flex>
    </MainLayout>
  );
};

export default MyReservations; 