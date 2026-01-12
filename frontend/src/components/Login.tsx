import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  Image,
  Text,
  Card,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Field } from './ui/field';
import logo from '../assets/logo-jettrodev.png';
import { toaster } from './ui/toaster';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toaster.create({
        title: 'Validation Error',
        description: 'Please enter both username and password',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);

    // Simply store credentials - authentication will be validated on first API call
    login(username, password);
    
    toaster.create({
      title: 'Login Successful',
      description: `Welcome, ${username}!`,
      type: 'success',
    });
    
    setIsLoading(false);
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      _dark={{ bg: 'gray.900' }}
    >
      <Card.Root maxW="md" w="full" mx={4}>
        <Card.Body p={8}>
          <VStack gap={6} align="stretch">
            <VStack gap={4}>
              <Image src={logo} alt="JettroDev Logo" h="60px" />
              <Heading size="lg" textAlign="center">
                Knowledge Agent
              </Heading>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Sign in to continue
              </Text>
            </VStack>

            <form onSubmit={handleSubmit}>
              <VStack gap={4} align="stretch">
                <Field label="Username" required>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    disabled={isLoading}
                  />
                </Field>

                <Field label="Password" required>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                </Field>

                <Button
                  type="submit"
                  colorPalette="blue"
                  size="lg"
                  w="full"
                  mt={2}
                  loading={isLoading}
                >
                  Sign In
                </Button>
              </VStack>
            </form>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
