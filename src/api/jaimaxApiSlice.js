// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import { useNavigate } from "react-router-dom";

// const baseQuery = fetchBaseQuery({
//   baseUrl: import.meta.env.VITE_API_BASE_URL,
//   // credentials: "include",

//   prepareHeaders: (headers, { getState }) => {
//     headers.set("Access-Control-Allow-Origin", "*");
//     headers.set(
//       "Access-Control-Allow-Methods",
//       "GET, POST, PUT,PATCH, DELETE, OPTIONS"
//     );

//     const token = localStorage.getItem("token");

//     // If we have a token set in state, let's assume that we should be passing it.
//     if (token) {
//       headers.set("authorization", `Bearer ${token}`);
//     }
//     return headers;
//   },
// });

// /**
//  * Custom base query to handle token refresh and retry logic.
//  */
// const baseQueryWithReAuth = async (args, api, extraOptions) => {
//   let result = await baseQuery(args, api, extraOptions);

//   // If a 408 error occurs, try to refresh the token
//   if (result?.error?.data?.status_code === 408) {
//     const refreshResult = await baseQuery(
//       { url: "/Auth/refreshToken", method: "GET" },
//       api,
//       extraOptions
//     );

//     if (refreshResult?.data) {
//       // Store the new token
//       localStorage.setItem("token", refreshResult.data?.data.token);

//       // Retry the original query with the new token
//       result = await baseQuery(args, api, extraOptions);
//     } else {
//       // Token refresh failed
//       return refreshResult;
//     }
//   }

//   // If a 401 error occurs, logout or handle it (custom behavior)
//   if (result?.error?.data?.status_code === 401) {
//     const navigate = useNavigate();
//     navigate("/login");
//     localStorage.clear();
//     // Handle logout or other custom logic
//     console.error("Unauthorized: Logging out");
//     // Optionally dispatch an action or navigate the user
//   }

//   return result;
// };

// export const apiSlice = createApi({
//   reducerPath: "apiSlice",
//   baseQuery: baseQueryWithReAuth,
//   tagTypes: [
//     "getComment",
//     "getStatus",
//     "getKyc",
//     "getSettings",
//     "getTdetails",
//     "ShareHolders",
//     "updateDetails",
//     "ExcludedUsers",
//   ],
//   endpoints: (builder) => ({}),
// });

// export const { usePrefetch } = apiSlice;
// src/redux/apiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

// Cookie configuration
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: true, // HTTPS only
  sameSite: "Strict",
  path: "/",
};

// Cookie helper functions
export const setCookie = (key, value) => {
  Cookies.set(key, value, COOKIE_OPTIONS);
};

export const getCookie = (key) => {
  return Cookies.get(key);
};

export const removeCookie = (key) => {
  Cookies.remove(key, { path: "/" });
};

export const clearAllCookies = () => {
  removeCookie("token");
  removeCookie("refreshToken");
  removeCookie("user");
  removeCookie("permissions");
  removeCookie("role");
};

// Set user data in cookies
export const setAuthCookies = (data) => {
  if (data?.token) setCookie("token", data.token);
  if (data?.refreshToken) setCookie("refreshToken", data.refreshToken);
  if (data?.user) setCookie("user", JSON.stringify(data.user));
  if (data?.permissions) setCookie("permissions", JSON.stringify(data.permissions));
  if (data?.role) setCookie("role", data.role);
};

// Get parsed user/permissions from cookies
export const getAuthFromCookies = () => {
  const token = getCookie("token");
  const user = getCookie("user");
  const permissions = getCookie("permissions");
  const role = getCookie("role");

  return {
    token,
    user: user ? JSON.parse(user) : null,
    permissions: permissions ? JSON.parse(permissions) : [],
    role: role || null,
    isAuthenticated: !!token,
  };
};

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,

  prepareHeaders: (headers) => {
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );

    // Get token from cookie instead of localStorage
    const token = getCookie("token");

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

/**
 * Custom base query to handle token refresh and retry logic.
 */
const baseQueryWithReAuth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If a 408 error occurs, try to refresh the token
  if (result?.error?.data?.status_code === 408) {
    const refreshToken = getCookie("refreshToken");

    const refreshResult = await baseQuery(
      {
        url: "/Auth/refreshToken",
        method: "GET",
        headers: {
          authorization: `Bearer ${refreshToken}`,
        },
      },
      api,
      extraOptions
    );

    if (refreshResult?.data) {
      // Store new token in cookie
      setCookie("token", refreshResult.data?.data?.token);

      // If new permissions come with refresh, update them too
      if (refreshResult.data?.data?.permissions) {
        setCookie(
          "permissions",
          JSON.stringify(refreshResult.data.data.permissions)
        );
      }

      // Retry the original query with the new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Token refresh failed — clear everything and redirect
      clearAllCookies();
      window.location.href = "/login";
      return refreshResult;
    }
  }

  // If a 401 error occurs, logout
  if (result?.error?.data?.status_code === 401) {
    clearAllCookies();
    window.location.href = "/login";
    console.error("Unauthorized: Logging out");
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "apiSlice",
  baseQuery: baseQueryWithReAuth,
  tagTypes: [
    "getComment",
    "getStatus",
    "getKyc",
    "getSettings",
    "getTdetails",
    "ShareHolders",
    "updateDetails",
    "ExcludedUsers",
  ],
  endpoints: (builder) => ({}),
});

export const { usePrefetch } = apiSlice;