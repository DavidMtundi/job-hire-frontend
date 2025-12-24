import { create } from "zustand";
import { TUser } from "~/apis/users/schemas";

type ModalType = "view" | "add" | "edit" | "delete" ;

interface useUserModalStore {
  isOpen: boolean;
  modal: ModalType | null;
  data?: TUser | null;
  onOpen: (modal: ModalType, data?: TUser) => void;
  onClose: () => void;
  onOpenChange: () => void;
}

export const useUserModal = create<useUserModalStore>((set) => ({
  isOpen: false,
  // type: 'modal' | sheet,
  modal: null,
  data: null,
  onOpen: (modal: ModalType, data?: TUser) =>
    set({ isOpen: true, modal, data }),
  onClose: () => 
    set({ isOpen: false, modal: null, data: null }),
  onOpenChange: () =>
    set((state) => ({ isOpen: !state.isOpen, modal: null, data: null })),
}));
