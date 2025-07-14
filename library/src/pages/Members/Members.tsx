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
} from "@radix-ui/themes";
import MainLayout from "../../components/MainLayout";
import { Link, useNavigate } from "react-router-dom";
import { useFrappePostCall, useFrappeDeleteDoc } from "frappe-react-sdk";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";

interface MemberData {
  name: string;
  member_name: string;
  membership_id: string;
  email: string;
  phone: string;
}

interface GetMembersResponse {
  message: MemberData[];
}

const Members = () => {
  const navigate = useNavigate();

  const {
    call: fetchMembersCall,
    result: apiResponse,
    loading: isLoading,
    error: fetchError,
  } = useFrappePostCall<GetMembersResponse>("library_app.api.get_members");

  const {
    deleteDoc,
    loading: isDeleting,
    error: deleteError,
    reset: resetDelete,
  } = useFrappeDeleteDoc();

  const members: MemberData[] = apiResponse?.message || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchMembersCall({});
      } catch (error) {
        console.error("Failed to fetch members:", error);
        // Error is already captured in fetchError
      }
    };
    fetchData();
  }, [fetchMembersCall]);

  const handleDelete = async (name: string, memberName: string) => {
    try {
      await deleteDoc("Member", name);
      console.log(`Member "${memberName}" deleted successfully.`);
      fetchMembersCall({});
      resetDelete();
    } catch (err: any) {
      console.error("Failed to delete member:", err);
      const errorMessage = err.messages
        ? err.messages[0]
        : err.message || "An unknown error occurred.";
      alert(`Error deleting member: ${errorMessage}`);
    }
  };

  const combinedLoading = isLoading || isDeleting;
  const combinedError = fetchError || deleteError;

  if (combinedLoading && !apiResponse) {
    return (
      <MainLayout>
        <Flex justify="center" align="center" className="h-full">
          <Spinner size="3" /> <Text ml="2" className="text-gray-600 dark:text-gray-300">Loading members...</Text>
        </Flex>
      </MainLayout>
    );
  }

  if (combinedError && !apiResponse) {
    return (
      <MainLayout>
        <Callout.Root color="red" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <Callout.Text className="text-red-700 dark:text-red-200">
            Error loading members: {combinedError.message || JSON.stringify(combinedError)}
          </Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Flex direction="column" gap="4" className="mt-20">
        <Flex justify="between" align="center">
          <Heading className="text-gray-900 dark:text-gray-100">Member List</Heading>
          <Button onClick={() => navigate("/members/new")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl dark:shadow-xl"
          >New Member</Button>
        </Flex>

        {isDeleting && (
          <Callout.Root color="yellow" className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
            <Callout.Text className="text-yellow-700 dark:text-yellow-200">
              <Spinner size="1" /> Deleting member...
            </Callout.Text>
          </Callout.Root>
        )}
        {combinedError && (
          <Callout.Root color="red" mt="2" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <Callout.Text className="text-red-700 dark:text-red-200">
              Error: {combinedError.message || JSON.stringify(combinedError)}
            </Callout.Text>
          </Callout.Root>
        )}

        {members.length > 0 ? (
          <Table.Root variant="surface" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Membership ID</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Email</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Phone</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {members.map((member) => (
                <Table.Row key={member.name} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Table.Cell>{member.member_name}</Table.Cell>
                  <Table.Cell>{member.membership_id}</Table.Cell>
                  <Table.Cell>{member.email}</Table.Cell>
                  <Table.Cell>{member.phone}</Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <IconButton
                        variant="ghost"
                        color="iris"
                        onClick={() => navigate(`/members/edit/${member.name}`)}
                        disabled={isDeleting}
                      >
                        <Pencil1Icon />
                      </IconButton>

                      <AlertDialog.Root>
                        <AlertDialog.Trigger>
                          <IconButton
                            variant="ghost"
                            color="red"
                            disabled={isDeleting}
                          >
                            <TrashIcon />
                          </IconButton>
                        </AlertDialog.Trigger>
                        <AlertDialog.Content>
                          <AlertDialog.Title className="text-gray-900 dark:text-gray-100">
                            Confirm Deletion
                          </AlertDialog.Title>
                          <AlertDialog.Description size="2" className="text-gray-700 dark:text-gray-300">
                            Are you sure you want to delete member "{member.member_name}"?
                          </AlertDialog.Description>

                          <Flex gap="3" mt="4" justify="end">
                            <AlertDialog.Cancel>
                              <Button
                                variant="soft"
                                color="gray"
                                disabled={isDeleting}
                              >
                                Cancel
                              </Button>
                            </AlertDialog.Cancel>
                            <AlertDialog.Action>
                              <Button
                                variant="solid"
                                color="red"
                                onClick={() =>
                                  handleDelete(member.name, member.member_name)
                                }
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Deleting..." : "Delete"}
                              </Button>
                            </AlertDialog.Action>
                          </Flex>
                        </AlertDialog.Content>
                      </AlertDialog.Root>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        ) : (
          <Box className="p-12 bg-white dark:bg-gray-900 border-0 shadow-lg dark:shadow-xl text-center rounded-lg">
            <div className="space-y-4">
              <div className="text-6xl">👥</div>
              <Heading size="4" className="text-gray-900 dark:text-gray-100">
                No members found
              </Heading>
              <Text className="text-gray-600 dark:text-gray-300">
                Get started by adding some members to your library
              </Text>
              <Button 
                onClick={() => navigate("/members/new")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl dark:shadow-xl"
              >
                Add Your First Member
              </Button>
            </div>
          </Box>
        )}
      </Flex>
    </MainLayout>
  );
};

export default Members;
