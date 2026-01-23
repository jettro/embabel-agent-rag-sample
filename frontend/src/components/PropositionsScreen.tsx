import { Box, HStack } from '@chakra-ui/react';
import { PropositionList } from './PropositionList';
import { PropositionExtractor } from './PropositionExtractor';

export function PropositionsScreen() {
  return (
    <HStack gap={0} flex={1} align="stretch" overflow="hidden">
      <Box flex={1} h="full" overflow="hidden" borderRightWidth="1px">
        <PropositionList />
      </Box>
      <Box flex={1} h="full" overflow="hidden">
        <PropositionExtractor />
      </Box>
    </HStack>
  );
}
