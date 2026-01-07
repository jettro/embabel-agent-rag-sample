import { Box, Text, HStack } from '@chakra-ui/react';
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
      <Box
        maxW="70%"
        bg={isUser ? 'blue.500' : 'gray.100'}
        color={isUser ? 'white' : undefined}
        px={4}
        py={3}
        borderRadius="lg"
        boxShadow="sm"
        _dark={{
          bg: isUser ? 'blue.600' : 'gray.700',
        }}
      >
        <Text whiteSpace="pre-wrap">{message.content}</Text>
      </Box>
    </HStack>
  );
}
