import { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { getStudentProfile, updateStudentProfile } from "./api/student";
import { getDrives } from "./api/drives";
import ErrorBoundary from "./components/ErrorBoundary";
import {
  applyToDrive as submitApplication,
  getMyApplications,
} from "./api/applications";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import DrivesPage from "./pages/DrivesPage";
import DriveDetailPage from "./pages/DriveDetailPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ApplyPage from "./pages/ApplyPage";
import SettingsPage from "./pages/SettingsPage";
import ResourcesPage from "./pages/ResourcesPage";

import Sidebar from "./components/Sidebar";

import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import TeamPage from "./pages/TeamPage";
function AppLayout({
  user,
  applications,
  setUser,
  applyToDrive,
  hasApplied,
  drives,
  dataErrors,
  newDrivesCount,
  onDrivesOpen,
}) {
  const navigate = useNavigate();

  const goToDrive = (driveId) => {
    navigate(`/drives/${driveId}`);
  };

  const goToApply = (driveId) => {
    navigate(`/drives/${driveId}/apply`);
  };

  const goToPage = (page) => {
    navigate(page === "dashboard" ? "/" : `/${page}`);
  };
  const handleSaveProfile = async (updatedProfile) => {
    try {
      const response = await updateStudentProfile(updatedProfile);
      const updatedStudent = response.student;
      const updatedUser = {
        ...user,

        ...updatedStudent,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error(
        "Profile save error:",

        error,
      );
      throw error;
    }
  };
  return (
    <div className="flex h-screen min-w-0 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        drivesCount={newDrivesCount}
        onDrivesOpen={onDrivesOpen}
        onLogout={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}
      />
      {/* Main content */}
      <main className="min-w-0 flex-1 overflow-auto">
        {(dataErrors.drives || dataErrors.applications) && (
          <div
            className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6"
            role="alert"
          >
            {dataErrors.drives && <p>{dataErrors.drives}</p>}
            {dataErrors.applications && <p>{dataErrors.applications}</p>}
          </div>
        )}
        <Routes>
          {/* Dashboard */}
          <Route
            path="/"
            element={
              <Dashboard
                user={user}
                drives={drives}
                onNav={goToPage}
                onSelectDrive={goToDrive}
                hasApplied={hasApplied}
                onApply={goToApply}
                applicationCount={applications.length}
              />
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={<ProfilePage user={user} onNav={goToPage} />}
          />

          {/* Placement drives */}
          <Route
            path="/drives"
            element={
              <DrivesPage
                drives={drives}
                onNav={goToPage}
                onSelectDrive={goToDrive}
                hasApplied={hasApplied}
                onApply={goToApply}
              />
            }
          />

          {/* Drive details */}
          <Route
            path="/drives/:driveId"
            element={
              <DriveDetailPage
                drives={drives}
                onNav={goToPage}
                hasApplied={hasApplied}
                onApply={goToApply}
              />
            }
          />

          {/* Apply to drive */}
          <Route
            path="/drives/:driveId/apply"
            element={
              <ApplyPage
                drives={drives}
                user={user}
                onNav={goToPage}
                onApply={applyToDrive}
              />
            }
          />

          {/* Applications */}
          <Route
            path="/applications"
            element={
              <ApplicationsPage
                drives={drives}
                applications={applications}
                onNav={goToPage}
                onSelectDrive={goToDrive}
              />
            }
          />

          <Route
            path="/resources"
            element={<ResourcesPage onNav={goToPage} />}
          />

          {/* Settings */}

          <Route
            path="/settings"
            element={
              <SettingsPage
                user={user}
                onNav={goToPage}
                onSave={handleSaveProfile}
              />
            }
          />
          {/* Unknown route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
function AuthenticatedApp({ onLogout }) {
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [driveError, setDriveError] = useState("");
  const [applicationsError, setApplicationsError] = useState("");
  const [, setDrivesSeenVersion] = useState(0);
  const [user, setUser] = useState(null);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadData = () => {
      getDrives()
        .then((data) => {
          setDrives(data);
          setDriveError("");
        })
        .catch((error) =>
          setDriveError(error.message || "Unable to load placement drives."),
        );
      getMyApplications()
        .then((data) => {
          setApplications(data);
          setApplicationsError("");
        })
        .catch((error) =>
          setApplicationsError(
            error.message || "Unable to load your applications.",
          ),
        );
    };

    loadData();
    const refreshTimer = window.setInterval(loadData, 30000);
    return () => window.clearInterval(refreshTimer);
  }, [user]);

  useEffect(() => {
    getStudentProfile()
      .then((student) => {
        if (!student) {
          throw new Error("Student profile is unavailable");
        }

        const updatedUser = {
          ...student,
          email: student.userId?.email,
          name: student.userId?.name,
          role: student.userId?.role,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      })
      .catch((error) => {
        console.error("Profile fetch error:", error);

        if ([401, 403, 404].includes(error.status)) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          onLogout();
          return;
        }

        setProfileError("Unable to verify your account. Please refresh to try again.");
      });
  }, [onLogout]);

  const seenDrivesKey = `seen-drive-ids:${user?._id || user?.id || user?.email || "student"}`;

  useEffect(() => {
    if (!drives.length) return;

    const driveIds = drives.map((drive) => String(drive.id || drive._id));
    if (!localStorage.getItem(seenDrivesKey)) {
      localStorage.setItem(seenDrivesKey, JSON.stringify(driveIds));
    }
  }, [drives, seenDrivesKey]);

  const newDrivesCount = (() => {
    const storedSeenIds = localStorage.getItem(seenDrivesKey);
    if (!storedSeenIds) return 0;

    try {
      const seenIds = new Set(JSON.parse(storedSeenIds));
      return drives.filter((drive) => !seenIds.has(String(drive.id || drive._id)))
        .length;
    } catch {
      return 0;
    }
  })();

  const markDrivesSeen = () => {
    const driveIds = drives.map((drive) => String(drive.id || drive._id));
    localStorage.setItem(seenDrivesKey, JSON.stringify(driveIds));
    setDrivesSeenVersion((version) => version + 1);
  };

  const applyToDrive = async (driveId, payload = {}) => {
    const response = await submitApplication(driveId, payload);
    setApplications((prev) => {
      const alreadyApplied = prev.some((application) =>
        [application.driveId, application.drive?._id].some(
          (applicationDriveId) =>
            String(applicationDriveId) === String(driveId),
        ),
      );

      if (alreadyApplied) {
        return prev;
      }

      return [
        ...prev,
        response.application || {
          driveId,
          appliedAt: new Date(),
          status: "Applied",
          payload,
        },
      ];
    });
    return response;
  };

  const hasApplied = (driveId) => {
    return applications.some((application) =>
      [application.driveId, application.drive?._id].some(
        (applicationDriveId) => String(applicationDriveId) === String(driveId),
      ),
    );
  };

  if (profileError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center text-slate-700">
        {profileError}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Checking your account...
      </div>
    );
  }

  return (
    <AppLayout
      user={user}
      applications={applications}
      setUser={setUser}
      applyToDrive={applyToDrive}
      hasApplied={hasApplied}
      drives={drives}
      dataErrors={{ drives: driveError, applications: applicationsError }}
      newDrivesCount={newDrivesCount}
      onDrivesOpen={markDrivesSeen}
    />
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("token") !== null,
  );
  const handleLogout = useCallback(() => setLoggedIn(false), []);

  useEffect(() => {
    window.addEventListener("auth-expired", handleLogout);
    return () => window.removeEventListener("auth-expired", handleLogout);
  }, [handleLogout]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={<LoginPage onLogin={() => setLoggedIn(true)} />}
        />
        <Route
          path="/signup"
          element={
            <Signup />
          }
        />
        <Route
          path="/verify-email"
          element={<VerifyEmail onRegistered={() => setLoggedIn(true)} />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/team"
          element={<TeamPage />}
        />

        {/* Authenticated routes — redirect to /login if not logged in */}
        <Route
          path="/*"
          element={
            loggedIn ? (
              <AuthenticatedApp onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
