// usdtBonusApiSlice.js
import { apiSlice } from "../../api/jaimaxApiSlice";

export const usdtBonusApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsdtBonusList: builder.query({
      query: ({ page = 1, limit = 10, username = "", type = "" }) => ({
        url: `withdraw/usdt-withdrawl-list`,
        method: "GET",
        params: { 
          page, 
          limit, 
          ...(username && { username }),  // Only include if exists
          ...(type && { type })            // Only include if exists
        },
      }),
    }),
  }),
});

export const { 
  useGetUsdtBonusListQuery,
  useLazyGetUsdtBonusListQuery 
} = usdtBonusApiSlice;