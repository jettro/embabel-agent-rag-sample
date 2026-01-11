import { Toaster as ChakraToaster, createToaster } from '@chakra-ui/react';

export const toaster = createToaster({
  placement: 'top-end',
  pauseOnPageIdle: true,
});

export const Toaster = () => {
  return (
    <ChakraToaster toaster={toaster}>
      {(toast) => (
        <div key={toast.id}>
          {toast.title && <div>{toast.title}</div>}
          {toast.description && <div>{toast.description}</div>}
        </div>
      )}
    </ChakraToaster>
  );
};
