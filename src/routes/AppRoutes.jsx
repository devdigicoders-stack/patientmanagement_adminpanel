import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import { Loader2 } from "lucide-react";

// Lazy Loaded Page Components for Production Performance
const Login = lazy(() => import("../pages/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const AllPatients = lazy(() => import("../pages/AllPatients"));
const PatientRegistration = lazy(() => import("../pages/PatientRegistration"));
const AdvancedSearch = lazy(() => import("../pages/AdvancedSearch"));
const PatientProfile = lazy(() => import("../pages/PatientProfile"));
const PatientEdit = lazy(() => import("../pages/PatientEdit"));
const MedicalHistory = lazy(() => import("../pages/MedicalHistory"));
const MyProfile = lazy(() => import("../pages/MyProfile"));
const ChangePassword = lazy(() => import("../pages/ChangePassword"));

// Reports Module Pages
const ReportHub = lazy(() => import("../pages/reports/ReportHub"));
const OPDReportPage = lazy(() => import("../pages/reports/OPDReportPage"));
const IPDReportPage = lazy(() => import("../pages/reports/IPDReportPage"));
const DischargeReportPage = lazy(() => import("../pages/reports/DischargeReportPage"));
const FollowUpReportPage = lazy(() => import("../pages/reports/FollowUpReportPage"));
const HistopathologyReportPage = lazy(() => import("../pages/reports/HistopathologyReportPage"));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-3">
    <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
    <span className="text-xs font-semibold">Loading Module...</span>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected Main Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AllPatients />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients/register"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <PatientRegistration />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients/search"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdvancedSearch />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients/:id"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <PatientProfile />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients/:id/edit"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <PatientEdit />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients/:id/history"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <MedicalHistory />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* REPORTS MODULE ROUTES */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ReportHub />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/opd"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <OPDReportPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/ipd"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <IPDReportPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/discharges"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <DischargeReportPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/reports/discharge" element={<Navigate to="/reports/discharges" replace />} />

        <Route
          path="/reports/followups"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <FollowUpReportPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/reports/follow-up" element={<Navigate to="/reports/followups" replace />} />

        <Route
          path="/reports/histopathology"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <HistopathologyReportPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <MyProfile />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ChangePassword />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Single Admin Flow: Redirect any /admin route to Dashboard */}
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
