import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
  } from "@nextui-org/react";
  
  interface IndicationModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void; // Prop to handle the open state
    title: string;
    content: string[];
    primaryActionLabel?: string;
    onPrimaryAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
  }
  
  const IndicationModal = ({
    isOpen,
    onOpenChange,
    title,
    content,
    primaryActionLabel,
    onPrimaryAction,
    secondaryActionLabel,
    onSecondaryAction,
  }: IndicationModalProps) => {
    return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}>
        <ModalContent> 
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
              <ModalBody>
                {content.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </ModalBody>
              <ModalFooter>
                {onSecondaryAction && secondaryActionLabel && 
                (<Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    onSecondaryAction();
                    onClose();
                  }}
                >
                  {secondaryActionLabel || "Close"}
                </Button>)}
                {onPrimaryAction && primaryActionLabel && 
                (<Button onPress={() => {
                    onPrimaryAction();
                    onClose();
                  }} className="bg-[#ECCF2C]">
                  {primaryActionLabel || "Action"}
                </Button>)}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  };
  
  export default IndicationModal;
  