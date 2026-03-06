import { apiSlice } from "../api/jaimaxApiSlice";

export const accountsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTxInfo: builder.query({
      query: (txId) => ({
        url: `/accounts/txinfo`,
        method: "POST",
        body: { transactionId: txId },
      }),
    }),
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
          responseHandler: (response) => response.blob(), 
        };
      },
    }),

    exportWallet: builder.query({
      query: (queryParams) => ({
        url: `/wallet/transactions-admin?${queryParams}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),

    exportWithdrawals: builder.query({
      query: (queryParams) => ({
        url: `/accounts/withdrawals/export?${queryParams}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),

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
  useGetTxInfoQuery,
  useExportTransactionsQuery,
  useExportWalletQuery,
  useExportWithdrawalsQuery,
  useUpdateUTRMutation,

  useLazyGetTxInfoQuery,
  useLazyExportTransactionsQuery,
  useLazyExportWalletQuery,
  useLazyExportWithdrawalsQuery,
} = accountsApiSlice;