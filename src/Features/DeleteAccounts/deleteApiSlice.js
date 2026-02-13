// deletedUsersApiSlice.js
import { apiSlice } from "../../api/jaimaxApiSlice";

export const deletedUsersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get list of deleted users
    getDeletedUsers: builder.query({
      query: () => ({
        url: `/Admin/get-deleted-accounts`,
        method: "GET",
      }),
      providesTags: ["DeletedUsers"],
    }),

    // Delete user endpoint (for reference)
    deleteUser: builder.mutation({
      query: (payload) => ({
        url: `/Admin/delete-user`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["DeletedUsers"], // This will refetch deleted users list after deletion
    }),
  }),
});

export const { useGetDeletedUsersQuery, useDeleteUserMutation } =
  deletedUsersApiSlice;
