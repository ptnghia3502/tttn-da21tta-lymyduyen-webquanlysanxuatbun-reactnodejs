import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { verifyAdmin } from "../services/userAccountService";
import { enqueueSnackbar } from "notistack";
import { CircularProgress, Box } from "@mui/material";

const GuardRoute = ({ element: Element, allowedRoles }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        enqueueSnackbar("Bạn không có quyền truy cập vào trang này", {
          variant: "info",
        });
        setLoading(false);
        return;
      }

      try {
        const role = await verifyAdmin(accessToken);
        setUserRole(role);
      } catch (error) {
        setUserRole(null);
      }
      setLoading(false);
    };

    checkUserRole();
  }, []);

  if (loading)
    return (
      <Box
                sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (userRole === "admin" || (userRole && allowedRoles.includes(userRole))) {
    return <Element />;
  }

  return <Navigate to="/auth/login" />;
};

export default GuardRoute;
