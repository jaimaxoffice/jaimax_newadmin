// src/features/admin/notVerifiedApiSlice.js
import { apiSlice } from "../../api/jaimaxApiSlice";

export const notVerifiedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET all not verified users
    getAllNotverifiedUsers: builder.query({
      query: () => ({
        url: `/Admin/not-verified-users`,
        method: 'GET',
      }),
      providesTags: ['NotVerifiedUsers'],
    }),

    // ✅ DELETE a not verified user by ID
    deleteNotVerifiedUser: builder.mutation({
      query: (id) => ({
        url: `/Admin/delete-not-verified-user/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NotVerifiedUsers'],
    }),
  }),
});

export const {
  useGetAllNotverifiedUsersQuery,
  useDeleteNotVerifiedUserMutation,
} = notVerifiedApiSlice;
