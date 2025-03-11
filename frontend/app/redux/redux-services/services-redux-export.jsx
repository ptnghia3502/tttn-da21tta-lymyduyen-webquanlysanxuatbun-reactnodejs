import { useSelector } from "react-redux";

export const ReduxExportServices = () => {
  const { userInfo, isAuthenticated, accessToken } = useSelector(
    (state) => state.auth
  );
  return { userInfo, isAuthenticated, accessToken };
};
