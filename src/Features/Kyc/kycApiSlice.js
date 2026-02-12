import { apiSlice } from "../../api/jaimaxApiSlice";

export const kycApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
  
  
    kycList: builder.query({
      query: (queryParams) => ({
        url: `/kyc/Kyc_list?${queryParams}`,
        method: "GET",
      }),
      providesTags: ["getKyc"],
    }),


    kycUpdate: builder.mutation({
      query: (credentials) => ({
        url: `kyc/KycStatusUpdate`,
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["getKyc"],
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

    // getkycDetails: builder.query({
      
    //   query: (id) => ({
    //     url: `kyc/KycStatus/${id}`,
    //     method: "GET",
    //   }),
    // }),
   
    
  
  }),
});

export const { useKycListQuery, useKycUpdateMutation, useGetkycDetailsQuery } =
  kycApiSlice;
