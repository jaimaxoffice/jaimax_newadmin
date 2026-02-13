import { apiSlice } from "../../api/jaimaxApiSlice";


export const buyHistoryApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        buyHistory: builder.query({
            query: (queryParams) => ({
                url: `Admin/admin-buyhistory?${queryParams}`,
                method: 'GET', 
            })
        })
    })
})


export const { useBuyHistoryQuery } = buyHistoryApiSlice;

