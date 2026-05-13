// import { apiSlice } from "../../api/jaimaxApiSlice";

// export const wpStakingApiSlice = apiSlice.injectEndpoints({
//     endpoints: (builder) => ({
//         getWpStakingWallets: builder.query({
//             query: ({
//                 page = 1,
//                 limit = 10,
//                 search = "",
//                 status = "",
//             } = {}) => ({
//                 url: `/admin/wp-staking-wallets`,
//                 method: "GET",
//                 params: { page, limit, search, status },
//             }),
//         }),

//     }),
//     overrideExisting: false,
// });

// export const { useGetWpStakingWalletsQuery } = wpStakingApiSlice;



import { apiSlice } from "../../api/jaimaxApiSlice";

export const wpStakingApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getWpStakingWallets: builder.query({
            query: ({
                page = 1,
                limit = 10,
                search = "",
                status = "",
            } = {}) => ({
                url: `/admin/wp-staking-wallets`,
                method: "GET",
                params: { page, limit, search, status },
            }),
        }),
        
        convertWpToNormalStaking: builder.mutation({
            query: (data) => ({
                url: `/admin/wp-to-nrmlstaking`,
                method: "POST",
                body: data,
            }),
        }),
    }),
    overrideExisting: false,
});

export const { 
    useGetWpStakingWalletsQuery,
    useConvertWpToNormalStakingMutation 
} = wpStakingApiSlice;