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
  Spinner,
} from "@radix-ui/themes";
import MainLayout from "../../components/MainLayout";
import {
  useFrappePostCall,
  useFrappeCreateDoc,
  useFrappeUpdateDoc,
} from "frappe-react-sdk";

interface MemberData {
  name?: string;
  member_name: string;
  membership_id: string;
  email: string;
  phone: string;
}

const MemberForm = () => {
  const { name: memberName } = useParams<{ name: string }>();
  const navigate = useNavigate();

  const {
    call: fetchMemberCall,
    result: member,
    loading: isLoadingMember,
    error: memberFetchError,
  } = useFrappePostCall("library_app.api.get_member");

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
  } = useForm<MemberData>();

  useEffect(() => {
    if (memberName) {
      fetchMemberCall({ name: memberName });
    }
  }, [memberName, fetchMemberCall]);

  useEffect(() => {
    if (member && memberName) {
      setValue("member_name", member.member_name);
      setValue("membership_id", member.membership_id);
      setValue("email", member.email);
      setValue("phone", member.phone);
    }
  }, [member, memberName, setValue]);

  const onSubmit = async (formData: MemberData) => {
    try {
      if (memberName) {
        await updateDoc("Member", memberName, formData);
        navigate("/members");
      } else {
        await createDoc("Member", formData);
        navigate("/members");
      }
    } catch (error: any) {
      console.error("Failed to save member:", error);
      const errorMessage = error.messages?.[0] || error.message || "An unknown error occurred.";
      alert(`Error saving member: ${errorMessage}`);
    }
  };

  const isLoading = isLoadingMember || isCreating || isUpdating;
  const formError = memberFetchError || createError || updateError;

  if (isLoadingMember && memberName) {
    return (
      <MainLayout>
        <Flex justify="center" align="center" className="h-full">
          <Spinner size="3" /> <Text ml="2">Loading member details...</Text>
        </Flex>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Flex direction="column" gap="4">
        <Heading>{memberName ? "Edit Member" : "Create New Member"}</Heading>

        {formError && (
          <Callout.Root color="red">
            <Callout.Text>
              {formError.message || JSON.stringify(formError)}
            </Callout.Text>
          </Callout.Root>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="3">
            {/* Member Name */}
            <Box>
              <Text as="label" htmlFor="member_name" size="2" mb="1">
                Full Name
              </Text>
              <TextField.Root
                id="member_name"
                placeholder="Member Name"
                {...register("member_name", { required: "Name is required" })}
              />
              {errors.member_name && (
                <Text color="red">{errors.member_name.message}</Text>
              )}
            </Box>

            {/* Membership ID */}
            <Box>
              <Text as="label" htmlFor="membership_id" size="2" mb="1">
                Membership ID
              </Text>
              <TextField.Root
                id="membership_id"
                placeholder="Unique Membership ID"
                {...register("membership_id", { required: "Membership ID is required" })}
              />
              {errors.membership_id && (
                <Text color="red">{errors.membership_id.message}</Text>
              )}
            </Box>

            {/* Email */}
            <Box>
              <Text as="label" htmlFor="email" size="2" mb="1">
                Email
              </Text>
              <TextField.Root
                id="email"
                type="email"
                placeholder="member@example.com"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.email && (
                <Text color="red">{errors.email.message}</Text>
              )}
            </Box>

            {/* Phone */}
            <Box>
              <Text as="label" htmlFor="phone" size="2" mb="1">
                Phone
              </Text>
              <TextField.Root
                id="phone"
                placeholder="Phone Number"
                {...register("phone", { required: "Phone is required" })}
              />
              {errors.phone && (
                <Text color="red">{errors.phone.message}</Text>
              )}
            </Box>

            <Flex gap="3" mt="4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner size="1" />{" "}
                    {memberName ? "Updating..." : "Creating..."}
                  </>
                ) : memberName ? (
                  "Update Member"
                ) : (
                  "Create Member"
                )}
              </Button>
              <Button
                type="button"
                variant="soft"
                color="gray"
                onClick={() => navigate("/members")}
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

export default MemberForm;