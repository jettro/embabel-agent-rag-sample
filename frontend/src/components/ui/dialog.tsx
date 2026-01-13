import { Dialog as ChakraDialog } from '@chakra-ui/react';
import { CloseButton } from '@chakra-ui/react';
import { forwardRef } from 'react';

export const Dialog = {
  Root: ChakraDialog.Root,
  Backdrop: ChakraDialog.Backdrop,
  Positioner: ChakraDialog.Positioner,
  Content: ChakraDialog.Content,
  Header: ChakraDialog.Header,
  Title: ChakraDialog.Title,
  Body: ChakraDialog.Body,
  Footer: ChakraDialog.Footer,
  CloseTrigger: forwardRef<HTMLButtonElement>((props, ref) => (
    <ChakraDialog.CloseTrigger asChild {...props} ref={ref}>
      <CloseButton size="sm" />
    </ChakraDialog.CloseTrigger>
  )),
};
