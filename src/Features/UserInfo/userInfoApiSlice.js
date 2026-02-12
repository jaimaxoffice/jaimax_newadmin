import { apiSlice } from "../../api/jaimaxApiSlice";
export const userInfoApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserInfo: builder.query({
      query: (username) => ({
        url: `/Admin/userinfo`,
        method: "POST",
        body: { username },
      }),
      transformResponse: (response) => {
        return response;
      },
      transformErrorResponse: (response) => {
        return response;
      },
    }),
    updateUserInfo: builder.mutation({
      query: (userData) => {
        console.log('Sending update data:', userData);
        return {
          url: `/Admin/update-user-by-admin`,
          method: "POST",
          body: userData,
          timeout: 10000,
        };
      },
      validateStatus: (response) => {
        console.log('Response status:', response.status);
        return response.status >= 200 && response.status < 300;
      },
      transformResponse: (response) => {
        console.log('Transform response:', response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.log('Transform error response:', response);
        return {
          status: response.status,
          data: response.data,
          message: 'Failed to update user',
          originalError: response.error
        };
      },
    }),
  }),
});
export const { useGetUserInfoQuery, useUpdateUserInfoMutation } = userInfoApiSlice;