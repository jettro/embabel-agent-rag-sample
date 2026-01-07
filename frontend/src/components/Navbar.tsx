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
import { ColorModeButton } from './ui/color-mode';

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
      borderBottomWidth="1px"
      w="full"
    >
      <Flex align="center">
        <Image 
          src={logo} 
          alt="JettroDev Logo" 
          h="40px" 
          mr={4} 
        />
        <Heading size="md">
          Knowledge Agent
        </Heading>
        <Spacer />
        <Flex align="center" gap={4}>
          <HStack gap={2}>
            <Text fontSize="sm" fontWeight="medium">User:</Text>
            <NativeSelect.Root size="sm" minW="200px">
              <NativeSelect.Field 
                value={selectedUserId} 
                onChange={handleUserChange}
                bg="white"
                color="#1a202c"
                borderColor="gray.300"
                _dark={{ 
                  bg: 'gray.700',
                  color: 'gray.100',
                  borderColor: 'gray.600'
                }}
                css={{
                  '& option': {
                    backgroundColor: 'white',
                    color: '#1a202c',
                  },
                }}
              >
                <option value="" disabled>
                  Select a user...
                </option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.displayName}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </HStack>
          <ColorModeButton />
        </Flex>
      </Flex>
    </Box>
  );
}
