// teamInvestmentApiSlice.js
import { apiSlice } from "../../api/jaimaxApiSlice";

export const myTeamInvestmentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    userInvestments: builder.query({
      query: ({ username, fromDate, toDate }) => ({
        url: `/Admin/generate-team-investments`,
        method: "GET",
        params: {
          username,
          ...(fromDate && { fromDate }),
          ...(toDate && { toDate }),
        },
      }),
    }),
  }),
});

export const { useUserInvestmentsQuery, useLazyUserInvestmentsQuery } =
  myTeamInvestmentsApiSlice;