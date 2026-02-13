import { apiSlice } from "../../api/jaimaxApiSlice";

export const legalApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateLegal: builder.mutation({
      query: (queryParams) => {
        return {
          url: `/legal/legal_update`,
          method: "PUT",
          body: queryParams ,
        };
      },
    }),

    getLegal: builder.query({
      query: (queryParams) => {
        // console.log(" queryParams", queryParams);
        return {
          url: `/legal/get_legal`,
          method: "GET",
        };
      },
    }),
  }),
});

export const { useUpdateLegalMutation, useGetLegalQuery } = legalApiSlice;
