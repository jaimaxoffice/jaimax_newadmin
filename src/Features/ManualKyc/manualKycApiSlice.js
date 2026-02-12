// addManualAccountsApiSlice.js
import { apiSlice } from "../../api/jaimaxApiSlice";

export const addManualKycApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addManualKyc: builder.mutation({
      query: (userData) => ({
        url: `/kyc/adminSubmitKyc`,
        method: "POST",
        body: userData,
      }),
    }),
  }),
});

// Fixed: Hook name should match endpoint name
export const { useAddManualKycMutation } = addManualKycApiSlice;