import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
  Callout,
} from "@radix-ui/themes";
import { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<any>("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    try {
      const res = await fetch("/api/method/frappe.auth.sign_up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          full_name: fullName,
          password,
        }),
      });

      const data = await res.json();

      if (data.message === "ok") {
        setSuccess(true);
        setError("");
      } else {
        setError(data);
      }
    } catch (err) {
      setError(err);
    }
  };

  return (
    <Flex align="center" justify="center" className="w-screen h-screen">
      <Card className="w-[40vw] min-h-80 p-2">
        <Flex direction="column" gap="2">
          <Heading>Register</Heading>
          {error && (
            <Callout.Root color="red">
              <Callout.Text>{JSON.stringify(error)}</Callout.Text>
            </Callout.Root>
          )}
          {success && (
            <Callout.Root color="green">
              <Callout.Text>Successfully registered!</Callout.Text>
            </Callout.Root>
          )}
          <Box>
            <Text as="label">Full Name</Text>
            <TextField.Root
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Box>
          <Box>
            <Text as="label">Email</Text>
            <TextField.Root
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>
          <Box>
            <Text as="label">Password</Text>
            <TextField.Root
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Box>
          <Button onClick={handleRegister}>Register</Button>
          <Text>
            Already have an account ? <Link to="/">Login</Link>
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
};

export default Register;
