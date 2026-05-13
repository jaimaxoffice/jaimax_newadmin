import { apiSlice } from "../../api/jaimaxApiSlice";

export const stakingAdminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /admin/staking/wallets
    getStakingWallets: builder.query({
      query: ({ username, stakingStatus, page = 1, limit = 20 } = {}) => {
        const params = new URLSearchParams();
        
        if (username) params.append('username', username);
        if (stakingStatus) params.append('stakingStatus', stakingStatus);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        // params.append('search',search)

        return {
          url: `/staking-admin/wallets?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["stakingWallets"],
    }),

    // GET /admin/staking/logs
    getStakingLogs: builder.query({
      query: ({ 
        username, 
        rewardType, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 20 
      } = {}) => {
        const params = new URLSearchParams();
        
        if (username) params.append('username', username);
        if (rewardType) params.append('rewardType', rewardType);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        return {
          url: `/staking-admin/logs?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["stakingLogs"],
    }),


  }),
});

export const {
  useGetStakingWalletsQuery,
  useGetStakingLogsQuery,
} = stakingAdminApiSlice;