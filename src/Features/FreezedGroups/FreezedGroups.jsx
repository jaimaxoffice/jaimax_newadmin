// src/features/frezzedgroup/FrezzedGroupManagement.jsx
import React, { useState } from "react";
import Table from "../../reusableComponents/Tables/Table";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import Pagination from "../../reusableComponents/paginations/Pagination";
import {
  useGetFrezzedGroupsQuery,
  useAddFrezzedGroupMutation,
  useUpdateFrezzedGroupMutation,
  useAddUsersToGroupMutation,
} from "./freezedgroupsApiSlice";
import { toast } from "react-toastify";

const FrezzedGroupManagement = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editShow, setEditShow] = useState(false);
  const [addShow, setAddShow] = useState(false);
  const [addUsersShow, setAddUsersShow] = useState(false);
  const [formData, setFormData] = useState({
    affectedUsers: [""],
    affectedDate: "",
    keyPerson: "",
  });
  const [newUsers, setNewUsers] = useState([""]);

  const queryParams = `limit=${state.perPage}&page=${state.currentPage}&search=${state.search}`;
  const { data, isLoading, refetch } = useGetFrezzedGroupsQuery(queryParams);

  const [addFrezzedGroup] = useAddFrezzedGroupMutation();
  const [updateFrezzedGroup] = useUpdateFrezzedGroupMutation();
  const [addUsersToGroup] = useAddUsersToGroupMutation();

  const groups = data?.data?.data || [];
  const totalPages = data?.data?.total
    ? Math.ceil(data.data.total / state.perPage)
    : 1;

  // ─── Handlers ────────────────────────────────────────────────

  const handlePageChange = (page) =>
    setState({ ...state, currentPage: page });

  const handleFormChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUserChange = (index, value) => {
    const updated = [...formData.affectedUsers];
    updated[index] = value;
    setFormData({ ...formData, affectedUsers: updated });
  };

  const handleNewUserChange = (index, value) => {
    const updated = [...newUsers];
    updated[index] = value;
    setNewUsers(updated);
  };

  const addUserField = () =>
    setFormData({
      ...formData,
      affectedUsers: [...formData.affectedUsers, ""],
    });

  const addNewUserField = () => setNewUsers([...newUsers, ""]);

  const removeUserField = (index) => {
    const updated = formData.affectedUsers.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      affectedUsers: updated.length ? updated : [""],
    });
  };

  const removeNewUserField = (index) => {
    const updated = newUsers.filter((_, i) => i !== index);
    setNewUsers(updated.length ? updated : [""]);
  };

  const openAddModal = () => {
    setFormData({ affectedUsers: [""], affectedDate: "", keyPerson: "" });
    setAddShow(true);
  };

  const openEditModal = (group) => {
    setSelectedGroup(group);
    setFormData({
      affectedUsers: group.affectedUsers.length
        ? group.affectedUsers
        : [""],
      affectedDate: group.affectedDate,
      keyPerson: group.keyPerson,
    });
    setEditShow(true);
  };

  const openAddUsersModal = (group) => {
    setSelectedGroup(group);
    setNewUsers([""]);
    setAddUsersShow(true);
  };

  const handleAddGroup = async () => {
    const filtered = formData.affectedUsers.filter((u) => u.trim() !== "");
    try {
      await addFrezzedGroup({ ...formData, affectedUsers: filtered });
      toast.success("Group added successfully!", { position: "top-center" });
      setAddShow(false);
      refetch();
    } catch {
      toast.error("Failed to add group");
    }
  };

  const handleUpdate = async () => {
    const filtered = formData.affectedUsers.filter((u) => u.trim() !== "");
    try {
      await updateFrezzedGroup({
        id: selectedGroup._id,
        payload: { ...formData, affectedUsers: filtered },
      });
      toast.success("Group updated successfully!", { position: "top-center" });
      setEditShow(false);
      refetch();
    } catch {
      toast.error("Failed to update group");
    }
  };

  const handleAddUsersSubmit = async () => {
    const filtered = newUsers.filter((u) => u.trim() !== "");
    if (filtered.length) {
      try {
        await addUsersToGroup({ id: selectedGroup._id, users: filtered });
        toast.success("Users added successfully!", { position: "top-center" });
        setAddUsersShow(false);
        refetch();
      } catch {
        toast.error("Failed to add users");
      }
    }
  };

  let searchTimeout;
  const handleSearch = (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        search: e.target.value,
        currentPage: 1,
      }));
    }, 1000);
  };

  // ─── Table Columns ──────────────────────────────────────────

  const columns = [
    {
      header: "S.No",
      render: (_, index) => (
        <span
         
        >
          {(state.currentPage - 1) * state.perPage + index + 1}
        </span>
      ),
    },
    {
      header: "Key Person",
      render: (row) => (
        <div className="flex items-center gap-2">
          
          <span className="text-white font-semibold text-sm">
            {row.keyPerson}
          </span>
        </div>
      ),
    },
    {
      header: "Affected Users",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.affectedUsers.slice(0, 3).map((user, idx) => (
            <span
              key={idx}
              className=""
            >
              {user}
            </span>
          ))}
          {row.affectedUsers.length > 3 && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full
                         bg-[#eb660f] text-white"
            >
              +{row.affectedUsers.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Action",
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => openEditModal(row)}
            title="Edit Group"
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       bg-[#eb660f]/10 text-[#eb660f] hover:bg-[#eb660f]/20
                       transition-colors cursor-pointer"
          >
            <PencilIcon />
          </button>
          <button
            onClick={() => openAddUsersModal(row)}
            title="Add Users"
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       bg-[#eb660f]/10 text-[#eb660f] hover:bg-[#eb660f]/20
                       border border-[#eb660f]/20
                       transition-colors cursor-pointer"
          >
            <UserPlusIcon />
          </button>
        </div>
      ),
    },
  ];

  // ─── Mobile Card Builder ────────────────────────────────────

  const renderGroupCard = (row, index) => {
    const sNo = (state.currentPage - 1) * state.perPage + index + 1;

    return (
      <MobileCard
        key={row._id || index}
        header={{
          avatar: row.keyPerson?.charAt(0)?.toUpperCase() || "?",
          avatarBg: "bg-[#eb660f]/10 text-[#eb660f]",
          title: row.keyPerson,
          subtitle: `#${sNo}`,
          badge: `${row.affectedUsers.length} users`,
          badgeClass: "bg-[#eb660f]/10 text-[#eb660f]",
        }}
        rows={[
          {
            label: "Affected Users",
            custom: (
              <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                {row.affectedUsers.slice(0, 2).map((user, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full
                               bg-[#eb660f]/15 text-[#eb660f]"
                  >
                    {user}
                  </span>
                ))}
                {row.affectedUsers.length > 2 && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                               bg-[#eb660f] text-white"
                  >
                    +{row.affectedUsers.length - 2}
                  </span>
                )}
              </div>
            ),
          },
          {
            label: "Affected Date",
            value: row.affectedDate || "N/A",
          },
        ]}
        actions={[
          {
            label: "Edit",
            onClick: () => openEditModal(row),
            className: "text-[#eb660f] hover:bg-[#eb660f]/5",
          },
          {
            label: "Add Users",
            onClick: () => openAddUsersModal(row),
            className: "text-[#eb660f] hover:bg-[#eb660f]/5",
          },
        ]}
      />
    );
  };

  // ─── Render ─────────────────────────────────────────────────

  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Top Controls */}
        <div className="flex w-full">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto ml-auto">
            <select
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  perPage: Number(e.target.value),
                  currentPage: 1,
                }))
              }
              className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                          py-2.5 px-3 text-sm focus:outline-none focus:border-[#eb660f]
                          transition-colors cursor-pointer"
            >
              <option value="10">10</option>
              <option value="30">30</option>
              <option value="50">50</option>
            </select>

            <input
              type="text"
              autoComplete="off"
              placeholder="Search..."
              onChange={handleSearch}
              className="bg-[#111214] border border-[#2a2c2f] text-white placeholder-[#555]
                          rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#eb660f]
                          focus:ring-1 focus:ring-[#eb660f]/50 transition-colors w-full sm:w-44"
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl bg-[#eb660f]/10 flex items-center 
                              justify-center text-[#eb660f]"
                >
                  <GroupIcon />
                </div>
                <h1 className="text-lg font-semibold text-white">
                  Frezzed Groups
                </h1>
              </div>

              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                           bg-[#eb660f] text-white
                           hover:bg-[#ff8533] hover:shadow-lg hover:shadow-[#eb660f]/20
                           active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <PlusIcon />
                Add New
              </button>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
           
              <p className="text-[#8a8d93] text-sm">Loading groups...</p>
            </div>
          ) : groups.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <Table
                  columns={columns}
                  data={groups}
                  isLoading={isLoading}
                  currentPage={state.currentPage}
                  perPage={state.perPage}
                />
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                <MobileCardList
                  data={groups}
                  isLoading={isLoading}
                  renderCard={renderGroupCard}
                  emptyMessage="No groups found"
                />
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={state.currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* ─── Modals ──────────────────────────────────────────── */}

      {/* Add Group Modal */}
      <GroupFormModal
        isOpen={addShow}
        onClose={() => setAddShow(false)}
        title="Add New Group"
        titleIcon={<PlusCircleIcon />}
        formData={formData}
        onFormChange={handleFormChange}
        onUserChange={handleUserChange}
        onAddUser={addUserField}
        onRemoveUser={removeUserField}
        onSubmit={handleAddGroup}
        submitLabel="Add Group"
      />

      {/* Edit Group Modal */}
      <GroupFormModal
        isOpen={editShow}
        onClose={() => setEditShow(false)}
        title="Edit Group"
        titleIcon={<PencilIcon />}
        formData={formData}
        onFormChange={handleFormChange}
        onUserChange={handleUserChange}
        onAddUser={addUserField}
        onRemoveUser={removeUserField}
        onSubmit={handleUpdate}
        submitLabel="Update"
      />

      {/* Add Users to Group Modal */}
      <AddUsersModal
        isOpen={addUsersShow}
        onClose={() => setAddUsersShow(false)}
        groupName={selectedGroup?.keyPerson}
        users={newUsers}
        onUserChange={handleNewUserChange}
        onAddUser={addNewUserField}
        onRemoveUser={removeNewUserField}
        onSubmit={handleAddUsersSubmit}
      />
    </div>
  );
};

export default FrezzedGroupManagement;

// ─── Sub-Components ──────────────────────────────────────────────

/**
 * Empty State
 */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div className="w-16 h-16 rounded-full bg-[#2a2c2f] flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#555"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    </div>
    <p className="text-[#555] text-sm">No records found</p>
  </div>
);

/**
 * Group Form Modal (Add / Edit)
 */
const GroupFormModal = ({
  isOpen,
  onClose,
  title,
  titleIcon,
  formData,
  onFormChange,
  onUserChange,
  onAddUser,
  onRemoveUser,
  onSubmit,
  submitLabel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2c2f] bg-gradient-to-r from-[#eb660f] to-[#ff8533]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            {titleIcon}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
                       bg-white/10 text-white hover:bg-white/20
                       transition-colors cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#2a2c2f]">
          {/* Key Person */}
          <FormField label="Key Person" icon={<KeyPersonIcon />}>
            <input
              type="text"
              name="keyPerson"
              placeholder="Enter key person name"
              value={formData.keyPerson}
              onChange={onFormChange}
              className="w-full bg-[#111214] border border-[#2a2c2f] text-white text-sm
                         rounded-xl py-2.5 px-4 placeholder-[#555]
                         focus:outline-none focus:border-[#eb660f] focus:ring-1 focus:ring-[#eb660f]/50
                         transition-all duration-200 hover:border-[#3a3c3f]"
            />
          </FormField>

          {/* Affected Date */}
          <FormField label="Affected Date" icon={<CalendarIcon />}>
            <input
              type="date"
              name="affectedDate"
              value={formData.affectedDate}
              onChange={onFormChange}
              className="w-full bg-[#111214] border border-[#2a2c2f] text-white text-sm
                         rounded-xl py-2.5 px-4 placeholder-[#555]
                         focus:outline-none focus:border-[#eb660f] focus:ring-1 focus:ring-[#eb660f]/50
                         transition-all duration-200 hover:border-[#3a3c3f]
                         [color-scheme:dark]"
            />
          </FormField>

          {/* Affected Users */}
          <FormField label="Affected Users" icon={<GroupIcon />}>
            <DynamicUserInputs
              users={formData.affectedUsers}
              onChange={onUserChange}
              onAdd={onAddUser}
              onRemove={onRemoveUser}
            />
          </FormField>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2a2c2f] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium
                       bg-[#111214] border border-[#2a2c2f] text-[#8a8d93]
                       hover:text-white hover:border-[#3a3c3f]
                       transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                       bg-[#eb660f] text-white hover:bg-[#ff8533]
                       hover:shadow-lg hover:shadow-[#eb660f]/20
                       active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <CheckIcon />
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Add Users Modal
 */
const AddUsersModal = ({
  isOpen,
  onClose,
  groupName,
  users,
  onUserChange,
  onAddUser,
  onRemoveUser,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2c2f] bg-gradient-to-r from-[#eb660f] to-[#ff8533]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <UserPlusIcon />
            Add Users to Group
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
                       bg-white/10 text-white hover:bg-white/20
                       transition-colors cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#2a2c2f]">
          {/* Group Info */}
          <div className="bg-[#111214] border border-[#2a2c2f] rounded-xl p-3 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full bg-[#eb660f]/10 flex items-center 
                          justify-center text-[#eb660f] flex-shrink-0"
            >
              <KeyPersonIcon />
            </div>
            <div>
              <p className="text-[10px] text-[#8a8d93] uppercase tracking-wider m-0">
                Adding to
              </p>
              <p className="text-sm text-white font-semibold m-0">
                {groupName}
              </p>
            </div>
          </div>

          {/* New Users */}
          <FormField label="New Users" icon={<GroupIcon />}>
            <DynamicUserInputs
              users={users}
              onChange={onUserChange}
              onAdd={onAddUser}
              onRemove={onRemoveUser}
            />
          </FormField>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2a2c2f] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium
                       bg-[#111214] border border-[#2a2c2f] text-[#8a8d93]
                       hover:text-white hover:border-[#3a3c3f]
                       transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                       bg-[#eb660f] text-white hover:bg-[#ff8533]
                       hover:shadow-lg hover:shadow-[#eb660f]/20
                       active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <CheckIcon />
            Add Users
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Form Field Wrapper
 */
const FormField = ({ label, icon, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-xs font-medium text-[#8a8d93] uppercase tracking-wider">
      <span className="text-[#eb660f]">{icon}</span>
      {label}
    </label>
    {children}
  </div>
);

/**
 * Dynamic User Inputs (Add/Remove)
 */
const DynamicUserInputs = ({ users, onChange, onAdd, onRemove }) => (
  <div className="space-y-2">
    {users.map((user, index) => (
      <div key={index} className="flex items-center gap-2">
        <input
          type="text"
          placeholder={`Username ${index + 1}`}
          value={user}
          onChange={(e) => onChange(index, e.target.value)}
          className="flex-1 bg-[#111214] border border-[#2a2c2f] text-white text-sm
                     rounded-xl py-2.5 px-4 placeholder-[#555]
                     focus:outline-none focus:border-[#eb660f] focus:ring-1 focus:ring-[#eb660f]/50
                     transition-all duration-200 hover:border-[#3a3c3f]"
        />
        {users.length > 1 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl
                       border border-red-500/30 text-red-400 bg-transparent
                       hover:bg-red-500 hover:text-white hover:border-red-500
                       transition-all duration-200 cursor-pointer"
          >
            <MinusIcon />
          </button>
        )}
      </div>
    ))}

    {/* Add User Button */}
    <button
      type="button"
      onClick={onAdd}
      className="w-full py-2.5 rounded-xl text-sm font-medium
                 border border-dashed border-[#eb660f]/40 text-[#eb660f]
                 bg-[#eb660f]/5 hover:bg-[#eb660f]/10 hover:border-[#eb660f]
                 transition-all duration-200 cursor-pointer
                 flex items-center justify-center gap-2"
    >
      <PlusIcon />
      Add User
    </button>
  </div>
);

// ─── SVG Icons ───────────────────────────────────────────────────

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const UserPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const GroupIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const KeyPersonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);