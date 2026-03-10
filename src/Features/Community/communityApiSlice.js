import { apiSlice } from "../../api/jaimaxApiSlice";
export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsersCommunity: builder.query({
      query: () => ({
        url: "/user/totalUsers",
        method: "GET",
      }),
      transformResponse: (response) => {
        return response;
      },

      providesTags: ["AllUsers"],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    getChatFiles: builder.query({
      query: ({ chatId, userId }) => {
        console.log(chatId, userId, "chatId, userId");
        return {
          url: `/chat/files?chatId=${chatId}`,
          method: "POST",
          body: { userId },
        };
      },
      transformResponse: (response) => {
        return response?.data || [];
      },
      providesTags: (result, error, { chatId }) => [
        { type: "ChatFiles", id: chatId },
      ],
    }),

    getChatHistory: builder.query({
      query: ({ chatId }) => ({
        url: `/chat/history?chatId=${chatId}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        console.log("💬 History Response:", response);
        return response?.data || [];
      },
      providesTags: (result, error, { chatId }) => [
        { type: "ChatHistory", id: chatId },
      ],
    }),

    getGroups: builder.query({
      query: () => ({
        url: "/chat/getgroups",
        method: "GET",
      }),
      transformResponse: (response) => {
        console.log("👥 Groups Response:", response);
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

    uploadFile: builder.mutation({
      query: (formData) => ({
        url: "/chat/fileupload",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response) => {
        console.log("📤 Upload Response:", response);
        return response?.data;
      },
      invalidatesTags: (result, error, formData) => {
        const chatId = formData.get("chatId");
        return [
          { type: "ChatFiles", id: chatId },
          { type: "Messages", id: chatId },
        ];
      },
    }),

    uploadAudio: builder.mutation({
      query: ({ audioBlob, chatId, senderId, senderName }) => {
        const formData = new FormData();
        const audioFile = new File([audioBlob], `audio_${Date.now()}.webm`, {
          type: "audio/webm",
        });
        formData.append("file", audioFile);
        formData.append("chatId", chatId);
        formData.append("senderId", senderId);
        formData.append("senderName", senderName);

        return {
          url: `/chat/fileupload`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response) => {
        console.log("🎤 Audio Upload Response:", response);
        return response?.data;
      },
      invalidatesTags: (result, error, { chatId }) => [
        { type: "ChatFiles", id: chatId },
        { type: "Messages", id: chatId },
      ],
    }),

    sendPublicKey: builder.mutation({
      query: ({ currentUser, publicKey, groupId }) => ({
        url: "/encrypt/savePublicKey",
        method: "POST",
        body: { currentUser, publicKey, groupId },
      }),
      transformResponse: (response) => {
        console.log("🔑 Public Key Response:", response);
        return response?.data;
      },
    }),

    getEncryptedGroupKey: builder.mutation({
      query: ({ username, groupId }) => ({
        url: "/encrypt/getEncryptedGroupKey",
        method: "POST",
        body: { username, groupId },
      }),
      transformResponse: (response) => {
        console.log("🔐 Encrypted Key Response:", response);
        return response.encryptedGroupKey;
      },
    }),

    reportMessage: builder.mutation({
      query: (reportData) => ({
        url: "/api/messages/report",
        method: "POST",
        body: reportData,
      }),
      transformResponse: (response) => {
        console.log("🚨 Report Response:", response);
        return response?.data;
      },
    }),
  }),
});

export const {
  useGetAllUsersCommunityQuery,
  //   useLazyGetUsersQuery,
  useGetChatFilesQuery,
  useGetChatHistoryQuery,
  useGetGroupsQuery,
  useUploadFileMutation,
  useUploadAudioMutation,
  useSendPublicKeyMutation,
  useGetEncryptedGroupKeyMutation,
  useReportMessageMutation,
} = chatApiSlice;
    