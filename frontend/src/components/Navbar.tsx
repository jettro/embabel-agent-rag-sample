import { 
  Box, 
  Flex, 
  Image, 
  Heading, 
  Spacer, 
  Text,
  HStack,
  Button
} from '@chakra-ui/react';
import { useState } from 'react';
import logo from '../assets/logo-jettrodev.png';
import { logout as apiLogout } from '../api';
import { ColorModeButton } from './ui/color-mode';
import { useAuth } from '../context/AuthContext';
import { FiLogOut } from 'react-icons/fi';
import { toaster } from './ui/toaster';

export function Navbar() {
  const { username, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiLogout();
      logout();
      toaster.create({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
        type: 'success',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if backend call fails
      logout();
      toaster.create({
        title: 'Logged Out',
        description: 'Logged out locally',
        type: 'info',
      });
    } finally {
      setIsLoggingOut(false);
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
          <HStack gap={3}>
            <Text fontSize="sm" fontWeight="medium" color="gray.600" _dark={{ color: 'gray.400' }}>
              Welcome, {username}
            </Text>
            <Button
              size="sm"
              colorPalette="red"
              variant="outline"
              onClick={handleLogout}
              loading={isLoggingOut}
            >
              <FiLogOut />
              Logout
            </Button>
            <ColorModeButton />
          </HStack>
        </Flex>
      </Flex>
    </Box>
  );
}
