// addManualAccountsApiSlice.js
import { apiSlice } from "../../api/jaimaxApiSlice";

export const addManualAccountsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addManualAccounts: builder.mutation({
      query: (userData) => ({
        url: `/wallet/admin-add-transaction`,
        method: "POST",
        body: userData,
      }),
    }),
  }),
});

// Fixed: Hook name should match endpoint name
export const { useAddManualAccountsMutation } = addManualAccountsApiSlice;