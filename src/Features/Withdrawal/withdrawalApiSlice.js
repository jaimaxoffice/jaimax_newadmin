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
    updateWithdrawUTR: builder.mutation({
      query: ({id, utrNo}) => ({
        url: `withdraw/updateWithdrawUTR`,
        method: "POST",
        body: { id, utrNo },
      }),
    }),
    withdrawalSlabs: builder.query({
      query: (slab) => ({
        url: `withdraw/withdrawl-process?slab=${slab}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetWithdrawListQuery, useWithdrawApprovalMutation,useUpdateWithdrawUTRMutation,useWithdrawalSlabsQuery   } =
  withdrawalApiSlice;
