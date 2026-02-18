import { apiSlice } from "../../api/jaimaxApiSlice";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (queryParams) => ({
        url: `Admin/allUsers?${queryParams}`,
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
    sendTransaction: builder.mutation({
      query: (credentials) => ({
        url: "Admin/send_transaction_user",
        method: "POST",
        body: credentials,
      }),
    }),
    userData: builder.query({
      query: () => ({
        url: "/user/userDetails",
        method: "GET",
      }),
      providesTags: ["updateDetails"],
    }),
    updateAddress: builder.mutation({
      query: (credentials) => ({
        url: "/user/userUpdate",
        method: "PUT",
        body: credentials,
      }),
      invalidatesTags: ["updateDetails"],
    }),
    changePwd: builder.mutation({
      query: (credentials) => ({
        url: "/Auth/changePassword",
        method: "POST",
        body: credentials,
      }),
    }),
    changePwdReq: builder.mutation({
      query: (credentials) => ({
        url: "/Auth/changePasswordReq",
        method: "POST",
        body: credentials,
      }),
    }),
    verify: builder.mutation({
      query: (data) => ({
        url: "/Auth/isVerify",
        method: "POST",
        body: { ...data },
      }),
    }),
    usersummary: builder.query({
      query: (username) => ({
        url: `/Admin/user-summary?${username}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetUserQuery,
  useViewUserQuery,
  useBlockUserMutation,
  useSendTransactionMutation,
  useUserDataQuery,
  useUpdateAddressMutation,
  useChangePwdMutation,
  useChangePwdReqMutation,
  useVerifyMutation,
  useUsersummaryQuery,
} = userApiSlice;
