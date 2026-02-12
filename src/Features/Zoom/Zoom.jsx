// src/features/zoom/ZoomMeeting.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  Video, CheckCircle, Activity, Calendar, Plus,
  Trash2, Pencil, ExternalLink, Loader,
} from "lucide-react";

import StatCard from "../../reusableComponents/StatCards/StatsCard";
import Table from "../../reusableComponents/Tables/Table";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import Pagination from "../../reusableComponents/paginations/Pagination";
import Modal from "../../reusableComponents/Modals/Modals";
import ConfirmModal from "../../reusableComponents/Modals/ConfirmModal";
import ZoomMeetingForm from "./ZoomMeetingForm";

import {
  useCreateZoomMeetingMutation,
  useGetAllZoomMeetingsQuery,
  useUpdateZoomMeetingMutation,
  useDeleteZoomMeetingMutation,
} from "./zoomApiSlice";

const TYPE_COLORS = {
  "zoom meet": "bg-blue-500/10 text-blue-400",
  "youtube": "bg-red-500/10 text-red-400",
  "google meet": "bg-green-500/10 text-green-400",
  "social media": "bg-purple-500/10 text-purple-400",
};

const TYPE_FILTER_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "zoom meet", label: "Zoom Meetings" },
  { value: "youtube", label: "YouTube" },
  { value: "google meet", label: "Google Meet" },
  { value: "social media", label: "Social Media" },
];

const ZoomMeeting = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 20,
  });
  const [selectedType, setSelectedType] = useState("all");
  const [modals, setModals] = useState({
    edit: false,
    delete: false,
    create: false,
  });
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // API
  const {
    data: allMeetings,
    isLoading: loadingMeetings,
    refetch: refetchMeetings,
  } = useGetAllZoomMeetingsQuery({ page: state.currentPage, limit: state.perPage });

  const [createZoomMeeting, { isLoading: creatingMeeting }] = useCreateZoomMeetingMutation();
  const [updateZoomMeeting, { isLoading: updatingMeeting }] = useUpdateZoomMeetingMutation();
  const [deleteZoomMeeting, { isLoading: deletingMeeting }] = useDeleteZoomMeetingMutation();

  const meetings = allMeetings?.data?.videos || [];
  const pagination = allMeetings?.data?.pagination;

  // Filter meetings
  const filteredMeetings = meetings.filter((m) => {
    if (selectedType === "all") return true;
    return m.type === selectedType;
  });

  // Handlers
  const handleCreate = async (values, { resetForm, setSubmitting }) => {
    try {
      const result = await createZoomMeeting({
        url: values.url,
        title: values.title,
        videoId: values.videoId,
        subTitle: values.subTitle,
        type: values.type,
      }).unwrap();

      if (result.success || result) {
        toast.success("Meeting created successfully!");
        resetForm();
        refetchMeetings();
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create meeting");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (values, { setSubmitting }) => {
    try {
      const result = await updateZoomMeeting({
        id: editingMeeting._id,
        ...values,
      }).unwrap();

      if (result.success || result) {
        toast.success("Meeting updated successfully!");
        setModals((prev) => ({ ...prev, edit: false }));
        setEditingMeeting(null);
        refetchMeetings();
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update meeting");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteZoomMeeting(deleteTarget._id).unwrap();
      toast.success("Meeting deleted successfully!");
      setModals((prev) => ({ ...prev, delete: false }));
      setDeleteTarget(null);
      refetchMeetings();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete meeting");
    }
  };

  const openEdit = (meeting) => {
    setEditingMeeting(meeting);
    setModals((prev) => ({ ...prev, edit: true }));
  };

  const openDelete = (meeting) => {
    setDeleteTarget(meeting);
    setModals((prev) => ({ ...prev, delete: true }));
  };

  const handlePageChange = (page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  // Action Buttons
  const MeetingActions = ({ meeting }) => (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => openEdit(meeting)}
        title="Edit"
        className="w-8 h-8 flex items-center justify-center rounded-lg
          bg-[#eb660f]/10 text-[#eb660f] hover:bg-[#eb660f]/20
          transition-colors cursor-pointer"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={() => openDelete(meeting)}
        title="Delete"
        disabled={deletingMeeting}
        className="w-8 h-8 flex items-center justify-center rounded-lg
          bg-red-500/10 text-red-400 hover:bg-red-500/20
          transition-colors cursor-pointer disabled:opacity-50"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  // Type Badge
  const TypeBadge = ({ type }) => (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[type] || "bg-[#2a2c2f] text-[#8a8d93]"}`}>
      {type || "N/A"}
    </span>
  );

  // Table Columns
  const columns = [
    {
      header: "S.No",
      render: (_, index, currentPage, perPage) =>
        currentPage * perPage - (perPage - 1) + index + ".",
    },
    { header: "Title", accessor: "title" },
    { header: "Sub Title", accessor: "subTitle" },
    {
      header: "Type",
      render: (row) => <TypeBadge type={row.type} />,
    },
    {
      header: "Video ID",
      render: (row) => (
        <span className="text-xs font-mono">{row.videoId}</span>
      ),
    },
    {
      header: "URL",
      render: (row) => (
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#eb660f] hover:text-[#ff7b1c] text-xs flex items-center gap-1
            transition-colors"
        >
          <ExternalLink size={12} />
          View Link
        </a>
      ),
    },
    {
      header: "Created",
      render: (row) => (
        <span className="text-xs">
          {new Date(row.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Action",
      render: (row) => <MeetingActions meeting={row} />,
    },
  ];

  // Mobile Card
  const renderMeetingCard = (row, index) => {
    const sNo = state.currentPage * state.perPage - (state.perPage - 1) + index;

    return (
      <MobileCard
        key={row._id || index}
        header={{
          avatar: row.title?.charAt(0)?.toUpperCase() || "M",
          avatarBg: "bg-[#eb660f]/10 text-[#eb660f]",
          title: row.title,
          subtitle: `#${sNo} • ${row.subTitle}`,
          badge: row.type,
          badgeClass: TYPE_COLORS[row.type] || "bg-[#2a2c2f] text-[#8a8d93]",
        }}
        rows={[
          { label: "Video ID", value: row.videoId },
          {
            label: "URL",
            custom: (
              <a
                href={row.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#eb660f] text-xs truncate max-w-[60%]"
              >
                {row.url}
              </a>
            ),
          },
          {
            label: "Created",
            value: new Date(row.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
          },
        ]}
        actions={[
          {
            label: "Edit",
            onClick: () => openEdit(row),
            className: "text-[#eb660f] hover:bg-[#eb660f]/5",
          },
          {
            label: "Delete",
            onClick: () => openDelete(row),
            className: "text-red-400 hover:bg-red-500/5",
          },
        ]}
      />
    );
  };

  return (
    <>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Video size={24} className="text-[#eb660f]" />
              Zoom Meeting Management
            </h2>
            <p className="text-[#8a8d93] text-sm mt-1">
              Create and manage your meetings efficiently
            </p>
          </div>
        </div>

        {/* Filters */}
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
                py-2.5 px-3 text-sm focus:outline-none focus:border-[#0ecb6f]
                transition-colors cursor-pointer"
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setState((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                py-2.5 px-3 text-sm focus:outline-none focus:border-[#eb660f]
                transition-colors cursor-pointer"
            >
              {TYPE_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Meetings"
            value={pagination?.totalCount || 0}
            valueClass="text-[#eb660f]"
          />
          <StatCard
            title="Active Meetings"
            value={meetings?.length || 0}
            valueClass="text-[#0ecb6f]"
          />
          <StatCard
            title="Total Pages"
            value={pagination?.totalPages || 1}
            valueClass="text-blue-400"
          />
          <StatCard
            title="Current Page"
            value={pagination?.currentPage || 1}
            valueClass="text-[#8a8d93]"
          />
        </div>

        {/* Main Content: Form + Table */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Create Form */}
          <div className="xl:col-span-4">
            <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl p-5 sticky top-4">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#eb660f] flex items-center justify-center">
                  <Plus size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">
                    Create New Meeting
                  </h3>
                  <p className="text-[#8a8d93] text-xs">
                    Fill in the details below
                  </p>
                </div>
              </div>

              <ZoomMeetingForm
                onSubmit={handleCreate}
                isProcessing={creatingMeeting}
                submitLabel="Create Meeting"
                processingLabel="Creating..."
                layout="single"
              />
            </div>
          </div>

          {/* Meetings Table */}
          <div className="xl:col-span-8">
            <div className="bg-[#1b232d] border border-[#1b232d] rounded-2xl overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-[#1b232d]">
                <h1 className="text-lg font-semibold text-white">
                  All Meetings
                </h1>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block">
                <Table
                  columns={columns}
                  data={filteredMeetings}
                  isLoading={loadingMeetings}
                  currentPage={state.currentPage}
                  perPage={state.perPage}
                />
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                <MobileCardList
                  data={filteredMeetings}
                  isLoading={loadingMeetings}
                  renderCard={renderMeetingCard}
                  emptyMessage="No meetings found"
                />
              </div>
            </div>

            {/* Pagination */}
            {filteredMeetings?.length > 0 && pagination && (
              <div className="mt-4">
                <Pagination
                  currentPage={state.currentPage}
                  totalPages={pagination.totalPages || 1}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={modals.edit}
        onClose={() => {
          setModals((prev) => ({ ...prev, edit: false }));
          setEditingMeeting(null);
        }}
        title="Edit Meeting"
        size="lg"
      >
        {editingMeeting && (
          <ZoomMeetingForm
            initialValues={{
              title: editingMeeting.title || "",
              subTitle: editingMeeting.subTitle || "",
              url: editingMeeting.url || "",
              videoId: editingMeeting.videoId || "",
              type: editingMeeting.type || "",
            }}
            onSubmit={handleUpdate}
            isProcessing={updatingMeeting}
            submitLabel="Update Meeting"
            processingLabel="Updating..."
            showCancel
            onCancel={() => {
              setModals((prev) => ({ ...prev, edit: false }));
              setEditingMeeting(null);
            }}
            layout="grid"
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        show={modals.delete}
        onClose={() => {
          setModals((prev) => ({ ...prev, delete: false }));
          setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Delete Meeting"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default ZoomMeeting;