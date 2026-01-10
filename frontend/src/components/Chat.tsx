import {
  Box,
  VStack,
  HStack,
  Input,
  IconButton,
  Spinner,
  Center,
  Text,
} from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import type { ChatMessage as ChatMessageType } from '../api';
import { sendChatMessage, initializeSession } from '../api';
import { ChatMessage } from './ChatMessage';
import { FiArrowUp } from 'react-icons/fi';

interface ChatProps {
  selectedUserId?: string;
}

export function Chat({ selectedUserId }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [processId, setProcessId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize session when user is selected
  useEffect(() => {
    if (selectedUserId) {
      handleInitializeSession(selectedUserId);
    }
  }, [selectedUserId]);

  const handleInitializeSession = async (userId: string) => {
    if (!userId.trim()) return;

    setIsInitializing(true);
    try {
      const response = await initializeSession(userId);
      setConversationId(response.conversationId);
      setProcessId(response.processId);
      setMessages([]);
    } catch (error) {
      alert(`Error initializing session: ${error instanceof Error ? error.message : 'Failed to initialize'}`);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !conversationId) return;

    const userMessage: ChatMessageType = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(input, conversationId);
      setProcessId(response.procesId);
      const assistantMessage: ChatMessageType = {
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to send message'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <VStack gap={0} flex={1} h="full" overflow="hidden">
      {/* Messages area */}
      <Box
        flex={1}
        w="full"
        overflowY="auto"
        px={8}
        py={6}
      >
        {!conversationId ? (
          <Center h="full">
            <VStack gap={4}>
              <Text fontSize="lg" color="gray.400">
                {isInitializing ? 'Initializing session...' : 'Please select a user from the dropdown above'}
              </Text>
              {isInitializing && <Spinner size="lg" colorPalette="blue" />}
            </VStack>
          </Center>
        ) : messages.length === 0 ? (
          <Center h="full">
            <VStack gap={3}>
              <Text fontSize="lg" color="gray.400">
                Start a conversation...
              </Text>
              <Text fontSize="sm" color="gray.500">
                Session ID: {conversationId.substring(0, 8)}...
              </Text>
            </VStack>
          </Center>
        ) : (
          <VStack gap={0} align="stretch">
            <HStack justify="flex-start" mb={4} pb={2} borderBottomWidth="1px">
              <Text fontSize="xs" color="gray.500">
                Session: {conversationId.substring(0, 8)}... | Process: {processId?.substring(0, 8) || 'N/A'}...
              </Text>
            </HStack>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && (
              <HStack justify="flex-start" mb={4}>
                <Spinner size="sm" colorPalette="blue" />
                <Text fontSize="sm">
                  Assistant is thinking...
                </Text>
              </HStack>
            )}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      {/* Input area */}
      {conversationId && (
        <Box
          w="full"
          borderTopWidth="1px"
          p={6}
        >
          <HStack gap={3} maxW="4xl" mx="auto">
            <Input
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              size="lg"
              variant="outline"
              disabled={isLoading}
            />
            <IconButton
              aria-label="Send message"
              colorPalette="blue"
              size="lg"
              onClick={handleSend}
              loading={isLoading}
              disabled={!input.trim()}
            >
              <FiArrowUp />
            </IconButton>
          </HStack>
        </Box>
      )}
    </VStack>
  );
}
