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
import Loader from "../../reusableComponents/Loader/Loader";
import {
  X,
  Pencil,
  UserPlus,
  Users,
  Plus,
  PlusCircle,
  Minus,
  Check,
  User,
  Calendar,
} from "lucide-react";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
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
            <Pencil size={14} />
          </button>
          <button
            onClick={() => openAddUsersModal(row)}
            title="Add Users"
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       bg-[#eb660f]/10 text-[#eb660f] hover:bg-[#eb660f]/20
                       border border-[#eb660f]/20
                       transition-colors cursor-pointer"
          >
            <UserPlus size={14} />
          </button>
        </div>
      ),
    },
  ];


  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Top Controls */}
        <div className="flex w-full">
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end">
<PerPageSelector
  options={[5, 15, 25, 50, 100]}
  onChange={(value) =>
    setState((prev) => ({
      ...prev,
      perPage: value,
      currentPage: 1,
    }))
  }
/>

      {/* Search */}
      <SearchBar
        onSearch={handleSearch}
        placeholder= "Search name, amount..."
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
                  <Users size={16}/>
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
                <Plus size={16} />
                Add New
              </button>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
           <Loader/>
          ) : groups.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="">
                <Table
                  columns={columns}
                  data={groups}
                  isLoading={isLoading}
                  currentPage={state.currentPage}
                  perPage={state.perPage}
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
        titleIcon={<PlusCircle size={18} />}
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
        titleIcon={<Pencil size={14} />}
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2c2f] bg-linear-to-r from-[#eb660f] to-[#ff8533]">
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
            <X />
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
          <FormField label="Affected Users" icon={<Users size={16}/>}>
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
            <UserPlus size={14} />
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
          <FormField label="New Users" icon={<Users size={16}/>}>
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
            <Minus size={14} />
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
      <Plus size={16} />
      Add User
    </button>
  </div>
);
