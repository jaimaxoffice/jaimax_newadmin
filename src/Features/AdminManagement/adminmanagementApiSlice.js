// import { apiSlice } from "../../api/jaimaxApiSlice";

// export const adminApiSlice = apiSlice.injectEndpoints({
//   endpoints: (builder) => ({
//     getAdminUser: builder.query({
//       query: (queryParams) => ({
//         url: `Admin/get-admin-users?${queryParams}`,
//         method: "GET",
//       }),
//     }),
//     viewUser: builder.query({
//       query: (userId) => ({
//         url: `Admin/viewUser/${userId}`,
//         method: "GET",
//       }),
//     }),
//     blockUser: builder.mutation({
//       query: (credentials) => ({
//         url: "Admin/userBlock",
//         method: "POST",
//         body: credentials,
//       }),
//     }),
//     sendUser: builder.mutation({
//       query: (data) => ({
//         url: "Admin/create-admin-user",
//         method: "POST",
//         body: data,
//       }),
//     }),
//     editUser: builder.mutation({
//       query: (data) => ({
//         url: "Admin/edit-admin-user",
//         method: "POST",
//         body: data,
//       }),
//     }),
// })
// });
// export const {
//   useGetAdminUserQuery,
//   useViewUserQuery,
//   useBlockUserMutation,
//   useSendUserMutation,
//   useEditUserMutation,}=adminApiSlice;



import { apiSlice } from "../../api/jaimaxApiSlice";

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ LIST
    getAdminUser: builder.query({
      query: (queryParams = "") => ({
        url: `Admin/get-admin-users${queryParams ? `?${queryParams}` : ""}`,
        method: "GET",
      }),
      providesTags: (result) => {
        // adjust this list path if your response structure differs
        const list = result?.data || result?.data?.data || result?.users || [];
        return Array.isArray(list)
          ? [
              { type: "AdminUser", id: "LIST" },
              ...list.map((u) => ({ type: "AdminUser", id: u._id || u.id })),
            ]
          : [{ type: "AdminUser", id: "LIST" }];
      },
    }),

    // ✅ SINGLE
    viewUser: builder.query({
      query: (userId) => ({
        url: `Admin/viewUser/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [{ type: "AdminUser", id: userId }],
    }),

    // ✅ BLOCK/UNBLOCK
    blockUser: builder.mutation({
      query: (credentials) => ({
        url: "Admin/userBlock",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "AdminUser", id: "LIST" },
        ...(arg?.userId || arg?._id || arg?.id
          ? [{ type: "AdminUser", id: arg.userId || arg._id || arg.id }]
          : []),
      ],
    }),

    // ✅ CREATE
    sendUser: builder.mutation({
      query: (data) => ({
        url: "Admin/create-admin-user",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "AdminUser", id: "LIST" }],
    }),

    // ✅ EDIT
    editUser: builder.mutation({
      query: (data) => ({
        url: "Admin/edit-admin-user",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "AdminUser", id: "LIST" },
        ...(arg?._id || arg?.id ? [{ type: "AdminUser", id: arg._id || arg.id }] : []),
      ],
    }),
  }),
});

export const {
  useGetAdminUserQuery,
  useViewUserQuery,
  useBlockUserMutation,
  useSendUserMutation,
  useEditUserMutation,
} = adminApiSlice;