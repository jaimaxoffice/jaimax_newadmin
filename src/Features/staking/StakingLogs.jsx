// pages/StakingLogs.jsx
import React, { useState, useRef, useMemo } from 'react';
import { useGetStakingLogsQuery } from './stakingApiSlice';
import ReusableTable from '../../reusableComponents/Tables/Table';
import SearchBar from '../../reusableComponents/searchBar/SearchBar';
import { Activity, TrendingUp, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateWithAmPm } from "../../utils/dateUtils";
import Pagination from "../../reusableComponents/paginations/Pagination"
import Loader from '../../reusableComponents/Loader/Loader';

const StakingLogs = () => {
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [isSearching, setIsSearching] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [activeFilter, setActiveFilter] = useState('all');

    const searchTimeoutRef = useRef(null);

    const {
        data,
        isLoading,
        isFetching, // Add isFetching for pagination loading states
        error
    } = useGetStakingLogsQuery({
        username: search,
        rewardType: filters.rewardType,
        page,
        limit,
    });

    // Show loader on initial load, pagination change, or search
    const showLoader = isLoading || isFetching || isSearching;

    // Add serial numbers by index (1-10 on every page)
    const tableData = useMemo(() => {
        const logs = data?.data?.logs || [];
        return logs.map((log, index) => ({
            ...log,
            serialNumber: index + 1
        }));
    }, [data]);

    const columns = [
        {
            key: 'serialNumber',
            header: 'S/N',
            width: '60px',
            render: (row) => (
                <span className="text-gray-400 font-medium text-sm">
                    {row.serialNumber}
                </span>
            ),
        },
        {
            key: 'username',
            header: 'Username',
            render: (row) => (
                <div>
                    <p className="font-semibold text-white">{row.user?.username}</p>
                    <p className="text-[10px] text-gray-400">{row.user?.name}</p>
                </div>
            ),
        },
        {
            key: 'orderId',
            header: 'Order ID',
            render: (row) => (
                <span className="text-xs px-2 py-1 rounded  text-gray-300">
                    {row.orderId}
                </span>
            ),
        },
        {
            key: 'transactionId',
            header: 'Transaction ID',
            render: (row) => (
                <span className="font-mono text-xs text-gray-400">
                    {row.transactionId}
                </span>
            ),
        },
        {
            key: 'rewardType',
            header: 'Reward Type',
            render: (row) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${row.rewardType === 'staking_reward'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                    {row.rewardType?.replace('_', ' ')}
                </span>
            ),
        },
        {
            key: 'rewardTokens',
            header: 'Reward Tokens',
            render: (row) => (
                <span className="font-semibold text-white">
                    {row.rewardTokens?.toLocaleString()}
                </span>
            ),
        },
        {
            key: 'stakingDisbursementDay',
            header: 'Day',
            render: (row) => (
                <span className="px-2 py-1 rounded text-xs  text-gray-300">
                    Day {row.stakingDisbursementDay}
                </span>
            ),
        },
        {
            key: 'referralFromUsername',
            header: 'Referral From',
            render: (row) => (
                <span className="text-xs text-gray-400">
                    {row.referralFromUsername || '-'}
                </span>
            ),
        },
        {
            key: 'createdAt',
            header: 'Date & Time',
            render: (row) => (
                <div className="text-xs">
                    <p className="text-white">{formatDateWithAmPm(row.createdAt)}</p>
                </div>
            ),
        },
    ];

    // Handle filter selection
    const handleFilterClick = (filterType) => {
        setActiveFilter(filterType);
        setPage(1);

        if (filterType === 'all') {
            setFilters({});
        } else if (filterType === 'staking') {
            setFilters({ rewardType: 'staking_reward' });
        } else if (filterType === 'referral') {
            setFilters({ rewardType: 'referral_reward' });
        }
    };

    // Debounced search
    const handleSearch = (e) => {
        const value = e.target.value;
        setIsSearching(true);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setSearch(value);
            setPage(1);
            setIsSearching(false);
        }, 600);
    };

    const clearSearch = () => {
        setSearch('');
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const paginationInfo = data?.data?.pagination;

    return (
        <div className="p-6 min-h-screen bg-gray-900">
            {/* Header with Title and Right-Aligned Search */}
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Staking Logs</h1>
                    <p className="text-gray-400 text-sm mt-1">Track all staking and referral rewards</p>
                </div>
                <div className="w-80 flex-shrink-0">
                    <SearchBar
                        onSearch={handleSearch}
                        placeholder="Search username..."
                        showClearButton={search !== ''}
                        onClear={clearSearch}
                        value={search}
                    />
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 border border-gray-700 rounded-lg p-1 transition-all duration-300 ease-in-out">
                <button
                    onClick={() => handleFilterClick('all')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 ease-in-out ${activeFilter === 'all'
                            ? 'bg-[#b9fd5c] text-black rounded-[4px]'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                >
                    All Rewards
                </button>

                <button
                    onClick={() => handleFilterClick('staking')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 ease-in-out ${activeFilter === 'staking'
                            ? 'bg-[#b9fd5c] text-black rounded-[4px]'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                >
                    Staking Rewards
                </button>

                <button
                    onClick={() => handleFilterClick('referral')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 ease-in-out ${activeFilter === 'referral'
                            ? 'bg-[#b9fd5c] text-black rounded-[4px]'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                >
                    Referral Rewards
                </button>
            </div>

            {/* Table Section with Loader Overlay */}
            <div className="relative bg-gray-800/50 rounded-lg overflow-hidden min-h-[400px]">
                <ReusableTable
                    data={tableData}
                    columns={columns}
                    isLoading={false} // Disable internal loading since we use custom loader
                    error={error}
                    showSearch={false}
                    showPagination={false}
                    emptyMessage="No logs found matching your criteria"
                />
                
                {/* Loader Overlay - shows during pagination or search */}
                {showLoader && (
                    // <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10 transition-opacity duration-300">
                        <Loader />
                    // </div>
                )}
            </div>

            {/* Separate Pagination - disable buttons when loading */}
            {paginationInfo && (
                <Pagination
                    currentPage={page}
                    totalPages={paginationInfo.totalPages}
                    totalItems={paginationInfo.total}
                    itemsPerPage={limit}
                    onPageChange={handlePageChange}
                    isLoading={isFetching} // Pass loading state to disable buttons
                />
            )}
        </div>
    );
};

export default StakingLogs;