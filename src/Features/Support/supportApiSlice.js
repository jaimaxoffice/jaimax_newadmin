import { apiSlice } from "../../api/jaimaxApiSlice";

export const supportApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    SupportData: builder.query({
      query: (queryParams) => ({
        url: `/support/get_tickets_list?${queryParams}`,
        method: "GET",

      }),
      providesTags: ["getStatus"],

    }),
    CategoryGet: builder.query({
      query: (queryParams) => ({
        url: `/support/category_get`,
        method: "GET",
      }),
    }),
    createTicket: builder.mutation({
      query: (credentials) => ({
        url: "/support/create_ticket",
        method: "POST",
        body: credentials,
      }),
    }),
    ChatGet: builder.query({
      query: (queryParams) => ({
        url: `/support/comment_get/${queryParams}`,
        method: "GET",
      }),
      providesTags: ["getComment"],
    }),
    createComment: builder.mutation({
      query: (credentials) => ({
        url: "/support/comment_create",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["getComment"],
    }),
    editStatus: builder.mutation({
      query: (queryParams) => {
        // console.log("editStatus queryParams", queryParams); // Log the queryParams
        return {
          url: `/support/update_ticket/${queryParams?.id}`,
          method: "PUT",
          body: { status: queryParams?.status },
        };
        
      },
      invalidatesTags: ["getStatus"],
    }),
    
  }),
});

export const {
  useSupportDataQuery,
  useCategoryGetQuery,
  useCreateTicketMutation,
  useChatGetQuery,
  useCreateCommentMutation,
  useEditStatusMutation,
} = supportApiSlice;
