
import {apiSlice} from "../../api/jaimaxApiSlice";

export const dashboardApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDetails: builder.query({
            query: () => ({
                url: 'Admin/dashboard_details',
                method: 'GET', 
            })
        })
    })
})

export const {useGetDetailsQuery} = dashboardApiSlice;