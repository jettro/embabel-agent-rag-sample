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
import { sendChatMessage } from '../api';
import { ChatMessage } from './ChatMessage';
import { FiArrowUp } from 'react-icons/fi';

export function Chat() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(input);
      const assistantMessage: ChatMessageType = {
        role: 'assistant',
        content: response,
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
    <VStack gap={0} flex={1} overflow="hidden">
      {/* Messages area */}
      <Box
        flex={1}
        w="full"
        overflowY="auto"
        bg="white"
        px={8}
        py={6}
      >
        {messages.length === 0 ? (
          <Center h="full">
            <Text color="gray.400" fontSize="lg">
              Start a conversation...
            </Text>
          </Center>
        ) : (
          <VStack gap={0} align="stretch">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && (
              <HStack justify="flex-start" mb={4}>
                <Spinner size="sm" color="blue.500" />
                <Text color="gray.500" fontSize="sm">
                  Assistant is thinking...
                </Text>
              </HStack>
            )}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      {/* Input area */}
      <Box
        w="full"
        borderTop="1px"
        borderColor="gray.200"
        bg="white"
        color="gray.800"
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
            bg="gray.50"
            _focus={{ bg: 'white', borderColor: 'blue.500' }}
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
    </VStack>
  );
}
