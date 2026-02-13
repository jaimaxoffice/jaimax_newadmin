import { apiSlice } from "../../api/jaimaxApiSlice";


export const availableBalanceApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        availableBalance: builder.query({
            query: (queryParams) => ({
                url: `Admin/users-available-balance?${queryParams}`,
                method: 'GET', 
            })
        })
    })
})


export const { useAvailableBalanceQuery } = availableBalanceApiSlice;

