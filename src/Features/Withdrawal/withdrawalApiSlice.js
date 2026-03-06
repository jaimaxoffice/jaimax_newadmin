// import { apiSlice } from "../../api/jaimaxApiSlice";

// export const withdrawalApiSlice = apiSlice.injectEndpoints({
//   endpoints: (builder) => ({
//     getWithdrawList: builder.query({
//       query: (queryParams) => ({
//         url: `withdraw/withdrawList?${queryParams}`,
//         method: "GET",
//       }),
//     }),
//     withdrawApproval: builder.mutation({
//       query: (credentials) => ({
//         url: "withdraw/withrawApproval",
//         method: "POST",
//         body: credentials,
//       }),
//     }),
//     updateWithdrawUTR: builder.mutation({
//       query: ({id, utrNo}) => ({
//         url: `withdraw/updateWithdrawUTR`,
//         method: "POST",
//         body: { id, utrNo },
//       }),
//     }),
//     withdrawalSlabs: builder.query({
//       query: (slab) => ({
//         url: `withdraw/withdrawl-process?slab=${slab}`,
//         method: "GET",
//       }),
//     }),
//     // updateWithdrawalCheque: builder.mutation({
//     //   query: ({ slab, chequeNumber }) => ({
//     //     url: `withdraw/withdrawl-update-cheque?slab=${slab}`,
//     //     method: 'PUT',
//     //     body: { chequeNumber },
//     //   }),
//     // }),
//     updateWithdrawalCheque: builder.mutation({
//       query: ({ slab, chequeNumber }) => ({
//         url: `withdraw/withdrawl-update-cheque?slab=${slab}`,
//         method: 'PUT',
//         body: { chequeNumber },
//       }),
//       invalidatesTags: (result, error, { slab }) => [
//         { type: 'Withdrawal', id: `SLAB-${slab}` },
//         'Withdrawal'
//       ],
//     }),
//   }),
// });

// export const { useGetWithdrawListQuery, useWithdrawApprovalMutation,useUpdateWithdrawUTRMutation,useWithdrawalSlabsQuery ,useUpdateWithdrawalChequeMutation   } =
//   withdrawalApiSlice;
import { apiSlice } from "../../api/jaimaxApiSlice";

export const withdrawalApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWithdrawList: builder.query({
      query: (queryParams) => ({
        url: `withdraw/withdrawList?${queryParams}`,
        method: "GET",
      }),
      providesTags: ['Withdrawal'],
    }),

    withdrawApproval: builder.mutation({
      query: (credentials) => ({
        url: "withdraw/withrawApproval",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ['Withdrawal'],
    }),

    updateWithdrawUTR: builder.mutation({
      query: ({ id, utrNo }) => ({
        url: `withdraw/updateWithdrawUTR`,
        method: "POST",
        body: { id, utrNo },
      }),
      invalidatesTags: ['Withdrawal'],
    }),

    withdrawalSlabs: builder.query({
      query: (slab) => ({
        url: `withdraw/withdrawl-process?slab=${slab}`,
        method: "GET",
      }),
      providesTags: ['Withdrawal'],
    }),

    updateWithdrawalCheque: builder.mutation({
      query: ({ slab, chequeNumber }) => ({
        url: `withdraw/withdrawl-update-cheque`,
        method: 'POST',
        body: { chequeNumber, slab },
      }),
      invalidatesTags: ['Withdrawal'],
    }),
    updateWithdrawalStatus: builder.mutation({
      query: ({ chequeNumber }) => ({
        url: `withdraw/withdrawl-update-success`,
        method: 'POST',
        body: { chequeNumber },
      }),
      
    }),
    getWithdrawUnderProcessList: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `withdraw/under-process-withdraws-list?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ['Withdrawal'],
    }),
    getWithdrawDocList: builder.query({
      query: (chequeNumber) => ({
        url: `withdraw/report-for-underprocess`,
        method: "GET",
        params: { chequeNumber },
      }),
      providesTags: ['Withdrawal'],
    }),
  }),
});

export const {
  useGetWithdrawListQuery,
  useWithdrawApprovalMutation,
  useUpdateWithdrawUTRMutation,
  useWithdrawalSlabsQuery,
  useUpdateWithdrawalChequeMutation,
  useUpdateWithdrawalStatusMutation,
  useGetWithdrawUnderProcessListQuery,
  useGetWithdrawDocListQuery,
  useLazyGetWithdrawDocListQuery
} = withdrawalApiSlice;