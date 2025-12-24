import { create } from "zustand";
import { TApplication } from "~/apis/applications/schemas";

type ModalType = "view"  | "resume" | "add" | "edit" | "delete" ;

interface useApplicationModalStore {
  isOpen: boolean;
  modal: ModalType | null;
  data?: TApplication | null;
  onOpen: (modal: ModalType, data?: TApplication) => void;
  onClose: () => void;
  onOpenChange: () => void;
}

export const useApplicationModal = create<useApplicationModalStore>((set) => ({
  isOpen: false,
  // type: 'modal' | sheet,
  modal: null,
  data: null,
  onOpen: (modal: ModalType, data?: TApplication) =>
    set({ isOpen: true, modal, data }),
  onClose: () => 
    set({ isOpen: false, modal: null, data: null }),
  onOpenChange: () =>
    set((state) => ({ isOpen: !state.isOpen, modal: null, data: null })),
}));
