import { VStack, HStack } from '@chakra-ui/react';
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Chat } from './components/Chat';
import { Navbar } from './components/Navbar';
import { EventStream } from './components/EventStream';
import { Login } from './components/Login';
import { useAuth } from './context/AuthContext';

function App() {
  const [processId, setProcessId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <VStack gap={0} h="100vh" align="stretch">
      <Navbar />
      <HStack gap={0} flex={1} align="stretch" overflow="hidden">
        <Sidebar />
        <Chat onProcessIdChange={setProcessId} />
        <EventStream processId={processId} />
      </HStack>
    </VStack>
  );
}

export default App;
