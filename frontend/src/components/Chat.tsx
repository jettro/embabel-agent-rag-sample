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
import { useChatSSE } from '../hooks/useChatSSE';
import { useAuth } from '../context/AuthContext';

interface ChatProps {
  onConversationIdChange?: (conversationId: string | null) => void;
}

export function Chat({ onConversationIdChange }: ChatProps) {
  const { username } = useAuth();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isConnected, error: sseError, onMessage } = useChatSSE(conversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize session when component mounts
  useEffect(() => {
    if (username) {
      handleInitializeSession();
    }
  }, [username]);

  // Set up SSE message handler
  useEffect(() => {
    onMessage((content: string) => {
      const assistantMessage: ChatMessageType = {
        role: 'assistant',
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    });
  }, [onMessage]);

  const handleInitializeSession = async () => {
    setIsInitializing(true);
    try {
      const response = await initializeSession();
      console.log('Session initialized:', response);
      console.log('ConversationId:', response.conversationId);
      setConversationId(response.conversationId);
      onConversationIdChange?.(response.conversationId);
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
      // Just send the message, response will come via SSE
      await sendChatMessage(input, conversationId);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to send message'}`);
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
                {isInitializing ? 'Initializing session...' : 'Initializing your chat session...'}
              </Text>
              {isInitializing && <Spinner size="lg" colorPalette="blue" />}
            </VStack>
          </Center>
        ) : !isConnected ? (
          <Center h="full">
            <VStack gap={4}>
              <Spinner size="lg" colorPalette="blue" />
              <Text fontSize="lg" color="gray.400">
                Connecting to chat stream...
              </Text>
              {sseError && (
                <Text fontSize="sm" color="red.500">
                  Error: {sseError}
                </Text>
              )}
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
                Session: {conversationId.substring(0, 8)}...
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
