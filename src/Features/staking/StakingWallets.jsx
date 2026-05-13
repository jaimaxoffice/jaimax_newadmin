// pages/StakingWallets.jsx
import React, { useState, useRef, useMemo } from 'react';
import { useGetStakingWalletsQuery } from './stakingApiSlice';
import ReusableTable from '../../reusableComponents/Tables/Table';
import SearchBar from '../../reusableComponents/searchBar/SearchBar';
import { ChevronLeft, ChevronRight, Wallet, Coins, TrendingUp, Users, Eye, X, Calendar, Clock, TrendingDown } from 'lucide-react';
import { formatDateTime, formatDateWithAmPm } from '../../utils/dateUtils';
import Pagination from '../../reusableComponents/paginations/Pagination';
// Order Details Modal Component
// Order Details Modal Component with Theme
const OrderDetailsModal = ({ isOpen, onClose, orders, userName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" style={{ backgroundColor: '#282f35' }}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700" style={{ backgroundColor: '#1a1f26' }}>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: '#b9fd5c' }}>Order Details</h2>
            <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>{userName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} style={{ color: '#b9fd5c' }} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] sidebar-scroll" style={{ backgroundColor: '#282f35' }}>
          {!orders || orders.length === 0 ? (
            <div className="text-center py-8">
              <Wallet size={48} className="mx-auto mb-4" style={{ color: '#b9fd5c' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: '#b9fd5c' }}>No Active Orders</h3>
              <p style={{ color: '#9ca3af' }}>This user doesn't have any staking orders yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium" style={{ color: '#b9fd5c' }}>
                  {orders.length} Active Order{orders.length > 1 ? 's' : ''}
                </h3>
                <span className="text-sm" style={{ color: '#9ca3af' }}>
                  Total Investment: ₹{orders.reduce((sum, order) => sum + (order.investedAmount || 0), 0).toLocaleString()}
                </span>
              </div>

              {orders.map((order, index) => (
                <div key={order.orderId || index} className="border rounded-lg p-6" style={{ borderColor: '#3a4150', backgroundColor: '#1a1f26' }}>
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-md font-semibold" style={{ color: '#b9fd5c' }}>
                        Order #{index + 1}
                      </h4>
                      <p className="text-sm" style={{ color: '#9ca3af' }}>ID: {order.orderId}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'active' ? 'bg-green-900 text-green-300' :
                      order.status === 'completed' ? 'bg-blue-900 text-blue-300' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                    </span>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: '#282f35', borderColor: '#3a4150' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Coins size={16} style={{ color: '#b9fd5c' }} />
                        <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>Investment</span>
                      </div>
                      <p className="text-lg font-semibold" style={{ color: '#b9fd5c' }}>₹{order.investedAmount?.toLocaleString() || '0'}</p>
                      <p className="text-sm" style={{ color: '#9ca3af' }}>{order.tokens?.toLocaleString() || '0'} JMC</p>
                    </div>

                    <div className="p-4 rounded-lg border" style={{ backgroundColor: '#282f35', borderColor: '#3a4150' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} style={{ color: '#b9fd5c' }} />
                        <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>Daily Rewards</span>
                      </div>
                      <p className="text-lg font-semibold" style={{ color: '#b9fd5c' }}>{order.dailyDisbursementStakingTokens?.toFixed(2) || '0'} JMC</p>
                      <p className="text-sm" style={{ color: '#b9fd5c' }}>Ref: {order.dailyReferralStakingTokens?.toFixed(2) || '0'} JMC</p>
                    </div>

                    <div className="p-4 rounded-lg border" style={{ backgroundColor: '#282f35', borderColor: '#3a4150' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} style={{ color: '#b9fd5c' }} />
                        <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>Duration</span>
                      </div>
                      <p className="text-lg font-semibold" style={{ color: '#b9fd5c' }}>
                        Day {order.disbursedDays || 0}/{(order.disbursedDays || 0) + (order.remainingDays || 0)}
                      </p>
                      <p className="text-sm" style={{ color: '#9ca3af' }}>{order.remainingDays || 0} days remaining</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>Progress</span>
                      <span className="text-sm" style={{ color: '#b9fd5c' }}>{(order.progressPercent || 0)}%</span>
                    </div>
                    <div className="w-full rounded-full h-3" style={{ backgroundColor: '#3a4150' }}>
                      <div 
                        className="h-3 rounded-full transition-all duration-300"
                        style={{ width: `${order.progressPercent || 0}%`, backgroundColor: '#b9fd5c' }}
                      ></div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium" style={{ color: '#9ca3af' }}>Start Date:</span>
                      <p style={{ color: '#b9fd5c' }}>{order.startDate ? new Date(order.startDate).toLocaleDateString() : '-'}</p>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: '#9ca3af' }}>End Date:</span>
                      <p style={{ color: '#b9fd5c' }}>{order.endDate ? new Date(order.endDate).toLocaleDateString() : '-'}</p>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: '#9ca3af' }}>Created:</span>
                      <p style={{ color: '#b9fd5c' }}>{order.createdAt ? formatDateWithAmPm(order.createdAt) : '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        
      </div>
    </div>
  );
};



const StakingWallets = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedUserOrders, setSelectedUserOrders] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const searchTimeoutRef = useRef(null);

  const { 
    data, 
    isLoading, 
    error 
  } = useGetStakingWalletsQuery({
    username: search,
    stakingStatus: filters.stakingStatus,
    page,
    limit,
  });

  // Helper function to get the active order (first order or null)
  const getActiveOrder = (orders) => {
    return orders && orders.length > 0 ? orders[0] : null;
  };

  // Function to open modal with order details
  const openOrderModal = (orders, userName) => {
    setSelectedUserOrders(orders);
    setSelectedUserName(userName);
    setIsModalOpen(true);
  };

  // Function to close modal
  const closeOrderModal = () => {
    setIsModalOpen(false);
    setSelectedUserOrders(null);
    setSelectedUserName('');
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data?.data?.data) {
      return { total: 0, staked: 0, earnings: 0, active: 0 };
    }
    
    const wallets = data.data.data;
    return {
      total: data.data.pagination?.total || 0,
      staked: wallets.reduce((sum, item) => sum + (item.wallet?.stakedTokens || 0), 0),
      earnings: wallets.reduce((sum, item) => sum + (item.wallet?.netInterestEarned || 0), 0),
      active: wallets.reduce((sum, item) => sum + (item.orders?.filter(order => order.status === 'active').length || 0), 0)
    };
  }, [data]);

  // Add serial numbers
  const tableData = useMemo(() => {
    const wallets = data?.data?.data || [];
    return wallets.map((item, index) => ({
      ...item,
      serialNumber: (page - 1) * limit + index + 1,
      activeOrder: getActiveOrder(item.orders)
    }));
  }, [data, page, limit]);

  const columns = [
    {
      key: 'serialNumber',
      header: 'S/N',
      width: '60px',
      render: (row) => (
        <span className="text-gray-400 font-medium text-xs">
          {row.serialNumber}
        </span>
      ),
    },
    {
      key: 'user',
      header: 'User Details',
      render: (row) => (
        <div>
          <p className="font-semibold text-xs">{row.user?.username}</p>
          <p className="text-[10px]">{row.user?.name}</p>
          {/* <p className="text-xs text-gray-500">{row.user?.email}</p> */}
        </div>
      ),
    },
    {
      key: 'stakedTokens',
      header: 'Staked Tokens',
      render: (row) => (
        <div>
          <p className="font-semibold text-xs">
            {(row.wallet?.stakedTokens || 0).toLocaleString()} JMC
          </p>
         
        </div>
      ),
    },
   
    {
      key: 'earnings',
      header: 'Earnings',
      render: (row) => (
        <div>
          <p className="text-xs">
            {(row.wallet?.netInterestEarned || 0).toLocaleString()} JMC
          </p>
         
        </div>
      ),
    },
    {
      key: 'earnings',
      header: 'Referral Earnings',
      render: (row) => (
        <div>
           <p className="text-xs text-[#b9fd5c]">
            Ref: {(row.wallet?.totalReferralEarned || 0).toLocaleString()}
          </p>
         
        </div>
      ),
    },
    {
      key: 'totalSoldInP2P',
      header: 'Sold p2p',
      render: (row) => (
        <div>
           <p className="text-xs">
            {(row.wallet?.totalSoldInP2P || 0).toLocaleString()}
          </p>
         
        </div>
      ),
    },

    {
      key: 'status',
      header: 'Status & Progress',
      render: (row) => {
        const order = row.activeOrder;
        if (!order) {
          return (
            <div>
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                No Active Order
              </span>
            </div>
          );
        }

        const progress = order.progressPercent || 0;
        const status = order.status || 'unknown';
        
        return (
          <div>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
              status === 'active' ? 'bg-green-100 text-green-800' :
              status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-600'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {/* <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#b9fd5c] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div> */}
            {/* <p className="text-xs text-gray-500 mt-1">
              {progress.toFixed(1)}% Complete
            </p> */}
          </div>
        );
      },
    },
// In the columns definition, update the orderDetails column
{
  key: 'orderDetails',
  header: 'Order Details',
  render: (row) => {
    const hasOrders = row.orders && row.orders.length > 0;
    
    if (!hasOrders) {
      return (
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs" style={{ color: '#6b7280' }}>
            No Orders
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => openOrderModal(row.orders, `${row.user?.name} (${row.user?.username})`)}
          className="flex items-center gap-2 px-3 py-1 rounded-full transition-colors text-xs font-medium"
          style={{ backgroundColor: '#b9fd5c', color: '#282f35' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#a8e94a'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#b9fd5c'}
        >
          {/* <Eye size={14} /> */}
          View  ({row.orders.length})
        </button>
       
      </div>
    );
  },
},
    // {
    //   key: 'createdAt',
    //   header: 'Created',
    //   render: (row) => {
    //     const order = row.activeOrder;
    //     const createdAt = order?.createdAt || row.wallet?.createdAt;
        
    //     return (
    //       <div className="text-sm">
    //         <p className="text-xs">
    //           {createdAt ? formatDateWithAmPm(createdAt) : '-'}
    //         </p>
    //       </div>
    //     );
    //   },
    // },
  ];

  // Handle filter selection
  const handleFilterClick = (filterType) => {
    setActiveFilter(filterType);
    setPage(1);
    
    if (filterType === 'all') {
      setFilters({});
    } else {
      setFilters({ stakingStatus: filterType });
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
    <div className="p-2 min-h-screen">
      {/* Header with Separate Search */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Staking Wallets</h1>
        </div>
        <div className="w-full sm:w-96 ">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search by username..."
            showClearButton={search !== ''}
            onClear={clearSearch}
            value={search}
          />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden shadow-sm">
        <ReusableTable
          data={tableData}
          columns={columns}
          isLoading={isLoading || isSearching}
          error={error}
          showSearch={false}
          showPagination={false}
          emptyMessage="No wallets found matching your criteria"
        />
      </div>

      {/* Separate Pagination */}
      {paginationInfo && (
        <Pagination
          currentPage={page}
          totalPages={paginationInfo.totalPages}
          totalItems={paginationInfo.total}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={closeOrderModal}
        orders={selectedUserOrders}
        userName={selectedUserName}
      />
    </div>
  );
};

export default StakingWallets;