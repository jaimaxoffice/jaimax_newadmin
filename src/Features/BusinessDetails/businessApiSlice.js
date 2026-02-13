// businessDetailsApiSlice.js
import { apiSlice } from "../../api/jaimaxApiSlice";

export const businessDetailsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGradualLayerBonusLogs: builder.query({
      query: () => ({
        url: `/Admin/get-gradual-layer-bonus-logs`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetGradualLayerBonusLogsQuery,
} = businessDetailsApiSlice;
