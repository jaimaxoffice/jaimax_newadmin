import { apiSlice } from "../../api/jaimaxApiSlice";

export const mediaSourceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET endpoint for mediaSourceAnalytics
    getMediaSourceAnalytics: builder.query({
      query: () => ({
        url: `/icoRound/getReferalsources`,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetMediaSourceAnalyticsQuery } = mediaSourceApiSlice;