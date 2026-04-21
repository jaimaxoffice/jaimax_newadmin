// features/admin/adminMineApiSlice.js
import { apiSlice } from "../../api/jaimaxApiSlice";

export const adminMineApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminWalletTxs: builder.query({
      query: (queryParams) => ({
        url: `/admin-mine/get-mine-wallet-txs`,
        method: "GET",
        params: queryParams,
      }),
      providesTags: ["AdminWalletTxs"],
    }),

    getAdminReferralBonus: builder.query({
      query: (queryParams) => ({
        url: `/admin-mine/get-referral-bonus`,
        method: "GET",
        params: queryParams,
      }),
      providesTags: ["AdminReferralBonus"],
    }),

    getAdminMineLogs: builder.query({
      query: (queryParams) => ({
        url: `/admin-mine/get-mine-logs`,
        method: "GET",
        params: queryParams,
      }),
      providesTags: ["AdminMineLogs"],
    }),
    getAdminDashboard: builder.query({
      query: () => ({
        url: `/admin-mine/get-mine-dashboard-details`,
        method: "GET",
      }),
      providesTags: ["AdminMineLogs"],
    }),
  }),
});

export const {
  useGetAdminWalletTxsQuery,
  useGetAdminReferralBonusQuery,
  useGetAdminMineLogsQuery,
  useGetAdminDashboardQuery,
} = adminMineApiSlice;