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
          <Spinner size="3" /> <Text ml="2">Loading members...</Text>
        </Flex>
      </MainLayout>
    );
  }

  if (combinedError && !apiResponse) {
    return (
      <MainLayout>
        <Callout.Root color="red">
          <Callout.Text>
            Error loading members:{" "}
            {combinedError.message || JSON.stringify(combinedError)}
          </Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Heading>Member List</Heading>
          <Button onClick={() => navigate("/members/new")}>New Member</Button>
        </Flex>

        {isDeleting && (
          <Callout.Root color="yellow">
            <Callout.Text>
              <Spinner size="1" /> Deleting member...
            </Callout.Text>
          </Callout.Root>
        )}
        {combinedError && (
          <Callout.Root color="red" mt="2">
            <Callout.Text>
              Error: {combinedError.message || JSON.stringify(combinedError)}
            </Callout.Text>
          </Callout.Root>
        )}

        {members.length > 0 ? (
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Membership ID</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Phone</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {members.map((member) => (
                <Table.Row key={member.name}>
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
                          <AlertDialog.Title>
                            Confirm Deletion
                          </AlertDialog.Title>
                          <AlertDialog.Description size="2">
                            Are you sure you want to delete member "
                            {member.member_name}"?
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
          <Box>
            <Text>No members found. Click "New Member" to add one.</Text>
          </Box>
        )}
      </Flex>
    </MainLayout>
  );
};

export default Members;
