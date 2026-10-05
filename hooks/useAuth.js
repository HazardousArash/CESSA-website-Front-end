import { useSelector } from "react-redux";

export function useAuth() {
  const user = useSelector((state) => state.auth.user);
  const role = useSelector((state) => state.auth.role);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const authChecked = useSelector((state) => state.auth.authChecked);

  return { user, role, isAuthenticated, authChecked };
}