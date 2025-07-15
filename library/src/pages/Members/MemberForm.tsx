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
  Card,
} from "@radix-ui/themes";
import MainLayout from "../../components/MainLayout";
import {
  useFrappePostCall,
  useFrappeCreateDoc,
  useFrappeUpdateDoc,
} from "frappe-react-sdk";
import { toast } from 'sonner';

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
      const data = member.message || member;
      setValue("member_name", data.member_name);
      setValue("membership_id", data.membership_id);
      setValue("email", data.email);
      setValue("phone", data.phone);
    }
  }, [member, memberName, setValue]);

  const onSubmit = async (formData: MemberData) => {
    try {
      if (memberName) {
        await updateDoc("Member", memberName, formData);
        toast.success("Member updated successfully!");
        navigate("/members");
      } else {
        await createDoc("Member", formData);
        toast.success("Member created successfully!");
        navigate("/members");
      }
    } catch (error: any) {
      console.error("Failed to save member:", error);
      const errorMessage = error.messages?.[0] || error.message || "An unknown error occurred.";
      toast.error(`Error saving member: ${errorMessage}`);
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
      {/* Fade-in animation for the form */}
      <div className="flex justify-center items-center min-h-[110vh] animate-fade-in">
        <Card className="w-full max-w-xl p-8 shadow-xl rounded-2xl bg-white dark:bg-gray-900">
          <Flex direction="column" gap="6">
            <Heading size="7" className="text-center text-blue-700 dark:text-blue-200 font-bold mb-2">
              {memberName ? "Edit Member" : "Add New Member"}
            </Heading>
            <Box className="mb-2"><hr className="border-t-2 border-gray-200 dark:border-gray-700" /></Box>
            {formError && (
              <Callout.Root color="red" className="mb-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950">
                <Callout.Text>
                  {formError.message || JSON.stringify(formError)}
                </Callout.Text>
              </Callout.Root>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Flex direction="column" gap="4">
                {/* Member Name */}
                <Box>
                  <Text as="label" htmlFor="member_name" size="3" mb="1" weight="bold">
                    Full Name
                  </Text>
                  <TextField.Root
                    id="member_name"
                    placeholder="e.g. Jane Doe"
                    aria-label="Full Name"
                    {...register("member_name", { required: "Name is required" })}
                  />
                  <Text size="1" color="gray">Enter the member's full name.</Text>
                  {errors.member_name && (
                    <Text color="red">{errors.member_name.message}</Text>
                  )}
                </Box>

                {/* Membership ID */}
                <Box>
                  <Text as="label" htmlFor="membership_id" size="3" mb="1" weight="bold">
                    Membership ID
                  </Text>
                  <TextField.Root
                    id="membership_id"
                    placeholder="e.g. MBR-00123"
                    aria-label="Membership ID"
                    {...register("membership_id", { required: "Membership ID is required" })}
                  />
                  <Text size="1" color="gray">Enter the unique membership ID for this member.</Text>
                  {errors.membership_id && (
                    <Text color="red">{errors.membership_id.message}</Text>
                  )}
                </Box>

                {/* Email */}
                <Box>
                  <Text as="label" htmlFor="email" size="3" mb="1" weight="bold">
                    Email
                  </Text>
                  <TextField.Root
                    id="email"
                    type="email"
                    placeholder="e.g. member@example.com"
                    aria-label="Email"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                  />
                  <Text size="1" color="gray">Enter a valid email address for this member.</Text>
                  {errors.email && (
                    <Text color="red">{errors.email.message}</Text>
                  )}
                </Box>

                {/* Phone */}
                <Box>
                  <Text as="label" htmlFor="phone" size="3" mb="1" weight="bold">
                    Phone
                  </Text>
                  <TextField.Root
                    id="phone"
                    placeholder="e.g. +1 234 567 8901"
                    aria-label="Phone Number"
                    {...register("phone", { required: "Phone is required" })}
                  />
                  <Text size="1" color="gray">Enter the member's phone number.</Text>
                  {errors.phone && (
                    <Text color="red">{errors.phone.message}</Text>
                  )}
                </Box>

                <Flex gap="3" mt="4" className="flex-col sm:flex-row">
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
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
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </Flex>
              </Flex>
            </form>
          </Flex>
        </Card>
      </div>
    </MainLayout>
  );
};

export default MemberForm;