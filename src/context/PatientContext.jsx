import React, { createContext, useContext, useState, useEffect } from "react";
import { patientService } from "../services/patientService";
import { initialPatientsData } from "../utils/mockData";

const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const [patients, setPatients] = useState(initialPatientsData);
  const [loading, setLoading] = useState(false);

  // Fetch real patients from backend API
  const fetchPatients = async (query = {}) => {
    setLoading(true);
    try {
      const res = await patientService.getPatients(query);
      if (res.success && res.data?.patients) {
        setPatients(res.data.patients);
      }
    } catch (error) {
      console.warn("Backend API unavailable or unauthenticated, falling back to mock state:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Add patient (Server generates authoritative CR Number)
  const addPatient = async (patientData) => {
    try {
      const res = await patientService.createPatient(patientData);
      if (res.success && res.data) {
        const created = res.data;
        setPatients((prev) => [created, ...prev]);
        return created;
      }
    } catch (error) {
      console.warn("API create failed, falling back to frontend demo:", error.message);
    }

    // Fallback if backend API offline
    const crNo = `CR-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const fallback = {
      ...patientData,
      id: `PAT-${Date.now()}`,
      crNo,
    };
    setPatients((prev) => [fallback, ...prev]);
    return fallback;
  };

  // Update patient
  const updatePatient = async (id, updatedFields) => {
    try {
      const res = await patientService.updatePatient(id, updatedFields);
      if (res.success && res.data) {
        const updated = res.data;
        setPatients((prev) => prev.map((p) => (p._id === id || p.id === id || p.crNo === id ? updated : p)));
        return updated;
      }
    } catch (error) {
      console.warn("API update failed, updating local state:", error.message);
    }

    setPatients((prev) =>
      prev.map((p) => (p._id === id || p.id === id || p.crNo === id ? { ...p, ...updatedFields } : p))
    );
  };

  // Delete patient
  const deletePatient = async (id) => {
    try {
      await patientService.deletePatient(id);
    } catch (error) {
      console.warn("API delete failed, removing locally:", error.message);
    }
    setPatients((prev) => prev.filter((p) => p._id !== id && p.id !== id && p.crNo !== id));
  };

  return (
    <PatientContext.Provider
      value={{
        patients,
        loading,
        fetchPatients,
        addPatient,
        updatePatient,
        deletePatient,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatientContext = () => useContext(PatientContext);
