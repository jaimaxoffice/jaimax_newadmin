import { apiSlice } from "../../api/jaimaxApiSlice";

export const myTeamCompleteInfoApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        userCompleteInfo: builder.query({
            query: (username) => ({
                url: `/Admin/team-info`,
                method: 'GET',
                params: { username } 
            }),
        })
    })
})

export const { useUserCompleteInfoQuery, useLazyUserCompleteInfoQuery } = myTeamCompleteInfoApiSlice;