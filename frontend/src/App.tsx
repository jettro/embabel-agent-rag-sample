import { VStack, HStack } from '@chakra-ui/react';
import { Sidebar } from './components/Sidebar';
import { Chat } from './components/Chat';
import { Navbar } from './components/Navbar';

function App() {
  return (
    <VStack gap={0} h="100vh" align="stretch">
      <Navbar />
      <HStack gap={0} flex={1} align="stretch" overflow="hidden">
        <Sidebar />
        <Chat />
      </HStack>
    </VStack>
  );
}

export default App;
