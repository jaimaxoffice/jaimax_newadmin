import { apiSlice } from "../api/jaimaxApiSlice";

export const accountsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Query to get transaction info
    getTxInfo: builder.query({
      query: (txId) => ({
        url: `/accounts/txinfo`,
        method: "POST",
        body: { transactionId: txId },
      }),
    }),

    // ✅ Export transactions - returns blob for download
    exportTransactions: builder.query({
      query: ({ format, transactionType, search, fromDate, toDate, sort }) => {
        const params = new URLSearchParams();
        params.set("format", format);
        if (transactionType) params.set("transactionType", transactionType);
        if (search) params.set("search", search);
        if (fromDate) params.set("fromDate", fromDate);
        if (toDate) params.set("toDate", toDate);
        if (sort) params.set("sort", sort);
        
        return {
          url: `/accounts/transactions/export?${params.toString()}`,
          method: "GET",
          responseHandler: (response) => response.blob(), // ✅ Handle blob response
        };
      },
    }),

    // Export wallet transactions
    exportWallet: builder.query({
      query: (queryParams) => ({
        url: `/wallet/transactions-admin?${queryParams}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Export withdrawals
    exportWithdrawals: builder.query({
      query: (queryParams) => ({
        url: `/accounts/withdrawals/export?${queryParams}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ✅ Mutation to update UTR
    updateUTR: builder.mutation({
      query: ({ id, txId, utrNo }) => ({
        url: `/wallet/update-utr`,
        method: "POST",
        body: { id, txId, utrNo },
      }),
    }),
  }),
});

export const {
  // Regular hooks
  useGetTxInfoQuery,
  useExportTransactionsQuery,
  useExportWalletQuery,
  useExportWithdrawalsQuery,
  useUpdateUTRMutation,

  // Lazy hooks (for manual triggering)
  useLazyGetTxInfoQuery,
  useLazyExportTransactionsQuery,
  useLazyExportWalletQuery,
  useLazyExportWithdrawalsQuery,
} = accountsApiSlice;