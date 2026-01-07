import { Box, Text, HStack, Avatar } from '@chakra-ui/react';
import type { ChatMessage as ChatMessageType } from '../api';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <HStack
      gap={3}
      justify={isUser ? 'flex-end' : 'flex-start'}
      w="full"
      mb={4}
    >
      {!isUser && (
        <Avatar.Root size="sm" bg="blue.500" color="white">
          <Avatar.Fallback>A</Avatar.Fallback>
        </Avatar.Root>
      )}
      <Box
        maxW="70%"
        bg={isUser ? 'blue.500' : 'gray.100'}
        color={isUser ? 'white' : 'gray.800'}
        px={4}
        py={3}
        borderRadius="lg"
        boxShadow="sm"
      >
        <Text whiteSpace="pre-wrap">{message.content}</Text>
      </Box>
      {isUser && (
        <Avatar.Root size="sm" bg="gray.500" color="white">
          <Avatar.Fallback>U</Avatar.Fallback>
        </Avatar.Root>
      )}
    </HStack>
  );
}
