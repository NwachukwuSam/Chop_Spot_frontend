import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Don't do anything while checking authentication
    if (loading) return;

    // No user logged in
    if (!user) {
      navigate("/login", {
        state: { 
          returnTo: window.location.pathname,
          message: "Please login to access this page"
        },
        replace: true,
      });
      return;
    }

    // Check role permissions
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect based on user's actual role
      switch (user.role) {
        case "super_admin":
          navigate("/super-admin-dashboard", { replace: true });
          break;
        case "admin":
          navigate("/admin-dashboard", { replace: true });
          break;
        case "vendor":
          navigate("/vendor-dashboard", { replace: true });
          break;
        case "rider":
          navigate("/rider-dashboard", { replace: true });
          break;
        case "customer":
          navigate("/customer-dashboard", { replace: true });
          break;
        case "accounting":
          navigate("/accounting-dashboard", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
      return;
    }
  }, [user, loading, navigate, allowedRoles]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

 
  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }
  return children;
};

export default ProtectedRoute;