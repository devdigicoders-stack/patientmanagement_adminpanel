import { usePatientContext } from "../context/PatientContext";

export const usePatients = () => {
  return usePatientContext();
};
