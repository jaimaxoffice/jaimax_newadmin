// hooks/usePermissionSync.js
import Cookies from "js-cookie";
import { useCheckPermissionsQuery } from "../api/jaimaxApiSlice";

const usePermissionSync = () => {
  const adminToken = Cookies.get("adminToken"); // only token check

  const { data, isLoading } = useCheckPermissionsQuery(undefined, {
    skip: !adminToken,
    pollingInterval: 2 * 60 * 1000,
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
  });

  // ✅ Directly from API — no cookies
  const role = data?.data?.role;
  const permissions = data?.data || [];

  return { role, permissions, loading: isLoading };
};

export default usePermissionSync;