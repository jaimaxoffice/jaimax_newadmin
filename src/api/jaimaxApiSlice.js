import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = Cookies.get("adminToken");
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReAuth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.data?.status_code === 408) {
    const refreshResult = await baseQuery(
      { url: "/Auth/refreshToken", method: "GET" },
      api,
      extraOptions
    );

    if (refreshResult?.data) {
      Cookies.set("adminToken", refreshResult.data?.data.token, { expires: 7 });
      result = await baseQuery(args, api, extraOptions);
    } else {
      Object.keys(Cookies.get()).forEach((cookieName) =>
        Cookies.remove(cookieName)
      );
      window.location.href = "/login";
    }
  }

  if (result?.error?.data?.status_code === 401) {
    Object.keys(Cookies.get()).forEach((cookieName) =>
      Cookies.remove(cookieName)
    );
    window.location.href = "/login";
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "apiSlice",
  baseQuery: baseQueryWithReAuth,

  tagTypes: [
    "AdminUser",
    "getComment",
    "getStatus",
    "getKyc",
    "getSettings",
    "getTdetails",
    "ShareHolders",
    "updateDetails",
    "ExcludedUsers",
  ],

  refetchOnFocus: false,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    // ✅ NEW API
    checkPermissions: builder.query({
      query: () => ({
        url: "/admin/check-permissions",
        method: "GET",
      }),
      providesTags: ["Permissions"],
    }),
  }),
});

export const { usePrefetch,useCheckPermissionsQuery } = apiSlice;