import { create } from "zustand";
import { TCategory } from "~/apis/categories/schemas";

type ModalType = "view" | "add" | "edit" | "delete" ;

interface useCategoryModalStore {
  isOpen: boolean;
  modal: ModalType | null;
  data?: TCategory | null;
  onOpen: (modal: ModalType, data?: TCategory) => void;
  onClose: () => void;
  onOpenChange: () => void;
}

export const useCategoryModal = create<useCategoryModalStore>((set) => ({
  isOpen: false,
  // type: 'modal' | sheet,
  modal: null,
  data: null,
  onOpen: (modal: ModalType, data?: TCategory) =>
    set({ isOpen: true, modal, data }),
  onClose: () => 
    set({ isOpen: false, modal: null, data: null }),
  onOpenChange: () =>
    set((state) => ({ isOpen: !state.isOpen, modal: null, data: null })),
}));
