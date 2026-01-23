import { Box, HStack } from '@chakra-ui/react';
import { PropositionList } from './PropositionList';

export function PropositionsScreen() {
  return (
    <HStack gap={0} flex={1} align="stretch" overflow="hidden">
      <Box flex={1} h="full" overflow="hidden">
        <PropositionList />
      </Box>
      {/* Future: Add extraction test component here */}
    </HStack>
  );
}
