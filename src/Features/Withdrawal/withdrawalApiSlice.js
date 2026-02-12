import { apiSlice } from "../../api/jaimaxApiSlice";

export const withdrawalApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWithdrawList: builder.query({
      query: (queryParams) => ({
        url: `withdraw/withdrawList?${queryParams}`,
        method: "GET",
      }),
    }),
    withdrawApproval: builder.mutation({
      query: (credentials) => ({
        url: "withdraw/withrawApproval",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const { useGetWithdrawListQuery, useWithdrawApprovalMutation } =
  withdrawalApiSlice;
