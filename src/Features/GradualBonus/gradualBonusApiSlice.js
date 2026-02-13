// gradualLayerBonusLogsApiSlice.js
import { apiSlice } from "../../api/jaimaxApiSlice";

export const gradualLayerBonusLogsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGradualLayerBonusLogs: builder.query({
      query: (queryParams) => ({
        url: `Admin/get-gradual-layer-bonus-logs?${queryParams}`,
        method: "GET",
      }),
      providesTags: ["GradualLayerBonusLogs"],
    }),
  }),
});

export const {
  useGetGradualLayerBonusLogsQuery,
} = gradualLayerBonusLogsApiSlice;