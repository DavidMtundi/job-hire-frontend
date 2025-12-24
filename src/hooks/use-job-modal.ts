import { create } from "zustand";
import { TJob } from "~/apis/jobs/schemas";

type ModalType = "view" | "add" | "edit" | "delete" ;

interface useJobModalStore {
  isOpen: boolean;
  modal: ModalType | null;
  data?: TJob | null;
  onOpen: (modal: ModalType, data?: TJob) => void;
  onClose: () => void;
  onOpenChange: () => void;
}

export const useJobModal = create<useJobModalStore>((set) => ({
  isOpen: false,
  // type: 'modal' | sheet,
  modal: null,
  data: null,
  onOpen: (modal: ModalType, data?: TJob) =>
    set({ isOpen: true, modal, data }),
  onClose: () => 
    set({ isOpen: false, modal: null, data: null }),
  onOpenChange: () =>
    set((state) => ({ isOpen: !state.isOpen, modal: null, data: null })),
}));
