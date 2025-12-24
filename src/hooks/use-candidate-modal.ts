import { create } from "zustand";
import { TCandidate } from "~/apis/candidates/schema";

type ModalType = "view" | "add" | "edit" | "delete" ;

interface useCandidateModalStore {
  isOpen: boolean;
  modal: ModalType | null;
  data?: TCandidate | null;
  onOpen: (modal: ModalType, data?: TCandidate) => void;
  onClose: () => void;
  onOpenChange: () => void;
}

export const useCandidateModal = create<useCandidateModalStore>((set) => ({
  isOpen: false,
  // type: 'modal' | sheet,
  modal: null,
  data: null,
  onOpen: (modal: ModalType, data?: TCandidate) =>
    set({ isOpen: true, modal, data }),
  onClose: () => 
    set({ isOpen: false, modal: null, data: null }),
  onOpenChange: () =>
    set((state) => ({ isOpen: !state.isOpen, modal: null, data: null })),
}));
