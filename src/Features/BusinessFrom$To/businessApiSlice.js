import { apiSlice } from "../../api/jaimaxApiSlice";

export const userBusinessRefsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserBusinessDirectRefs: builder.mutation({
      query: (username) => ({
        url: `/Admin/user-business-directrefs`,
        method: "POST",
        body: { username },
      }),
    }),
    getUserBusinessRefsExcluding: builder.mutation({
      query: ({
        username,
        excludedDirectRefs,
        excludedChainRefs,
        fromDate,
        toDate,
      }) => ({
        url: `/Admin/user-business-selected-dates-excluding-requested-directrefs`,
        method: "POST",
        body: {
          username,
          excludedDirectRefs,
          excludedChainRefs,
          fromDate,
          toDate,
        },
      }),
    }),
    // Mutation to get detailed report excluding direct and chain users
    getDetailedDirectChainUsersBusiness: builder.mutation({
      query: (payload) => ({
        url: `/Admin/get-detialed-direct-chain-users-business`,
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetUserBusinessDirectRefsMutation,
  useGetUserBusinessRefsExcludingMutation,
  useGetDetailedDirectChainUsersBusinessMutation,
} = userBusinessRefsApiSlice;
