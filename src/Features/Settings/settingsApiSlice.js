import { apiSlice } from "../../api/jaimaxApiSlice";

export const settingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    settingstData: builder.query({
      query: () => ({
        url: `/Admin/get_settings`,
        method: "GET",
      }),
      providesTags: ["getSettings"],

    }),
   
   
    
   
    editSettings: builder.mutation({
      query: (queryParams) => {
        // console.log("editStatus queryParams", queryParams); // Log the queryParams
        return {
          url: `/Admin/update_settings`,
          method: "PUT",
          body: queryParams,
        };
        
      },
      invalidatesTags: ["getSettings"],
    }),
    
  }),
});

export const {
  useSettingstDataQuery,
  useEditSettingsMutation,
} = settingsApiSlice;
