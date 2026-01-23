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
import { FiLogOut, FiMessageSquare, FiSettings, FiList } from 'react-icons/fi';
import { toaster } from './ui/toaster';

type Screen = 'chat' | 'admin' | 'propositions';

interface NavbarProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export function Navbar({ currentScreen, onScreenChange }: NavbarProps) {
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
        
        {/* Navigation Menu */}
        <HStack gap={2} ml={8}>
          <Button
            size="sm"
            variant={currentScreen === 'chat' ? 'solid' : 'ghost'}
            colorPalette={currentScreen === 'chat' ? 'blue' : 'gray'}
            onClick={() => onScreenChange('chat')}
          >
            <FiMessageSquare />
            Chat
          </Button>
          <Button
            size="sm"
            variant={currentScreen === 'propositions' ? 'solid' : 'ghost'}
            colorPalette={currentScreen === 'propositions' ? 'blue' : 'gray'}
            onClick={() => onScreenChange('propositions')}
          >
            <FiList />
            Propositions
          </Button>
          <Button
            size="sm"
            variant={currentScreen === 'admin' ? 'solid' : 'ghost'}
            colorPalette={currentScreen === 'admin' ? 'blue' : 'gray'}
            onClick={() => onScreenChange('admin')}
          >
            <FiSettings />
            Admin
          </Button>
        </HStack>
        
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
