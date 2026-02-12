// marketingReportsApiSlice.js
import { apiSlice } from "../../api/jaimaxApiSlice";

export const marketingReportsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInactiveUsers: builder.query({
      query: () => ({
        url: `/Admin/inactive-users`,
        method: "GET",
      }),
    }),
    getUsersWithZeroDirectRefs: builder.query({
      query: () => ({
        url: `/Admin/zero-direct-refs-users`,
        method: "GET",
      }),
    }),
    // Split the 1-5 range into two separate endpoints
    getUsersWithOneToTwoDirectRefs: builder.query({
      query: () => ({
        url: `/Admin/users/direct-refs/1-to-2`,
        method: "GET",
      }),
    }),
    getUsersWithThreeToFiveDirectRefs: builder.query({
      query: () => ({
        url: `/Admin/users/direct-refs/3-to-5`,
        method: "GET",
      }),
    }),
    getUsersWithSixToNineDirectRefs: builder.query({
      query: () => ({
        url: `/Admin/users/direct-refs/6-to-9`,
        method: "GET",
      }),
    }),
    getUsersWithTenToTwentyFiveDirectRefs: builder.query({
      query: () => ({
        url: `/Admin/users/direct-refs/10-to-25`,
        method: "GET",
      }),
    }),
    getUsersWithTwentySixToHundredDirectRefs: builder.query({
      query: () => ({
        url: `/Admin/users/direct-refs/26-to-100`,
        method: "GET",
      }),
    }),
    getAllUsers: builder.query({
      query: () => ({
        url: `/Admin/all-users`,
        method: "GET",
      }),
      // providesTags: ["getAllUsers"],
    }),
  }),
});

export const {
  useGetInactiveUsersQuery,
  useGetUsersWithZeroDirectRefsQuery,
  useGetUsersWithOneToTwoDirectRefsQuery,
  useGetUsersWithThreeToFiveDirectRefsQuery,
  useGetUsersWithSixToNineDirectRefsQuery,
  useGetUsersWithTenToTwentyFiveDirectRefsQuery,
  useGetUsersWithTwentySixToHundredDirectRefsQuery,
  useGetAllUsersQuery,
} = marketingReportsApiSlice;
