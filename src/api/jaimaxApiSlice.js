import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { useNavigate } from "react-router-dom";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  // credentials: "include",

  prepareHeaders: (headers, { getState }) => {
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT,PATCH, DELETE, OPTIONS"
    );

    const token = localStorage.getItem("token");

    // If we have a token set in state, let's assume that we should be passing it.
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
    const refreshResult = await baseQuery(
      { url: "/Auth/refreshToken", method: "GET" },
      api,
      extraOptions
    );

    if (refreshResult?.data) {
      // Store the new token
      localStorage.setItem("token", refreshResult.data?.data.token);

      // Retry the original query with the new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Token refresh failed
      return refreshResult;
    }
  }

  // If a 401 error occurs, logout or handle it (custom behavior)
  if (result?.error?.data?.status_code === 401) {
    const navigate = useNavigate();
    navigate("/login");
    localStorage.clear();
    // Handle logout or other custom logic
    console.error("Unauthorized: Logging out");
    // Optionally dispatch an action or navigate the user
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
