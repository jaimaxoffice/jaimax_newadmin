import { apiSlice } from "../../api/jaimaxApiSlice";

export const frezzedGroupApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFrezzedGroups: builder.query({
      query: (queryParams = "") => ({
        url: `/frezzed-group/get-frezzed-group?${queryParams}`,
        method: "GET",
      }),
      providesTags: ["FrezzedGroup"],
    }),

    addFrezzedGroup: builder.mutation({
      query: (payload) => ({
        url: `/frezzed-group/frezzed-group-add`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["FrezzedGroup"],
    }),
    updateFrezzedGroup: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/frezzed-group/frezzed-group-update/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["FrezzedGroup"],
    }),
    addUsersToGroup: builder.mutation({
      query: ({ id, users }) => ({
        url: `/frezzed-group/frezzed-group-add-users/${id}`,
        method: "PUT",
        body: { affectedUsers: users },
      }),
      invalidatesTags: ["FrezzedGroup"],
    }),
  }),
});

export const {
  useGetFrezzedGroupsQuery,
  useAddFrezzedGroupMutation,
  useUpdateFrezzedGroupMutation,
  useAddUsersToGroupMutation,
} = frezzedGroupApiSlice;
