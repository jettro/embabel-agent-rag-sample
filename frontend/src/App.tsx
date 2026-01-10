import { VStack, HStack } from '@chakra-ui/react';
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Chat } from './components/Chat';
import { Navbar } from './components/Navbar';

function App() {
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  return (
    <VStack gap={0} h="100vh" align="stretch">
      <Navbar onUserSelect={setSelectedUserId} />
      <HStack gap={0} flex={1} align="stretch" overflow="hidden">
        <Sidebar />
        <Chat selectedUserId={selectedUserId} />
      </HStack>
    </VStack>
  );
}

export default App;
