import { apiSlice } from "../../api/jaimaxApiSlice";

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUser: builder.query({
      query: (queryParams) => ({
        url: `Admin/get-admin-users?${queryParams}`,
        method: "GET",
      }),
    }),
    viewUser: builder.query({
      query: (userId) => ({
        url: `Admin/viewUser/${userId}`,
        method: "GET",
      }),
    }),
    blockUser: builder.mutation({
      query: (credentials) => ({
        url: "Admin/userBlock",
        method: "POST",
        body: credentials,
      }),
    }),
    sendUser: builder.mutation({
      query: (data) => ({
        url: "Admin/create-admin-user",
        method: "POST",
        body: data,
      }),
    }),
    editUser: builder.mutation({
      query: (data) => ({
        url: "Admin/edit-admin-user",
        method: "POST",
        body: data,
      }),
    }),
})
});
export const {
  useGetAdminUserQuery,
  useViewUserQuery,
  useBlockUserMutation,
  useSendUserMutation,
  useEditUserMutation,}=adminApiSlice;