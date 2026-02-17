import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../reusableComponents/Loader/Loader"
import {
  Link,
  FileText,
  Video,
  CheckCircle,
  Calendar,
  Activity,
  Plus,
  Trash2,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  ExternalLink,
} from "lucide-react";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
import StatCard from "../../reusableComponents/StatCards/ZoomCards";
import {
  useCreateZoomMeetingMutation,
  useGetAllZoomMeetingsQuery,
  useUpdateZoomMeetingMutation,
  useDeleteZoomMeetingMutation,
} from "./zoomApiSlice";

const validationSchema = Yup.object({
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters"),
  subTitle: Yup.string()
    .required("Sub Title is required")
    .min(3, "Sub Title must be at least 3 characters"),
  url: Yup.string().required("URL is required").url("Please enter a valid URL"),
  videoId: Yup.string()
    .required("Video ID is required")
    .min(1, "Video ID cannot be empty"),
  type: Yup.string().required("Meeting type is required"),
});

const initialValues = {
  title: "",
  subTitle: "",
  url: "",
  videoId: "",
  type: "",
};

const inputClass = `w-full bg-[#111827] border border-[#303f50] text-white rounded-lg 
  px-4 py-2.5 text-sm focus:outline-none focus:border-[#eb660f] 
  focus:ring-1 focus:ring-[#eb660f]/50 transition-colors duration-200
  placeholder-gray-500 disabled:opacity-50`;

const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

const TYPE_COLORS = {
  "zoom meet": "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  youtube: "bg-red-500/20 text-red-400 border border-red-500/30",
  "google meet": "bg-green-500/20 text-green-400 border border-green-500/30",
  "social media":
    "bg-purple-500/20 text-purple-400 border border-purple-500/30",
};
function ZoomMeeting() {
  const [submittedMeeting, setSubmittedMeeting] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedType, setSelectedType] = useState("all");

  const {
    data: allMeetings,
    isLoading: loadingMeetings,
    refetch: refetchMeetings,
  } = useGetAllZoomMeetingsQuery({ page: currentPage, limit });

  const [createZoomMeeting, { isLoading: creatingMeeting }] =
    useCreateZoomMeetingMutation();
  const [updateZoomMeeting, { isLoading: updatingMeeting }] =
    useUpdateZoomMeetingMutation();
  const [deleteZoomMeeting, { isLoading: deletingMeeting }] =
    useDeleteZoomMeetingMutation();

  const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        url: values.url,
        title: values.title,
        videoId: values.videoId,
        subTitle: values.subTitle,
        type: values.type,
      };

      const result = await createZoomMeeting(payload).unwrap();

      if (result.success || result) {
        toast.success("Zoom meeting created successfully!", toastConfig);
        setSubmittedMeeting(values);
        resetForm();
        refetchMeetings();
      }
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to create Zoom meeting.",
        toastConfig,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMeeting = async (values, { setSubmitting }) => {
    try {
      const payload = {
        id: editingMeeting.id,
        url: values.url,
        title: values.title,
        videoId: values.videoId,
        subTitle: values.subTitle,
        type: values.type,
      };

      const result = await updateZoomMeeting(payload).unwrap();

      if (result.success || result) {
        toast.success("Zoom meeting updated successfully!", toastConfig);
        setShowEditModal(false);
        setEditingMeeting(null);
        refetchMeetings();
      }
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to update Zoom meeting.",
        toastConfig,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    try {
      const result = await deleteZoomMeeting(meetingId).unwrap();
      if (result.success || result) {
        toast.success("Zoom meeting deleted successfully!", toastConfig);
        refetchMeetings();
      }
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to delete Zoom meeting.",
        toastConfig,
      );
    }
  };

  const openEditModal = (meeting) => {
    setEditingMeeting({
      id: meeting._id,
      title: meeting.title,
      subTitle: meeting.subTitle,
      url: meeting.url,
      videoId: meeting.videoId,
      type: meeting.type || "",
    });
    setShowEditModal(true);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const filteredMeetings =
    allMeetings?.data?.videos?.filter((meeting) => {
      if (selectedType === "all") return true;
      return meeting.type === selectedType;
    }) || [];

  const pagination = allMeetings?.data?.pagination;

  const renderPaginationButtons = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const buttons = [];
    const maxButtons = 5;
    const total = pagination.totalPages;
    const current = pagination.currentPage;

    let start = Math.max(1, current - Math.floor(maxButtons / 2));
    let end = Math.min(total, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
            ${
              i === current
                ? "bg-[#eb660f] text-white shadow-lg shadow-[#eb660f]/25"
                : "bg-[#1b232d] text-gray-400 border border-[#303f50] hover:border-[#eb660f]/50 hover:text-white"
            }`}
        >
          {i}
        </button>,
      );
    }
    return buttons;
  };

  return (
    <div>
      <div className="min-h-screen p-4 sm:p-6 bg-[#0f172a]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#eb660f]/10 flex items-center justify-center">
              <Video size={24} className="text-[#eb660f]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Zoom Meeting Management
              </h1>
              <p className="text-sm text-gray-400">
                Create and manage your meetings efficiently
              </p>
            </div>
          </div>

          {/* Type Filter */}
          {/* <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className={inputClass + " w-auto"}
          >
            <option value="all">All Videos</option>
            <option value="zoom meet">Zoom Meetings</option>
            <option value="youtube">YouTube Videos</option>
            <option value="google meet">Google Meet</option>
          </select> */}
        </div>

        {/* Stats */}
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Meetings"
            value={pagination?.totalCount || 0}
            icon={Video}
            gradient={{ from: "#eb660f", to: "#d97706" }}
            isLoading={loadingMeetings}
          />
          <StatCard
            title="Active Meetings"
            value={allMeetings?.data?.videos?.length || 0}
            icon={CheckCircle}
            gradient={{ from: "#eb660f", to: "#d97706" }}
            isLoading={loadingMeetings}
          />
          <StatCard
            title="Total Pages"
            value={pagination?.totalPages || 1}
            icon={Activity}
            gradient={{ from: "#eb660f", to: "#d97706" }}
            isLoading={loadingMeetings}
          />
          <StatCard
            title="Current Page"
            value={pagination?.currentPage || 1}
            icon={Calendar}
            gradient={{ from: "#64748b", to: "#475569" }}
            isLoading={loadingMeetings}
          />
        </div>

        {/* Success Alert */}
        {submittedMeeting && (
          <div className="flex items-center gap-3 bg-[#eb660f]/10 border-l-4 border-[#eb660f] rounded-lg px-4 py-3 mb-6">
            <CheckCircle size={20} className="text-[#eb660f] shrink-0" />
            <p className="text-white text-sm">
              <span className="font-semibold">Meeting Created:</span>{" "}
              {submittedMeeting.title}
            </p>
            <button
              onClick={() => setSubmittedMeeting(null)}
              className="ml-auto text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Form Section */}
          <div className="xl:col-span-4">
            <div className="bg-[#1e293b] border border-[#303f50] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-full bg-[#eb660f] flex items-center justify-center">
                  <Plus size={22} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">
                    Create New Meeting
                  </h2>
                  <p className="text-gray-400 text-xs">
                    Fill in the details below
                  </p>
                </div>
              </div>

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, resetForm }) => (
                  <Form className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className={labelClass}>
                        Title <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="title"
                        placeholder="Enter meeting title"
                        className={inputClass}
                        disabled={creatingMeeting}
                      />
                      <ErrorMessage
                        name="title"
                        component="p"
                        className="text-red-400 text-xs mt-1"
                      />
                    </div>

                    {/* Sub Title */}
                    <div>
                      <label className={labelClass}>
                        Sub Title <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="subTitle"
                        placeholder="Enter sub title"
                        className={inputClass}
                        disabled={creatingMeeting}
                      />
                      <ErrorMessage
                        name="subTitle"
                        component="p"
                        className="text-red-400 text-xs mt-1"
                      />
                    </div>

                    {/* URL */}
                    <div>
                      <label className={labelClass}>
                        URL <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="url"
                        name="url"
                        placeholder="https://zoom.us/j/..."
                        className={inputClass}
                        disabled={creatingMeeting}
                      />
                      <ErrorMessage
                        name="url"
                        component="p"
                        className="text-red-400 text-xs mt-1"
                      />
                    </div>

                    {/* Video ID */}
                    <div>
                      <label className={labelClass}>
                        Video ID <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="videoId"
                        placeholder="Enter video ID"
                        className={inputClass}
                        disabled={creatingMeeting}
                      />
                      <ErrorMessage
                        name="videoId"
                        component="p"
                        className="text-red-400 text-xs mt-1"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className={labelClass}>
                        Meeting Type <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="select"
                        name="type"
                        className={inputClass}
                        disabled={creatingMeeting}
                      >
                        <option value="">Select meeting type</option>
                        <option value="zoom meet">Zoom Meet</option>
                        <option value="youtube">YouTube</option>
                        <option value="google meet">Google Meet</option>
                        <option value="social media">Social Media</option>
                      </Field>
                      <ErrorMessage
                        name="type"
                        component="p"
                        className="text-red-400 text-xs mt-1"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting || creatingMeeting}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#eb660f] hover:bg-[#d55a0e] 
                          text-white font-medium py-2.5 rounded-lg transition-all duration-200 
                          disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting || creatingMeeting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            Create Meeting
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => resetForm()}
                        disabled={isSubmitting || creatingMeeting}
                        className="px-4 py-2.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg 
                          transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>

          {/* Table Section */}
          <div className="xl:col-span-8">
            <div className=" rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-[#303f50]">
                <h2 className="text-white font-semibold">All Meetings</h2>
                <div className="flex items-center gap-3">
                  <PerPageSelector
                    value={limit}
                    options={[10, 20, 50, 100]}
                    onChange={handleLimitChange}
                  />
                </div>
              </div>

              {loadingMeetings ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader
                    size={40}
                    className="text-[#eb660f] animate-spin mb-3"
                  />
                  <p className="text-gray-400">Loading meetings...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#eb660f] border-b border-[#303f50]">
                        <th className="text-left text-xs font-semibold text-[#ffff] uppercase tracking-wider px-4 py-3">
                          S.No
                        </th>
                        <th className="text-left text-xs font-semibold text-[#ffff] uppercase tracking-wider px-4 py-3">
                          Title
                        </th>
                        <th className="text-left text-xs font-semibold text-[#ffff] uppercase tracking-wider px-4 py-3">
                          Sub Title
                        </th>
                        <th className="text-left text-xs font-semibold text-[#ffff] uppercase tracking-wider px-4 py-3">
                          Type
                        </th>
                        <th className="text-left text-xs font-semibold text-[#ffff] uppercase tracking-wider px-4 py-3">
                          Video ID
                        </th>
                        <th className="text-left text-xs font-semibold text-[#ffff] uppercase tracking-wider px-4 py-3">
                          URL
                        </th>
                        <th className="text-left text-xs font-semibold text-[#ffff] uppercase tracking-wider px-4 py-3">
                          Created
                        </th>
                        <th className="text-center text-xs font-semibold text-[#ffff] uppercase tracking-wider px-4 py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#303f50]/50">
                      {filteredMeetings.length > 0 ? (
                        filteredMeetings.map((meeting, i) => (
                          <tr
                            key={meeting._id}
                            className="hover:bg-[#252d38] transition-colors duration-150"
                          >
                            <td className="px-4 py-3 text-sm text-gray-400">
                              {(currentPage - 1) * limit + i + 1}
                            </td>
                            <td className="px-4 py-3 text-sm text-white font-medium max-w-[150px] truncate">
                              {meeting.title}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300 max-w-[150px] truncate">
                              {meeting.subTitle}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                                  ${TYPE_COLORS[meeting.type] || "bg-gray-500/20 text-gray-400 border border-gray-500/30"}`}
                              >
                                {meeting.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                              {meeting.videoId}
                            </td>
                            <td className="px-4 py-3">
                              <a
                                href={meeting.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#eb660f] hover:text-[#eb660f]/80 
                                  text-sm transition-colors"
                              >
                                <ExternalLink size={14} />
                                View
                              </a>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-400">
                              {new Date(meeting.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  title="Edit"
                                  onClick={() => openEditModal(meeting)}
                                  className="w-8 h-8 rounded-lg bg-[#eb660f]/10 text-[#eb660f] 
                                    hover:bg-[#eb660f]/20 flex items-center justify-center 
                                    transition-colors cursor-pointer"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  title="Delete"
                                  onClick={() =>
                                    handleDeleteMeeting(meeting._id)
                                  }
                                  disabled={deletingMeeting}
                                  className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 
                                    hover:bg-red-500/20 flex items-center justify-center 
                                    transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                  {deletingMeeting ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2 size={14} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 rounded-full bg-[#111827] flex items-center justify-center mb-3">
                                <Video size={28} className="text-gray-600" />
                              </div>
                              <p className="text-gray-400 font-medium">
                                No meetings found
                              </p>
                              <p className="text-gray-600 text-sm mt-1">
                                Create a new meeting to get started
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-[#303f50]">
                  <p className="text-sm text-gray-400">
                    Showing{" "}
                    <span className="text-white font-medium">
                      {(pagination.currentPage - 1) * limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="text-white font-medium">
                      {Math.min(
                        pagination.currentPage * limit,
                        pagination.totalCount,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="text-white font-medium">
                      {pagination.totalCount}
                    </span>{" "}
                    entries
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={!pagination.hasPrevPage || loadingMeetings}
                      className="w-9 h-9 rounded-lg bg-[#1b232d] border border-[#303f50] text-gray-400 
                        hover:border-[#eb660f]/50 hover:text-white flex items-center justify-center 
                        transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {renderPaginationButtons()}

                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={!pagination.hasNextPage || loadingMeetings}
                      className="w-9 h-9 rounded-lg bg-[#1b232d] border border-[#303f50] text-gray-400 
                        hover:border-[#eb660f]/50 hover:text-white flex items-center justify-center 
                        transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setShowEditModal(false);
              setEditingMeeting(null);
            }}
          />

          <div className="relative w-full max-w-2xl bg-[#1b232d] border border-[#303f50] rounded-xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#303f50]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#eb660f]/10 flex items-center justify-center">
                  <FileText size={20} className="text-[#eb660f]" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Edit Zoom Meeting
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingMeeting(null);
                }}
                className="w-9 h-9 rounded-lg bg-[#111827] text-gray-400 hover:text-white 
                  flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <Formik
                initialValues={{
                  title: editingMeeting.title || "",
                  subTitle: editingMeeting.subTitle || "",
                  url: editingMeeting.url || "",
                  videoId: editingMeeting.videoId || "",
                  type: editingMeeting.type || "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleUpdateMeeting}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Title */}
                      <div>
                        <label className={labelClass}>
                          Title <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="title"
                          className={inputClass}
                          disabled={updatingMeeting}
                        />
                        <ErrorMessage
                          name="title"
                          component="p"
                          className="text-red-400 text-xs mt-1"
                        />
                      </div>

                      {/* Sub Title */}
                      <div>
                        <label className={labelClass}>
                          Sub Title <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="subTitle"
                          className={inputClass}
                          disabled={updatingMeeting}
                        />
                        <ErrorMessage
                          name="subTitle"
                          component="p"
                          className="text-red-400 text-xs mt-1"
                        />
                      </div>
                    </div>

                    {/* URL */}
                    <div>
                      <label className={labelClass}>
                        URL <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="url"
                        name="url"
                        className={inputClass}
                        disabled={updatingMeeting}
                      />
                      <ErrorMessage
                        name="url"
                        component="p"
                        className="text-red-400 text-xs mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Video ID */}
                      <div>
                        <label className={labelClass}>
                          Video ID <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="videoId"
                          className={inputClass}
                          disabled={updatingMeeting}
                        />
                        <ErrorMessage
                          name="videoId"
                          component="p"
                          className="text-red-400 text-xs mt-1"
                        />
                      </div>

                      {/* Type */}
                      <div>
                        <label className={labelClass}>
                          Meeting Type <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="select"
                          name="type"
                          className={inputClass}
                          disabled={updatingMeeting}
                        >
                          <option value="">Select type</option>
                          <option value="zoom meet">Zoom Meet</option>
                          <option value="youtube">YouTube</option>
                          <option value="google meet">Google Meet</option>
                          <option value="social media">Social Media</option>
                        </Field>
                        <ErrorMessage
                          name="type"
                          component="p"
                          className="text-red-400 text-xs mt-1"
                        />
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#303f50]">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditModal(false);
                          setEditingMeeting(null);
                        }}
                        disabled={updatingMeeting}
                        className="px-5 py-2.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg 
                          transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || updatingMeeting}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#eb660f] hover:bg-[#d55a0e] 
                          text-white rounded-lg transition-all duration-200 
                          disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting || updatingMeeting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Update Meeting
                          </>
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ZoomMeeting;
