// src/features/users/UserManagement.jsx
import React, { useState, useEffect } from "react";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import Modal from "../../reusableComponents/Modals/Modals";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import ToggleSwitch from "../../reusableComponents/Switch/ToggleSwitch";
import ReadOnlyField from "../../reusableComponents/Inputs/ReadOnlyField";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import TransactionModal from "./TransactionModal";
import {
  useBlockUserMutation,
  useGetUserQuery,
  useSendTransactionMutation,
  useViewUserQuery,
} from "./usersApiSlice";
import { toast } from "react-toastify";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import {Eye ,Send } from "lucide-react";
const UserManagement = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
    selectedUserId: "",
    userStatus: {},
  });

  const [modals, setModals] = useState({
    viewUser: false,
    viewReferrer: false,
    transaction: false,
  });

  const [selectedWithdrawId, setSelectedWithdrawId] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const queryParams = `limit=${state.perPage}&page=${state.currentPage}&search=${state.search}`;
  const { data: getUser, isLoading, refetch } = useGetUserQuery(queryParams);
  const { data: viewUser, isLoading: isUserLoading } = useViewUserQuery(
    state.selectedUserId,
    { skip: !state.selectedUserId },
  );
  const [sendTransaction] = useSendTransactionMutation();
  const [blockUser] = useBlockUserMutation();

  const TableData = getUser?.data?.users || [];
  const totalMembers = getUser?.data?.pagination?.total || 0;
  const blockedUser = getUser?.data?.pagination?.blocked || 0;
  const activeMembers = getUser?.data?.pagination?.active || 0;

  let searchTimeout;
  const handleSearch = (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setState((prev) => ({ ...prev, search: e.target.value, currentPage: 1 }));
    }, 1000);
  };

  useEffect(() => {
    refetch();
    return () => clearTimeout(searchTimeout);
  }, []);

  useEffect(() => {
    if (refresh) {
      refetch();
      setRefresh(false);
    }
  }, [refresh, refetch]);

  const handlePageChange = (page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  const handleUserView = (userId, modalType) => {
    setState((prev) => ({ ...prev, selectedUserId: userId }));
    setModals((prev) => ({ ...prev, [modalType]: true }));
  };

  const handleToggleActive = async (userId, isBlock) => {
    try {
      const payload = { is_blocked: isBlock ? 0 : 1, user_id: userId };
      setState((prev) => ({
        ...prev,
        userStatus: { ...prev.userStatus, [userId]: !isBlock },
      }));
      const response = await blockUser(payload);
      toast.success(`${response?.data?.message}`, { position: "top-center" });
      setRefresh(true);
    } catch (error) {
      toast.error(`${error?.data?.message}`, { position: "top-center" });
    }
  };

  const handleTransactionSubmit = async (e, transactionType, amount) => {
    e.preventDefault();
    if (amount === "") {
      toast.error("Enter amount");
    } else if (amount < 1) {
      toast.error("Amount must be greater than 1");
    } else if (!/[0-9]/.test(amount)) {
      toast.error("Enter only numbers");
    } else {
      try {
        const res = await sendTransaction({
          amount,
          transaction_type: transactionType,
          user_id: selectedWithdrawId,
        });
        toast.success(res?.data?.message, { position: "top-center" });
        setModals((prev) => ({ ...prev, transaction: false }));
      } catch (error) {
        toast.error(`${error?.data?.message}`);
      }
    }
  };

  const formatDateWithAmPm = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    let hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const amAndPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}-${month}-${year} ${hours}:${minutes} ${amAndPm}`;
  };

  const getKycStatus = (status) => {
    const map = {
      open: "In Open",
      approve: "Approved",
      inprogress: "In Progress",
      reject: "Rejected",
    };
    return map[status] || "N/A";
  };

  const getCurrency = (countryCode, value) => {
    return countryCode === 91 ? `₹${value}` : `$${value}`;
  };

  // Desktop Table Columns
  const columns = [
    {
      header: "S.No",
      render: (_, index, currentPage, perPage) =>
        currentPage * perPage - (perPage - 1) + index + ".",
    },
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    {
      header: "Mobile Number",
      render: (row) => `+${row.countryCode} ${row.phone}`,
    },
    { header: "Referral Code", accessor: "username" },
    {
      header: "Available Balance",
      render: (row) => getCurrency(row.countryCode, row.Inr),
    },
    {
      header: "Withdrawal Amount",
      render: (row) => getCurrency(row.countryCode, row.totalWithdrawal),
    },
    {
      header: "Block/Unblock",
      render: (row) => (
        <ToggleSwitch
          checked={!row.isBlock}
          onChange={() => handleToggleActive(row._id, row.isBlock)}
        />
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${row.isActive ? "bg-[#0ecb6f]/10 text-[#0ecb6f]" : "bg-red-500/10 text-red-400"}`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "View User",
      render: (row) => (
        <button
          onClick={() => handleUserView(row._id, "viewUser")}
          className="text-[#ffffff] hover:text-[#0ecb6f]/80 text-xs font-medium  px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
         <Eye size={18}/>
        </button>
      ),
    },
    {
      header: "View Referrer",
      render: (row) => (
        <button
          onClick={() => handleUserView(row.referenceUserId, "viewReferrer")}
          className="text-white hover:text-blue-300 text-xs font-medium  px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <Eye size={18} />
        </button>
      ),
    },
    {
      header: "Action",
      render: (row) => (
        <button
          onClick={() => {
            if (!row.isBlock) {
              setSelectedWithdrawId(row._id);
              setModals((prev) => ({ ...prev, transaction: true }));
            }
          }}
          disabled={row.isBlock}
          className="text-orange-400 hover:text-orange-300 text-xs font-medium bg-orange-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send size={15} />
        </button>
      ),
    },
  ];

  // Mobile Card Builder
  const renderUserCard = (row, index) => {
    const sNo = state.currentPage * state.perPage - (state.perPage - 1) + index;

    return (
      <MobileCard
        key={row._id || index}
        header={{
          avatar: row.name?.charAt(0)?.toUpperCase(),
          title: row.name,
          subtitle: `#${sNo} • ${row.username}`,
          badge: row.isActive ? "Active" : "Inactive",
          badgeClass: row.isActive
            ? "bg-[#0ecb6f]/10 text-[#0ecb6f]"
            : "bg-red-500/10 text-red-400",
        }}
        rows={[
          { label: "Email", value: row.email },
          { label: "Mobile", value: `+${row.countryCode} ${row.phone}` },
          {
            label: "Balance",
            value: getCurrency(row.countryCode, row.Inr),
            highlight: true,
          },
          {
            label: "Withdrawal",
            value: getCurrency(row.countryCode, row.totalWithdrawal),
          },
          {
            label: "Block/Unblock",
            custom: (
              <ToggleSwitch
                checked={!row.isBlock}
                onChange={() => handleToggleActive(row._id, row.isBlock)}
              />
            ),
          },
        ]}
        actions={[
          {
            label: "View User",
            onClick: () => handleUserView(row._id, "viewUser"),
            className: "text-[#0ecb6f] hover:bg-[#0ecb6f]/5",
          },
          {
            label: "Referrer",
            onClick: () => handleUserView(row.referenceUserId, "viewReferrer"),
            className: "text-blue-400 hover:bg-blue-500/5",
          },
          {
            label: "Send",
            onClick: () => {
              setSelectedWithdrawId(row._id);
              setModals((prev) => ({ ...prev, transaction: true }));
            },
            disabled: row.isBlock,
            className: "text-orange-400 hover:bg-orange-500/5",
          },
        ]}
      />
    );
  };

  // Modal Fields
  const getUserFields = (data) => [
    { label: "Name", value: data?.name },
    { label: "User ID", value: data?.username },
    { label: "Email", value: data?.email },
    { label: "Phone", value: `+${data?.countryCode} ${data?.phone}` },
    {
      label: "Referral Amount",
      value: getCurrency(data?.countryCode, data?.referenceInr?.toFixed(2)),
    },
    { label: "Referrer ID", value: data?.referenceId },
    { label: "Tokens", value: data?.tokens },
    { label: "Referral Count", value: data?.referenceCount },
    { label: "Status", value: data?.isActive ? "Active" : "Inactive" },
    {
      label: "Created On",
      value: formatDateWithAmPm(data?.registeredDate || data?.createdAt),
    },
    {
      label: "Active On",
      value: data?.activeDate ? formatDateWithAmPm(data.activeDate) : "N/A",
    },
    {
      label: "Wallet Amount",
      value: getCurrency(data?.countryCode, data?.walletBalance?.toFixed(2)),
    },
    {
      label: "Verified",
      value: data?.isVerified ? "Verified" : "Not Verified",
    },
    { label: "KYC Status", value: getKycStatus(data?.kycStatus) },
  ];

  // Modal Content
  const ModalContent = ({ modalKey }) => (
    <>
      {state.selectedUserId && !isUserLoading && viewUser ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getUserFields(viewUser?.data).map((field, i) => (
              <ReadOnlyField key={i} label={field.label} value={field.value} />
            ))}
          </div>
          <div className="text-center mt-6">
            <button
              onClick={() =>
                setModals((prev) => ({ ...prev, [modalKey]: false }))
              }
              className="bg-[#2a2c2f] hover:bg-[#333] text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-[#2a2c2f] rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* <StatCard title="Total Members" value={totalMembers} />
          <StatCard title="Total Blocked" value={blockedUser} />
          <StatCard title="Total Active Members" value={activeMembers} /> */}

          <StatCard
            title="Total Members"
            value={totalMembers}
            image="/images/total-member.png"
          />
          <StatCard
            title="Total Blocked"
            value={blockedUser}
            image="/images/total-member.png"
          />
          <StatCard
            title="Total Active Members"
            value={activeMembers}
            image="/images/total-member.png"
          />
        </div>

        {/* Table + Cards */}
        <div className="bg-[#1b232d] border border-[#303f50] rounded-2xl overflow-hidden">
          {/* Search Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#1b232d]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             
              <div className="flex w-full">
                <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
                  <select
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        perPage: Number(e.target.value),
                        currentPage: 1,
                      }))
                    }
                    className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0ecb6f] transition-colors cursor-pointer"
                  >
                    <option value="10">10</option>
                    <option value="30">30</option>
                    <option value="50">50</option>
                  </select>
                  <SearchBar
                    onSearch={(e) => {
                      clearTimeout(window._searchTimeout);
                      window._searchTimeout = setTimeout(() => {
                        setState((prev) => ({
                          ...prev,
                          search: e.target.value,
                          currentPage: 1,
                        }));
                      }, 0);
                    }}
                    placeholder="Search..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="">
            <Table
              columns={columns}
              data={TableData}
              isLoading={isLoading}
              currentPage={state.currentPage}
              perPage={state.perPage}
            />
          </div>


        </div>

        {/* Pagination */}
        {TableData?.length > 0 && (
          <Pagination
            currentPage={state.currentPage}
            totalPages={Math.ceil(totalMembers / state.perPage) || 1}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={modals.viewUser}
        onClose={() => setModals((prev) => ({ ...prev, viewUser: false }))}
        title="User Details"
      >
        <ModalContent modalKey="viewUser" />
      </Modal>

      <Modal
        isOpen={modals.viewReferrer}
        onClose={() => setModals((prev) => ({ ...prev, viewReferrer: false }))}
        title="Referrer User Details"
      >
        <ModalContent modalKey="viewReferrer" />
      </Modal>

      <TransactionModal
        isOpen={modals.transaction}
        onClose={() => setModals((prev) => ({ ...prev, transaction: false }))}
        onSubmit={handleTransactionSubmit}
      />
    </>
  );
};

export default UserManagement;
