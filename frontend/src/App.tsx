import { VStack, HStack } from '@chakra-ui/react';
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Chat } from './components/Chat';
import { Navbar } from './components/Navbar';
import { EventStream } from './components/EventStream';

function App() {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [processId, setProcessId] = useState<string | null>(null);

  return (
    <VStack gap={0} h="100vh" align="stretch">
      <Navbar onUserSelect={setSelectedUserId} />
      <HStack gap={0} flex={1} align="stretch" overflow="hidden">
        <Sidebar />
        <Chat selectedUserId={selectedUserId} onProcessIdChange={setProcessId} />
        <EventStream processId={processId} />
      </HStack>
    </VStack>
  );
}

export default App;
