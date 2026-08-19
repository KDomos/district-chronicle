import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingState from "./LoadingState";

export default function ProtectedRoute() {
  const { isAuthed, checked } = useAuth();

  if (!checked) return <LoadingState label="Checking credentials" />;
  if (!isAuthed) return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}
