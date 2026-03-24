import { apiSlice } from "../../api/jaimaxApiSlice";
export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
  
    getGroups: builder.query({
      query: () => ({
        url: "/chat/getgroups",
        method: "GET",
      }),
      transformResponse: (response) => {
        return response?.data || [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((group) => ({ type: "Groups", id: group.groupId })),
              { type: "Groups", id: "LIST" },
            ]
          : [{ type: "Groups", id: "LIST" }],
    }),
  }),
});

export const {
  useGetGroupsQuery,
} = chatApiSlice;
