import React, { useState } from "react";
import { useUsersummaryQuery } from "./usersApiSlice";
import { Search, RefreshCw } from "lucide-react";

function StatCard({ label, value }) {
  return (
    <div className="rounded-[8px] p-5 flex flex-col gap-1 bg-[#282f35] border border-[#3a4149]">
      <span className="text-xs font-semibold tracking-widest uppercase text-[#b9fd5c]">
        {label}
      </span>
      <span className="text-lg sm:text-2xl font-bold text-white">{value}</span>
    </div>
  );
}

function UserSummary() {
  const [inputValue, setInputValue] = useState("");
  const [username, setUsername] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");

  const { data, error, isLoading, isFetching, refetch } = useUsersummaryQuery(
    `username=${username}`,
    { skip: !username },
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim().toUpperCase();
    if (trimmed) {
      setUsername(trimmed);
      setActiveTab("Overview");
    }
  };

  const fmt = (n) =>
    typeof n === "number"
      ? n.toLocaleString("en-IN", { maximumFractionDigits: 2 })
      : (n ?? "—");
  const fmtDate = (d) =>
    d && d !== "N/A"
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";
  const fmtCur = (n) => `₹${fmt(n)}`;

  const user = data?.data?.reqUser;
  const wallet = data?.data?.walletTxs || [];
  const orders = data?.data?.userOrders || [];
  const invoices = data?.data?.totalInvoices || [];
  const bonus = data?.data?.detaildBonusGiven || {};
  const totalInvested = data?.data?.totalInvestedamount;
  const totalBonus = data?.data?.totalBonusGiven;
  const totalWithdrawn = data?.data?.userWithdraws || [];
  const tabs = [
    "Overview",
    "Transactions",
    "Orders",
    "Invoices",
    "Withdrawals",
  ];

  const showData = !isLoading && !error && username && !!data;

  return (
    <div className="min-h-screen font-mono bg-[#1a1f24] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[#1a1f24] border-b border-[#282f35]">
        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 flex-1 w-full"
        >
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9099]">
              <Search size={13} strokeWidth={2.5} />
            </span>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter username..."
              className="w-full pl-9 pr-4 py-2 rounded-[8px] text-xs font-mono tracking-wide outline-none transition-all
                   bg-[#282f35] border border-[#3a4149] text-white caret-[#b9fd5c]
                   focus:border-[#b9fd5c]"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest
                 transition-all hover:opacity-80 active:scale-95 flex-shrink-0
                 bg-[#b9fd5c] text-[#1a1f24]"
          >
            <Search size={12} strokeWidth={2.5} />
            <span>Search</span>
          </button>
        </form>

        {/* Refresh */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {isFetching && (
            <span className="text-xs animate-pulse text-[#b9fd5c]">
              Syncing...
            </span>
          )}

          {username && (
            <button
              onClick={refetch}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest
                   transition-all hover:opacity-80 active:scale-95
                   bg-[#282f35] text-white border border-[#3a4149]"
            >
              <RefreshCw
                size={12}
                strokeWidth={2.5}
                className={isFetching ? "animate-spin" : ""}
              />
              Refresh
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Empty State */}
        {!username && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 rounded-[8px] flex items-center justify-center bg-[#282f35] border border-[#3a4149]">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#b9fd5c"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <p className="text-sm tracking-widest uppercase text-[#8a9099]">
              Search a username to view summary
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 rounded-full border-2 animate-spin border-[#b9fd5c] border-t-transparent"></div>
            <span className="text-sm tracking-widest uppercase text-[#b9fd5c]">
              Loading...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-16 h-16 rounded-[8px] flex items-center justify-center bg-[#282f35] border border-[#3a4149]">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ff6b6b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-sm text-[#ff6b6b]">
              User not found or something went wrong.
            </p>
            <p className="text-xs text-[#8a9099]">
              Check the username and try again.
            </p>
          </div>
        )}

        {/* DATA */}
        {showData && (
          <>
            {/* User Profile Card */}

            <div className="rounded-[8px] p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center bg-[#282f35] border border-[#3a4149]">
              <div className="w-16 h-16 rounded-[8px] flex items-center justify-center text-2xl font-black flex-shrink-0 serialHeading bg-[#b9fd5c] text-[#1a1f24]">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate tableHead">
                  {user?.name}
                </h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span className="text-xs text-[#8a9099]">{user?.email}</span>
                  <span className="text-xs text-[#8a9099]">{user?.phone}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#1a1f24] text-[#b9fd5c]">
                    {user?.username}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-[#1a1f24] text-[#8a9099]">
                    Joined {fmtDate(user?.registeredDate)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-1 flex-shrink-0">
                <span className="text-xs uppercase tracking-widest tableHead text-[#b9fd5c]">
                  Tokens
                </span>
                <span className="text-2xl font-black">{fmt(user?.tokens)}</span>
                <span className="text-xs text-[#8a9099]">
                  Balance: {fmtCur(user?.Inr)}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#8a9099] text-center bg-[#282f35] border border-[#3a4149] rounded-[8px] px-4 py-2">
              <span className="text-[#ffff] font-bold">
                Total Earnings via JAIMAX
              </span>{" "}
              = Withdrawals + Orders bought from Available Balance + Transfers
              to Wallet + Current Remaining Available Balance + Bonus given by
              Admin
            </p>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 tableHead">
              <StatCard label="Total Invested" value={fmtCur(totalInvested)} />
              <StatCard label="Total Bonus" value={fmtCur(totalBonus)} />
              <StatCard
                label="Withdrawn"
                value={fmtCur(bonus.withDrawledAmount)}
              />
              <StatCard
                label="Available Balance"
                value={fmtCur(bonus.currentAvailableBalance)}
              />
            </div>

            {/* Bonus Breakdown */}
            <div className="rounded-[8px] p-6 tableHead bg-[#282f35] border border-[#3a4149]">
              <h2 className="text-xs font-bold tracking-widest uppercase mb-4 text-[#b9fd5c]">
                Bonus Breakdown
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: "Admin Given Bonus",
                    value: fmtCur(bonus.adminGivenBonus),
                  },
                  {
                    label: "Transferred to Wallet",
                    value: fmtCur(bonus.bonusTransferToWallet),
                  },
                  {
                    label: "Used for Buying Coins",
                    value: fmtCur(bonus.bonusUsedForBuyingCoins),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col gap-1 p-4 rounded-[8px] bg-[#1a1f24]"
                  >
                    <span className="text-xs text-[#8a9099]">{item.label}</span>
                    <span className="text-lg font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div>
              <div
                className="
    flex flex-wrap justify-center
    gap-2 p-2
    rounded-[30px] mb-6
    w-fit mx-auto
    tableHead bg-[#282f35]
  "
              >
                {tabs.map((tab) => {
                  const isActive = activeTab === tab;

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`
          px-3 sm:px-4
          py-1.5
          rounded-[30px]
          text-[10px] sm:text-xs
          font-bold tracking-widest
          transition-all duration-300 ease-in-out transform
          ${
            isActive
              ? "scale-105 shadow-md bg-[#b9fd5c] text-[#1a1f24]"
              : "text-[#8a9099] hover:text-white"
          }
        `}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Overview Tab */}
              {activeTab === "Overview" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Reference ID", value: user?.referenceId },
                    {
                      label: "Wallet Balance",
                      value: fmtCur(data?.data?.walletBalance),
                    },
                    { label: "Total Orders", value: orders.length },
                    { label: "Total Invoices", value: invoices.length },
                    { label: "Total Wallet Txns", value: wallet.length },
                    { label: "Active Date", value: fmtDate(user?.activeDate) },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[8px] p-5 flex flex-col gap-1 bg-[#282f35] border border-[#3a4149]"
                    >
                      <span className="text-xs tracking-widest uppercase text-[#8a9099]">
                        {item.label}
                      </span>
                      <span className="text-base font-bold break-all">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Transactions Tab */}
              {activeTab === "Transactions" && (
                <div className="flex flex-col gap-3">
                  {wallet.length === 0 && (
                    <p className="text-sm text-[#8a9099]">
                      No Transactions found.
                    </p>
                  )}
                  {wallet.map((tx) => (
                    <div
                      key={tx._id}
                      className="rounded-[8px] p-5 flex items-center justify-between gap-4 bg-[#282f35] border border-[#3a4149]"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-sm font-bold truncate">
                          {tx.name}
                        </span>
                        <span className="text-xs text-[#8a9099]">
                          TXN: {tx.transactionId}
                        </span>
                        <span className="text-xs text-[#8a9099]">
                          {fmtDate(tx.transactionDate)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-lg font-bold text-[#b9fd5c]">
                          {fmtCur(tx.transactionAmount)}
                        </span>
                        {tx.transactionFee === 0 && (
                          <span className="text-xs px-4 py-1 rounded-full bg-[#1a1f24] text-[#8a9099]">
                            No Fee
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "Orders" && (
                <div className="flex flex-col gap-3">
                  {orders.length === 0 && (
                    <p className="text-sm text-[#8a9099]">No orders found.</p>
                  )}
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="rounded-[8px] p-5 flex items-center justify-between gap-4 bg-[#282f35] border border-[#3a4149]"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#b9fd5c] text-[#1a1f24]">
                            Round {order.round}
                          </span>
                          <span className="text-xs text-[#8a9099]">
                            {order.currency}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-1">
                          <div>
                            <span className="text-xs block text-[#8a9099]">
                              Price INR
                            </span>
                            <span className="text-sm font-bold">
                              ₹{order.atPriceInr}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs block text-[#8a9099]">
                              Price USDT
                            </span>
                            <span className="text-sm font-bold">
                              ${order.atPriceUsdt}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-[#8a9099]">Amount</span>
                        <span className="text-lg font-bold">
                          {fmtCur(order.amount)}
                        </span>
                        <span className="text-xs text-[#b9fd5c]">
                          {fmt(order.jaimax)} JAIMAX
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Invoices Tab */}
              {activeTab === "Invoices" && (
                <div className="flex flex-col gap-3">
                  {invoices.length === 0 && (
                    <p className="text-sm text-[#8a9099]">No invoices found.</p>
                  )}
                  {invoices.map((inv) => (
                    <div
                      key={inv._id}
                      className="rounded-[8px] p-5 flex items-center justify-between gap-4 bg-[#282f35] border border-[#3a4149]"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold">
                          {inv.invoiceNo}
                        </span>
                        <span className="text-xs text-[#8a9099]">
                          {fmtDate(inv.orderDate)}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                              inv.status === "completed"
                                ? "bg-[#b9fd5c22] text-[#b9fd5c]"
                                : "bg-[#ff000022] text-[#ff6b6b]"
                            }`}
                          >
                            {inv.status}
                          </span>
                          <span className="text-xs text-[#8a9099]">
                            {fmt(inv.coins)} coins
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-lg font-bold">
                          {fmtCur(inv.amount)}
                        </span>
                        <a
                          href={inv.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-4 py-2 rounded-full font-bold tracking-wide transition-all hover:opacity-80 bg-[#b9fd5c] text-[#1a1f24]"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Withdrawals Tab */}
              {activeTab === "Withdrawals" && (
                <div className="flex flex-col gap-3">
                  {(!totalWithdrawn || totalWithdrawn?.length === 0) && (
                    <p className="text-sm text-[#8a9099]">
                      No withdrawals found.
                    </p>
                  )}
                  {totalWithdrawn?.map((wd) => (
                    <div
                      key={wd._id}
                      className="rounded-[8px] p-5 flex items-center justify-between gap-4 bg-[#282f35] border border-[#3a4149]"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-sm font-bold">{wd.currency}</span>
                        {wd.utr_number && (
                          <span className="text-xs text-[#8a9099]">
                            UTR: {wd.utr_number}
                          </span>
                        )}
                        <span className="text-xs text-[#8a9099]">
                          Charge: {fmtCur(wd.admin_inr_charges)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-lg font-bold text-[#b9fd5c]">
                          {fmtCur(wd.amount)}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1f24] text-[#8a9099]">
                          Net: {fmtCur(wd.amount - wd.admin_inr_charges)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserSummary;
