import { 
  Box, 
  Flex, 
  Image, 
  Heading, 
  Spacer, 
  Text,
  HStack,
  NativeSelect
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import logo from '../assets/logo-jettrodev.png';
import { fetchUsers, selectUser } from '../api';
import type { User } from '../api';

export function Navbar() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    fetchUsers().then(data => {
      setUsers(data);
    }).catch(err => {
      console.error('Failed to fetch users', err);
    });
  }, []);

  const handleUserChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    if (userId) {
      try {
        await selectUser(userId);
      } catch (err) {
        alert('Failed to select user');
        console.error(err);
      }
    }
  };

  return (
    <Box 
      px={6} 
      py={3} 
      borderBottom="1px" 
      borderColor="gray.200"
      bg="white" 
      w="full"
    >
      <Flex align="center">
        <Image 
          src={logo} 
          alt="JettroDev Logo" 
          h="40px" 
          mr={4} 
        />
        <Heading size="md" color="gray.800">
          Knowledge Agent
        </Heading>
        <Spacer />
        <Flex align="center" gap={4}>
          <HStack gap={2}>
            <Text fontSize="sm" fontWeight="medium" color="gray.600">User:</Text>
            <NativeSelect.Root size="sm" width="200px">
              <NativeSelect.Field 
                placeholder="Select a user..." 
                value={selectedUserId} 
                onChange={handleUserChange}
                color="gray.800"
                bg="gray.50"
                borderColor="gray.300"
                _hover={{ borderColor: "gray.400" }}
                _focus={{ borderColor: "blue.500", bg: "white" }}
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </HStack>
        </Flex>
      </Flex>
    </Box>
  );
}
