// src/features/accountant/Debits.jsx
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Pagination from "../../reusableComponents/paginations/Pagination";
import Modals from "../../reusableComponents/Modals/Modals";
import {
  useTransAmountUpdateMutation,
  useTransListQuery,
} from "../../Features/Wallet/walletApiSlice";
import  ClipLoader  from "../../reusableComponents/Loader/Loader";

// Custom Modal Component
const Modal = ({ show, onClose, title, children, footer }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-md mx-4 bg-gray-800 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <Icon icon="mdi:close" width="24" height="24" />
          </button>
        </div>
        {/* Body */}
        <div className="p-4">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="flex justify-center gap-3 p-4 border-t border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const Debits = () => {
  const [show, setShow] = useState(false);
  const [deleteModal1, setDeleteModal1] = useState(false);
  const [check, setCheck] = useState(false);
  const [id, setId] = useState("");
  const [status, setStatus] = useState("");
  const [editShow, setEditShow] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const handleClose = () => setEditShow(false);
  const handleEditShow = () => setEditShow(true);
  const [updateTransaction] = useTransAmountUpdateMutation();

  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
    fromDate: "",
    toDate: "",
  });

  // Build query params dynamically
  const queryParams = new URLSearchParams({
    limit: state.perPage,
    page: state.currentPage,
    search: state.search,
    transactionType: "Debit",
    fromDate: state.fromDate || "",
    toDate: state.toDate || "",
  }).toString();

  const { data, isLoading, refetch } = useTransListQuery(queryParams);
  const tableData = data;

  useEffect(() => {
    refetch();
  }, [state, refetch]);

  const handlePageChange = (page) => {
    setState({ ...state, currentPage: page });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheck = (id, status) => {
    setCheck(true);
    setId(id);
    setStatus(status);
  };

  const handleDelete = (id) => {
    setDeleteModal1(true);
    setId(id);
  };

  const handleEdit = (data) => {
    handleEditShow();
    setSelectedData(data);
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        transactionId: selectedData.transactionId,
        transactionAmount: parseFloat(selectedData.transactionAmount),
      };
      await updateTransaction(payload);
      handleClose();
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
  };

  const formatDateWithAmPm = (isoString) => {
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

  return (
    <div>
      <section className="profile_section">
        <div className="w-full pl-0">
          <div className="flex flex-wrap">
            <div className="w-full">
              <div className="my_total_team_data rounded-lg px-3 pb-0 py-4">
                {/* <h1 className="mb-3 text-white text-2xl font-bold">Debits</h1> */}

                {/* Status Counts Section */}
                {tableData?.data?.statusCounts && (
                  <div className="flex flex-wrap mb-4">
                    <div className="w-full">
                      <div className="flex flex-wrap mb-4 justify-center gap-4">
                        {/* Completed */}
                        <div className="w-full sm:w-1/2 md:w-1/3 px-2">
                          <div className="bg-[#282f35] bg-opacity-25 shadow rounded-lg">
                            <div className="text-center py-3 text-white">
                              <div className="flex items-center justify-center">
                                <Icon
                                  icon="material-symbols:check-circle"
                                  width="24"
                                  height="24"
                                  className="text-white mr-2"
                                />
                                <div>
                                  <h5 className="mb-0 font-bold text-white text-lg">
                                    {tableData.data.statusCounts.Completed}
                                  </h5>
                                  <small className="text-white text-sm">
                                    Completed
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Failed */}
                        <div className="w-full sm:w-1/2 md:w-1/3 px-2">
                          <div className="bg-[#282f35] bg-opacity-25 shadow rounded-lg">
                            <div className="text-center py-3 text-white">
                              <div className="flex items-center justify-center">
                                <Icon
                                  icon="material-symbols:cancel"
                                  width="24"
                                  height="24"
                                  className="text-white mr-2"
                                />
                                <div>
                                  <h5 className="mb-0 font-bold text-white text-lg">
                                    {tableData.data.statusCounts.Failed}
                                  </h5>
                                  <small className="text-white text-sm">
                                    Failed
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap justify-between mb-3 gap-3">
                  {/* Rows per page */}
                  <div className="w-full sm:w-auto">
                    <select
                      className="w-full sm:w-20 px-3 py-2 bg-transparent border border-gray-600 rounded text-white focus:outline-none focus:ring-0"
                      value={state.perPage}
                      onChange={(e) =>
                        setState({
                          ...state,
                          perPage: e.target.value,
                          currentPage: 1,
                        })
                      }
                    >
                      <option value="10" className="bg-gray-800">10</option>
                      <option value="30" className="bg-gray-800">30</option>
                      <option value="50" className="bg-gray-800">50</option>
                    </select>
                  </div>

                  {/* Date range - From */}
                  <div className="w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <label className="text-white whitespace-nowrap">From</label>
                      <input
                        type="date"
                        className="px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={state.fromDate}
                        onChange={(e) =>
                          setState({
                            ...state,
                            fromDate: e.target.value,
                            currentPage: 1,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Date range - To */}
                  <div className="w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <label className="text-white whitespace-nowrap">To</label>
                      <input
                        type="date"
                        className="px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={state.toDate}
                        onChange={(e) =>
                          setState({
                            ...state,
                            toDate: e.target.value,
                            currentPage: 1,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Search */}
                  <div className="w-full sm:w-auto flex-1 max-w-xs">
                    <div className="flex items-center bg-transparent border border-gray-600 rounded px-3">
                      <Icon
                        icon="tabler:search"
                        width="16"
                        height="16"
                        className="text-white"
                      />
                      <input
                        type="text"
                        placeholder="Search by name or email"
                        className="flex-1 px-2 py-2 bg-transparent border-0 text-white placeholder-gray-400 focus:outline-none focus:ring-0"
                        value={state.search}
                        onChange={(e) =>
                          setState({
                            ...state,
                            search: e.target.value,
                            currentPage: 1,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <ClipLoader
                        size={50}
                        color={"#123abc"}
                        loading={isLoading}
                      />
                    </div>
                  ) : (
                    <table className="w-full min-w-max sidebar-scroll text-xs">
                      <thead className="bg-[#b9fd5c] text-black">
                        <tr className="border-b border-gray-700">
                          <th className="px-4 py-3 text-left text-black font-semibold">S.No</th>
                          <th className="px-4 py-3 text-left text-black font-semibold">Name</th>
                          <th className="px-4 py-3 text-left text-black font-semibold">Payment Method</th>
                          <th className="px-4 py-3 text-left text-black font-semibold">Transaction Type</th>
                          <th className="px-4 py-3 text-left text-black font-semibold">Transaction Amount</th>
                          <th className="px-4 py-3 text-left text-black font-semibold">Transaction ID</th>
                          <th className="px-4 py-3 text-left text-black font-semibold">Transaction Date</th>
                          <th className="px-4 py-3 text-left text-black font-semibold">Updated By</th>
                          <th className="px-4 py-3 text-left text-black font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData?.data?.transactions?.length > 0 ? (
                          tableData.data.transactions.map((tx, i) => (
                            <tr
                              key={i}
                              className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                            >
                              <td className="px-4 py-3 text-white text-xs">
                                {state.currentPage * state.perPage -
                                  (state.perPage - 1) +
                                  i}
                              </td>
                              <td className="px-4 py-3 text-white text-xs">{tx.name}</td>
                              <td className="px-4 py-3 text-white text-xs">{tx.paymentMode}</td>
                              <td className="px-4 py-3 text-white text-xs">{tx.transactionType}</td>
                              <td className="px-4 py-3 text-white text-xs">
                                {tx.transactionAmount.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-white text-xs">
                                {tx.screenshotUrl ? (
                                  <a
                                    href={tx.screenshotUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 hover:underline"
                                  >
                                    {tx.transactionId}
                                  </a>
                                ) : (
                                  tx.transactionId
                                )}
                              </td>
                              <td className="px-4 py-3 text-white text-xs">
                                {formatDateWithAmPm(tx.transactionDate)}
                              </td>
                              <td className="px-4 py-3 text-white text-xs">
                                {tx.updatedBy?.name || "N/A"}
                              </td>
                              <td className="px-4 py-3 text-white text-xs">
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    tx.transactionStatus === "Completed"
                                      ? "bg-green-500/20 text-green-400"
                                      : tx.transactionStatus === "Failed"
                                      ? "bg-red-500/20 text-red-400"
                                      : tx.transactionStatus === "Hold"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-gray-500/20 text-gray-400"
                                  }`}
                                >
                                  {tx.transactionStatus}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="9"
                              className="px-4 py-8 text-center text-gray-400"
                            >
                              No debit transactions found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              <Pagination
                currentPage={state.currentPage}
                totalPages={
                  tableData
                    ? Math.ceil(tableData.data.total / state.perPage)
                    : 1
                }
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <Modals
        {...{
          show,
          setShow,
          deleteModal1,
          setDeleteModal1,
          check,
          setCheck,
          id,
          status,
        }}
      />

      {/* Edit Modal */}
      <Modal
        show={editShow}
        onClose={handleClose}
        title="Update Transaction"
        footer={
          <>
            <button
              className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
              onClick={handleUpdate}
            >
              Update
            </button>
          </>
        }
      >
        {selectedData ? (
          <form className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-transparent border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedData.name}
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Transaction Amount
              </label>
              <input
                type="text"
                name="transactionAmount"
                className="w-full px-3 py-2 bg-transparent border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedData.transactionAmount}
                onChange={handleEditChange}
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Transaction Id
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-transparent border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedData.transactionId}
                readOnly
              />
            </div>
          </form>
        ) : (
          <p className="text-gray-400">No data available.</p>
        )}
      </Modal>
    </div>
  );
};

export default Debits;