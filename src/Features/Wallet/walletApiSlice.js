import { apiSlice } from "../../api/jaimaxApiSlice";

export const walletApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTxInfo: builder.query({
      query: (txId) => ({
        url: `/accounts/txinfo`,
        method: "POST",
        body: { transactionId: txId },
      }),
      transformResponse: (response) => response,
    }),

    transList: builder.query({
      query: (queryParams) => ({
        url: `/wallet/transactions-admin?${queryParams}`,
        method: "GET",
      }),
      providesTags: ["getTdetails"],
    }),
    allTransList: builder.query({
      query: (queryParams) => ({
        url: `/wallet/all-transactions?${queryParams}`,
        method: "GET",
      }),
      providesTags: ["getTdetails"],
    }),

    transUpdate: builder.mutation({
      query: (credentials) => ({
        url: `/wallet/updateStatus`,
        method: "PUT",
        body: credentials,
      }),
      invalidatesTags: ["getTdetails"],
    }),

    transAmountUpdate: builder.mutation({
      query: (credentials) => ({
        url: `/wallet/updateTransaction`,
        method: "PUT",
        body: credentials,
      }),
      invalidatesTags: ["getTdetails"],
    }),

    getkycDetails: builder.query({
      query: (id) => {
        // console.log('Request ID:', id);
        return {
          url: `kyc/KycStatus/${id}`,
          method: "GET",
        };
      },
    }),
    getpaymentgatewaytransactions: builder.query({
      query: (queryParams) => ({
        url: `/wallet/paymentgateway-transactions-admin?${queryParams}`,
        method: "GET",
      }),
    }),

    // getkycDetails: builder.query({

    //   query: (id) => ({
    //     url: `kyc/KycStatus/${id}`,
    //     method: "GET",
    //   }),
    // }),
  }),
});

export const {
  useLazyGetTxInfoQuery,
  useTransListQuery,
  useTransUpdateMutation,
  useGetkycDetailsQuery,
  useTransAmountUpdateMutation,
  useAllTransListQuery,
  useGetpaymentgatewaytransactionsQuery,
} = walletApiSlice;
