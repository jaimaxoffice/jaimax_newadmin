import { apiSlice } from "../../api/jaimaxApiSlice";

export const adminP2PApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminP2PHistory: builder.query({
      query: ({
        page = 1,
        limit = 10,
        status,
        role,
        fromDate,
        toDate,
        username,
      } = {}) => {
        const params = new URLSearchParams();

        params.append("page", page);
        params.append("limit", limit);

        if (status) params.append("status", status);
        if (role) params.append("role", role);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        if (username) params.append("username", username);

        return {
          url: `/p2p/admin/p2p-history?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["AdminP2PHistory"],
    }),
  }),
});

export const { useGetAdminP2PHistoryQuery } = adminP2PApiSlice;