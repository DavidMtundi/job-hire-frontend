import { create } from "zustand";
import { TDepartment } from "~/apis/departments/schemas";

type ModalType = "view" | "add" | "edit" | "delete" ;

interface useDepartmentModalStore {
  isOpen: boolean;
  modal: ModalType | null;
  data?: TDepartment | null;
  onOpen: (modal: ModalType, data?: TDepartment) => void;
  onClose: () => void;
  onOpenChange: () => void;
}

export const useDepartmentModal = create<useDepartmentModalStore>((set) => ({
  isOpen: false,
  // type: 'modal' | sheet,
  modal: null,
  data: null,
  onOpen: (modal: ModalType, data?: TDepartment) =>
    set({ isOpen: true, modal, data }),
  onClose: () => 
    set({ isOpen: false, modal: null, data: null }),
  onOpenChange: () =>
    set((state) => ({ isOpen: !state.isOpen, modal: null, data: null })),
}));
