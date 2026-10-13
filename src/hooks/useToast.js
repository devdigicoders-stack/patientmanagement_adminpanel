import { useToast as useToastFromContext } from "../components/ui/Toast";

export const useToast = () => {
  return useToastFromContext();
};
