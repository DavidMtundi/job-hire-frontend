
import { create } from "zustand";
import { TResumeData } from "~/apis/candidates/schema";
  
type OnboardingState = {
  resume: File | null;
  setResume: (file: File) => void;
  clearResume: () => void;
  resumeData: TResumeData | null;
  setResumeData: (data: TResumeData) => void;
  clearResumeData: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  resume: null,
  setResume: (file) => set({ resume: file }),
  clearResume: () => set({ resume: null }),
  resumeData: null,
  setResumeData: (data) => set({ resumeData: data }),
  clearResumeData: () => set({ resumeData: null }),
}));