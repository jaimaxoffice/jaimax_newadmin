// src/features/blogSection/BlogEditor.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { format, parseISO } from "date-fns";
import Table from "../../reusableComponents/Tables/Table";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import Pagination from "../../reusableComponents/paginations/Pagination";
import Modal from "../../reusableComponents/Modals/Modals";
import ConfirmModal from "../../reusableComponents/Modals/ConfirmModal";
import {
  useCompareRevisionsQuery,
  useCreatePostMutation,
  useDeletePostMutation,
  useGetAvailableUsersQuery,
  useGetCategoriesQuery,
  useGetPostByIdQuery,
  useGetPostHistoryQuery,
  useGetPostsQuery,
  useGetRevisionByIdQuery,
  useGetTagsQuery,
  useGetTinyMCEKeyQuery,
  usePublishPostMutation,
  useRestoreRevisionMutation,
  useSchedulePostMutation,
  useUnpublishPostMutation,
  useUpdatePostMutation,
  useUploadImageMutation,
  useUploadMultipleImagesMutation,
} from "./blogsApiSlice";

const BlogEditor = () => {
  // ─── State ──────────────────────────────────────────────────
  const [activeView, setActiveView] = useState("posts");
  const [activePostId, setActivePostId] = useState(null);
  const [activeRevisionId, setActiveRevisionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [showSeoPreview, setShowSeoPreview] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const editorRef = useRef(null);

  const [selectedRevision, setSelectedRevision] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareRevisions, setCompareRevisions] = useState({
    source: null,
    target: null,
  });

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    categories: [],
    customCategory: "",
    tags: [],
    customTag: "",
    status: "draft",
    scheduledFor: "",
    author: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  // ─── API Queries ────────────────────────────────────────────

  const {
    data: postsData,
    isLoading: isLoadingPosts,
    isFetching: isFetchingPosts,
    isError,
    error,
    refetch,
  } = useGetPostsQuery({
    page,
    search: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 10,
  });

  const { data: activePost, isLoading: isLoadingPost } = useGetPostByIdQuery(
    activePostId,
    { skip: !activePostId }
  );

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: tagsData } = useGetTagsQuery();
  const { data: usersData } = useGetAvailableUsersQuery();
  const { data: editorConfigData } = useGetTinyMCEKeyQuery();

  const { data: historyData, isLoading: isLoadingHistory } =
    useGetPostHistoryQuery(undefined, { skip: activeView !== "history" });

  const { data: revisionData, isLoading: isLoadingRevision } =
    useGetRevisionByIdQuery(
      { postId: activePostId, revisionId: activeRevisionId },
      { skip: !activePostId || !activeRevisionId }
    );

  const { data: comparisonData, isLoading: isLoadingComparison } =
    useCompareRevisionsQuery(
      {
        postId: activePostId,
        sourceVersion: compareRevisions.source,
        targetVersion: compareRevisions.target,
      },
      {
        skip:
          !compareMode || !compareRevisions.source || !compareRevisions.target,
      }
    );

  // Mutations
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const [uploadMultipleImages] = useUploadMultipleImagesMutation();
  const [publishPost] = usePublishPostMutation();
  const [unpublishPost] = useUnpublishPostMutation();
  const [schedulePost] = useSchedulePostMutation();
  const [restoreRevision] = useRestoreRevisionMutation();

  // ─── Derived Data ───────────────────────────────────────────

  const { posts = [], pagination = {} } = postsData || {};
  const totalPages = pagination.totalPages || 1;

  const publishedCount = useMemo(
    () => posts.filter((p) => p.status === "published").length,
    [posts]
  );
  const draftCount = useMemo(
    () => posts.filter((p) => p.status === "draft").length,
    [posts]
  );
  const scheduledCount = useMemo(
    () => posts.filter((p) => p.status === "scheduled").length,
    [posts]
  );

  // TinyMCE Key
  let tinyMceApiKey = "";
  const origin = window.location.origin;
  if (origin && (origin.includes("5173") || origin.includes("5174"))) {
    tinyMceApiKey = import.meta.env.TINY_MCE_EDITOR_API_KEY;
  } else if (origin === "https://admin.jaimax.com") {
    tinyMceApiKey = import.meta.env.TINY_MCE_EDITOR_API_KEY_PROD;
  } else {
    tinyMceApiKey = import.meta.env.TINY_MCE_EDITOR_API_KEY;
  }

  // ─── Effects ────────────────────────────────────────────────

  useEffect(() => {
    if (activePost && activeView === "editor") {
      setFormData({
        title: activePost.title || "",
        excerpt: activePost.excerpt || "",
        content: activePost.content || "",
        id: activePost._id,
        coverImage: activePost.coverImage,
        imageUrl: activePost.imageUrl,
        ogImage: activePost.ogImage,
        featuredImage:
          activePost.coverImage ||
          activePost.ogImage ||
          activePost.imageUrl ||
          "",
        categories:
          activePost.categories
            ?.filter((c) => c !== null && c !== undefined)
            .map((c) => c._id || c.name || c) || [],
        tags:
          activePost.tags
            ?.filter((t) => t !== null && t !== undefined)
            .map((t) => t._id || t.name || t) || [],
        customCategory: "",
        customTag: "",
        status: activePost.status || "draft",
        scheduledFor: activePost.scheduledFor || "",
        author: activePost.author?._id || "",
        seoTitle: activePost.meta?.title || "",
        seoDescription: activePost.meta?.description || "",
        seoKeywords: activePost.meta?.keywords || activePost.seoKeywords || "",
      });

      if (activePost.scheduledFor) {
        const date = new Date(activePost.scheduledFor);
        setScheduleDate(format(date, "yyyy-MM-dd"));
        setScheduleTime(format(date, "HH:mm"));
      }
    }
  }, [activePost, activeView]);

  useEffect(() => {
    if (activeView === "editor" && !activePostId) {
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        featuredImage: "",
        categories: [],
        customCategory: "",
        tags: [],
        customTag: "",
        status: "draft",
        scheduledFor: "",
        author: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
      });
      setScheduleDate("");
      setScheduleTime("");
    }
  }, [activeView, activePostId]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // ─── Handlers ────────────────────────────────────────────────

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setIsSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
      setPage(1);
      setIsSearching(false);
    }, 600);
  }, []);

  const handleCreateNewPost = () => {
    setActivePostId(null);
    setActiveView("editor");
  };

  const handleEditPost = (id) => {
    setActivePostId(id);
    setActiveView("editor");
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId) {
      try {
        await deletePost(deleteConfirmId).unwrap();
        setShowDeleteModal(false);
        setDeleteConfirmId(null);
      } catch (error) {
        console.error("Failed to delete post:", error);
      }
    }
  };

  const handleViewHistory = (id) => {
    setActivePostId(id);
    setActiveView("history");
  };

  const handleRestoreRevision = async () => {
    if (activePostId && selectedRevision) {
      try {
        await restoreRevision({
          postId: activePostId,
          revisionId: selectedRevision._id,
        }).unwrap();
        setShowRestoreModal(false);
        setActiveView("editor");
      } catch (error) {
        console.error("Failed to restore revision:", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imageBase64 = await convertToBase64(file);
      const result = await uploadImage({ imageBase64 }).unwrap();
      setFormData((prev) => ({ ...prev, featuredImage: result.imageUrl }));
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  const handleEditorImageUpload = async (blobInfo) => {
    const file = blobInfo.blob();
    const imageBase64 = await convertToBase64(file);
    const result = await uploadImage({ imageBase64 }).unwrap();
    return result.imageUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageToSave = formData.featuredImage;
    if (formData.featuredImage && formData.featuredImage.includes("?")) {
      if (activePostId) imageToSave = undefined;
    }

    const payload = {
      ...formData,
      coverImage: imageToSave,
      categories: [
        ...(formData.categories || []),
        ...(formData.customCategory ? [formData.customCategory] : []),
      ],
      tags: [
        ...(formData.tags || []),
        ...(formData.customTag ? [formData.customTag] : []),
      ],
      meta: {
        ...(formData.meta || {}),
        ogImage: imageToSave,
        title: formData.seoTitle || formData.title || "",
        description: formData.seoDescription || formData.excerpt || "",
      },
    };

    try {
      if (activePostId) {
        await updatePost({ id: activePostId, ...payload }).unwrap();
      } else {
        const result = await createPost(payload).unwrap();
        setActivePostId(result._id);
      }
      setActiveView("posts");
    } catch (error) {
      console.error("Failed to save post:", error);
    }
  };

  const handlePublish = async () => {
    if (activePostId) {
      try {
        await publishPost(activePostId).unwrap();
        setActiveView("posts");
      } catch (error) {
        console.error("Failed to publish:", error);
      }
    }
  };

  const handleUnpublish = async () => {
    if (activePostId) {
      try {
        await unpublishPost(activePostId).unwrap();
        setActiveView("posts");
      } catch (error) {
        console.error("Failed to unpublish:", error);
      }
    }
  };

  const handleScheduleSubmit = async () => {
    if (activePostId && scheduleDate && scheduleTime) {
      try {
        const scheduledFor = `${scheduleDate}T${scheduleTime}:00`;
        await schedulePost({ id: activePostId, scheduledFor }).unwrap();
        setShowScheduleModal(false);
        setActiveView("posts");
      } catch (error) {
        console.error("Failed to schedule:", error);
      }
    }
  };

  const addCategory = () => {
    if (formData.customCategory.trim()) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, formData.customCategory.trim()],
        customCategory: "",
      }));
    }
  };

  const removeCategory = (index) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (formData.customTag.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, formData.customTag.trim()],
        customTag: "",
      }));
    }
  };

  const removeTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  // ─── Helpers ─────────────────────────────────────────────────

  const getStatusInfo = (status) => {
    switch (status) {
      case "published":
        return { label: "Published", class: "bg-[#0ecb6f]/10 text-[#0ecb6f]" };
      case "draft":
        return { label: "Draft", class: "bg-yellow-500/10 text-yellow-400" };
      case "scheduled":
        return { label: "Scheduled", class: "bg-blue-500/10 text-blue-400" };
      default:
        return { label: status, class: "bg-[#8a8d93]/10 text-[#8a8d93]" };
    }
  };

  const getSeoPreview = () => {
    const displayTitle =
      formData.seoTitle || formData.title || "Your Post Title";
    const displayDescription =
      formData.seoDescription ||
      formData.excerpt ||
      "Your post description will appear here.";
    const domain = window.location.hostname || "yourblog.com";
    return {
      title:
        displayTitle.length > 60
          ? displayTitle.substring(0, 57) + "..."
          : displayTitle,
      description:
        displayDescription.length > 160
          ? displayDescription.substring(0, 157) + "..."
          : displayDescription,
      url: `https://${domain}/${activePostId || "post-slug"}`,
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch {
      return "N/A";
    }
  };

  // ─── Error State ─────────────────────────────────────────────

  if (isError && activeView === "posts") {
    const errorMessage =
      error?.data?.message || "Something went wrong. Please try again.";

    return (
      <div className="p-2 sm:p-2 space-y-6">
        <div className="bg-[#282f35] border border-[#2a2c2f] rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#b9fd5c]/10 flex items-center justify-center text-[#b9fd5c]">
                  <BlogIcon />
                </div>
                <h1 className="text-lg font-semibold text-white">Blog Posts</h1>
              </div>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                           bg-[#b9fd5c] text-white hover:bg-[#ff8533] transition-all cursor-pointer"
              >
                <RefreshIcon />
                Refresh
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <AlertIcon />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">Error Loading Posts</h3>
            <p className="text-[#8a8d93] text-sm text-center max-w-md mb-6">{errorMessage}</p>
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#b9fd5c] text-white
                         hover:bg-[#ff8533] transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Posts List View ────────────────────────────────────────

  const renderPostsList = () => {
    const columns = [
      {
        header: "Title",
        render: (row) => (
          <div>
            <span className="text-white font-medium block">{row.title}</span>
            <span className="text-[#8a8d93] text-xs">
              {row.excerpt?.substring(0, 50)}...
            </span>
          </div>
        ),
      },
      {
        header: "Status",
        render: (row) => {
          const status = getStatusInfo(row.status);
          return (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.class}`}>
              {status.label}
              {row.status === "scheduled" && row.scheduledFor && (
                <span className="ml-1 text-[10px]">
                  {format(parseISO(row.scheduledFor), "MMM d")}
                </span>
              )}
            </span>
          );
        },
      },
      {
        header: "Author",
        render: (row) => (
          <span className="text-white text-sm">{row.author?.name || "Unknown"}</span>
        ),
      },
      {
        header: "Categories",
        render: (row) => (
          <div className="flex flex-wrap gap-1">
            {(row.categories || [])
              .filter((cat) => cat && cat._id)
              .slice(0, 2)
              .map((cat, i) => (
                <span
                  key={cat._id || i}
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                             bg-[#b9fd5c]/10 text-[#b9fd5c]"
                >
                  {cat?.name || "Unnamed"}
                </span>
              ))}
            {row.categories?.length > 2 && (
              <span className="text-[10px] text-[#8a8d93]">
                +{row.categories.length - 2}
              </span>
            )}
          </div>
        ),
      },
      {
        header: "Updated",
        render: (row) => (
          <span className="text-xs">{formatDate(row.updatedAt)}</span>
        ),
      },
      {
        header: "SEO",
        render: (row) => (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              row.seoTitle && row.seoDescription
                ? "bg-[#0ecb6f]/10 text-[#0ecb6f]"
                : "bg-[#8a8d93]/10 text-[#8a8d93]"
            }`}
          >
            {row.seoTitle && row.seoDescription ? "✓ Optimized" : "Not Set"}
          </span>
        ),
      },
      {
        header: "Actions",
        render: (row) => (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleEditPost(row._id)}
              className="p-1.5 rounded-lg bg-[#b9fd5c]/10 text-[#b9fd5c]
                         hover:bg-[#b9fd5c]/20 transition-all cursor-pointer"
              title="Edit"
            >
              <EditIcon />
            </button>
            <button
              onClick={() => handleViewHistory(row._id)}
              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400
                         hover:bg-blue-500/20 transition-all cursor-pointer"
              title="History"
            >
              <HistoryIcon />
            </button>
            <button
              onClick={() => handleDeleteClick(row._id)}
              className="p-1.5 rounded-lg bg-red-500/10 text-red-400
                         hover:bg-red-500/20 transition-all cursor-pointer"
              title="Delete"
            >
              <TrashIcon />
            </button>
          </div>
        ),
      },
    ];

    const renderPostCard = (row, index) => {
      const status = getStatusInfo(row.status);
      return (
        <MobileCard
          key={row._id || index}
          header={{
            avatar: (row.title?.charAt(0) || "?").toUpperCase(),
            avatarBg: "bg-[#b9fd5c]/10 text-[#b9fd5c]",
            title: row.title || "Untitled",
            subtitle: `${row.author?.name || "Unknown"} • ${formatDate(row.updatedAt)}`,
            badge: status.label,
            badgeClass: status.class,
          }}
          rows={[
            {
              label: "Excerpt",
              value: row.excerpt?.substring(0, 60) + "..." || "N/A",
            },
            {
              label: "Categories",
              custom: (
                <div className="flex flex-wrap gap-1">
                  {(row.categories || [])
                    .filter((c) => c?.name)
                    .slice(0, 2)
                    .map((cat, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                                   bg-[#b9fd5c]/10 text-[#b9fd5c]"
                      >
                        {cat.name}
                      </span>
                    ))}
                </div>
              ),
            },
            {
              label: "SEO",
              custom: (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    row.seoTitle && row.seoDescription
                      ? "bg-[#0ecb6f]/10 text-[#0ecb6f]"
                      : "bg-[#8a8d93]/10 text-[#8a8d93]"
                  }`}
                >
                  {row.seoTitle && row.seoDescription ? "Optimized" : "Not Set"}
                </span>
              ),
            },
          ]}
          footer={
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEditPost(row._id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
                           text-xs font-semibold bg-[#b9fd5c]/10 text-[#b9fd5c]
                           border border-[#b9fd5c]/20 hover:bg-[#b9fd5c]/20 transition-all cursor-pointer"
              >
                <EditIcon />
                Edit
              </button>
              <button
                onClick={() => handleViewHistory(row._id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
                           text-xs font-semibold bg-blue-500/10 text-blue-400
                           border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer"
              >
                <HistoryIcon />
                History
              </button>
              <button
                onClick={() => handleDeleteClick(row._id)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400
                           border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                <TrashIcon />
              </button>
            </div>
          }
        />
      );
    };

    return (
      <div className="space-y-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                         py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c]
                         transition-colors cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                autoComplete="off"
                placeholder={isSearching ? "Searching..." : "Search posts..."}
                onChange={handleSearch}
                className="bg-[#111214] border border-[#2a2c2f] text-white placeholder-[#555]
                           rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#b9fd5c]
                           focus:ring-1 focus:ring-[#b9fd5c]/50 transition-colors w-full sm:w-56"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]">
                <SearchIcon className={isSearching ? "animate-spin" : ""} />
              </div>
            </div>

            {statusFilter !== "all" || searchTerm ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPage(1);
                }}
                className="px-3 py-2.5 rounded-xl text-xs font-medium bg-[#111214]
                           border border-[#2a2c2f] text-[#8a8d93] hover:text-white
                           hover:border-[#3a3c3f] transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            ) : null}
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateNewPost}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                       bg-[#b9fd5c] text-white hover:bg-[#ff8533] transition-all cursor-pointer"
          >
            <PlusIcon />
            Create New Post
          </button>
        </div>



        {/* Fetching indicator */}
        {isFetchingPosts && !isLoadingPosts && (
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="w-4 h-4 border-2 border-[#b9fd5c] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#8a8d93] text-sm">Loading...</span>
          </div>
        )}

        {/* Main Table Card */}
        <div className="bg-[#282f35] border border-[#2a2c2f]rounded-lg  overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#b9fd5c]/10 flex items-center justify-center text-[#b9fd5c]">
                  <BlogIcon />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">Blog Posts</h1>
                  <p className="text-xs text-[#8a8d93] mt-0.5">
                    Showing {pagination.count || 0} of {pagination.total || 0} posts
                    {searchTerm && (
                      <span className="text-[#b9fd5c]"> for "{searchTerm}"</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => refetch()}
                disabled={isFetchingPosts}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                           bg-[#b9fd5c] text-white hover:bg-[#ff8533] transition-all cursor-pointer
                           disabled:opacity-50"
              >
             
                Refresh
              </button>
            </div>
          </div>

          <div className="rounded-lg ">
            <Table
              columns={columns}
              data={posts}
              isLoading={isLoadingPosts}
              currentPage={page}
              perPage={10}
            />
          </div>


        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    );
  };

  // ─── Post Editor View ──────────────────────────────────────

  const renderPostEditor = () => {
    const isEditMode = !!activePostId;
    const seoPreview = getSeoPreview();

    if (isLoadingPost && isEditMode) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#b9fd5c] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView("posts")}
              className="p-2 rounded-xl bg-[#111214] border border-[#2a2c2f] text-[#8a8d93]
                         hover:text-white hover:border-[#3a3c3f] transition-colors cursor-pointer"
            >
              <BackIcon />
            </button>
            <h1 className="text-xl font-semibold text-white">
              {isEditMode ? "Edit Post" : "Create New Post"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isEditMode && (
              <>
                {formData.status === "published" ? (
                  <button
                    onClick={handleUnpublish}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-yellow-500/10
                               text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20
                               transition-all cursor-pointer"
                  >
                    Unpublish
                  </button>
                ) : (
                  <button
                    onClick={handlePublish}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-[#0ecb6f]/10
                               text-[#0ecb6f] border border-[#0ecb6f]/20 hover:bg-[#0ecb6f]/20
                               transition-all cursor-pointer"
                  >
                    Publish
                  </button>
                )}
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
                             bg-blue-500/10 text-blue-400 border border-blue-500/20
                             hover:bg-blue-500/20 transition-all cursor-pointer"
                >
                  <CalendarIcon />
                  Schedule
                </button>
              </>
            )}
            <button
              onClick={handleSubmit}
              disabled={isCreating || isUpdating}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold
                         bg-[#b9fd5c] text-white hover:bg-[#ff8533] transition-all cursor-pointer
                         disabled:opacity-50"
            >
              {isCreating || isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon />
                  Save
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title & Excerpt */}
            <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl p-5 space-y-4">
              <div>
                <label className="text-white text-sm font-semibold mb-2 block">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={(e) => {
                    let value = e.target.value.replace(/-/g, "").replace(/\s+/g, " ");
                    setFormData((prev) => ({ ...prev, title: value }));
                  }}
                  placeholder="Enter post title"
                  className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                             py-3 px-4 text-base focus:outline-none focus:border-[#b9fd5c]
                             focus:ring-1 focus:ring-[#b9fd5c]/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-white text-sm font-semibold mb-2 block">Excerpt</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Write a brief excerpt"
                  rows={3}
                  className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                             py-3 px-4 text-sm focus:outline-none focus:border-[#b9fd5c]
                             focus:ring-1 focus:ring-[#b9fd5c]/50 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl p-5">
              <label className="text-white text-sm font-semibold mb-3 block">Content</label>
              <Editor
                apiKey={tinyMceApiKey}
                onInit={(evt, editor) => (editorRef.current = editor)}
                value={formData.content}
                onEditorChange={handleEditorChange}
                init={{
                  height: 500,
                  menubar: true,
                  plugins: [
                    "advlist autolink lists link image charmap print preview anchor",
                    "searchreplace visualblocks code fullscreen",
                    "insertdatetime media table paste code help wordcount",
                  ],
                  toolbar:
                    "undo redo | formatselect | bold italic backcolor | \
                    alignleft aligncenter alignright alignjustify | \
                    bullist numlist outdent indent | removeformat | help",
                  images_upload_handler: handleEditorImageUpload,
                  skin: "oxide-dark",
                  content_css: "dark",
                }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* SEO Settings */}
            <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#2a2c2f] flex items-center gap-2">
                <SeoIcon />
                <span className="text-white font-semibold text-sm">SEO Settings</span>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white text-xs font-semibold">SEO Title</label>
                    <span
                      className={`text-[10px] ${
                        formData.seoTitle.length > 60 ? "text-red-400" : "text-[#8a8d93]"
                      }`}
                    >
                      {formData.seoTitle.length}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleChange}
                    placeholder="SEO title"
                    className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                               py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c]
                               transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white text-xs font-semibold">Meta Description</label>
                    <span
                      className={`text-[10px] ${
                        formData.seoDescription.length > 160
                          ? "text-red-400"
                          : formData.seoDescription.length < 70 &&
                            formData.seoDescription.length > 0
                          ? "text-yellow-400"
                          : "text-[#8a8d93]"
                      }`}
                    >
                      {formData.seoDescription.length}/160
                    </span>
                  </div>
                  <textarea
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleChange}
                    placeholder="Meta description"
                    rows={3}
                    className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                               py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c]
                               transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="text-white text-xs font-semibold mb-2 block">Keywords</label>
                  <input
                    type="text"
                    name="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={handleChange}
                    placeholder="e.g. blogging, writing, SEO"
                    className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                               py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c]
                               transition-colors"
                  />
                </div>

                <button
                  onClick={() => setShowSeoPreview(!showSeoPreview)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                             text-xs font-semibold bg-[#111214] border border-[#2a2c2f]
                             text-[#8a8d93] hover:text-white hover:border-[#3a3c3f]
                             transition-colors cursor-pointer"
                >
                  <SearchIcon />
                  {showSeoPreview ? "Hide Preview" : "Search Preview"}
                </button>

                {showSeoPreview && (
                  <div className="p-4 bg-white rounded-xl">
                    <div className="text-[#1a0dab] text-base mb-1">{seoPreview.title}</div>
                    <div className="text-[#006621] text-xs mb-1">{seoPreview.url}</div>
                    <div className="text-[#545454] text-xs">{seoPreview.description}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#2a2c2f] flex items-center gap-2">
                <ImageIcon />
                <span className="text-white font-semibold text-sm">Featured Image</span>
              </div>
              <div className="p-5">
                {formData.featuredImage && (
                  <div className="mb-4">
                    <img
                      src={formData.featuredImage}
                      alt="Featured"
                      className="w-full h-48 object-cover rounded-xl border border-[#2a2c2f]"
                    />
                    <button
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, featuredImage: "" }))
                      }
                      className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2
                                 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400
                                 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer"
                    >
                      <CloseIcon />
                      Remove Image
                    </button>
                  </div>
                )}
                <label
                  className="w-full flex flex-col items-center justify-center gap-2 px-4 py-6
                             rounded-xl border-2 border-dashed border-[#2a2c2f] text-[#8a8d93]
                             hover:border-[#b9fd5c] hover:text-[#b9fd5c] transition-colors cursor-pointer"
                >
                  <UploadIcon />
                  <span className="text-xs font-medium">
                    {isUploading ? "Uploading..." : "Click to upload"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#2a2c2f] flex items-center gap-2">
                <FolderIcon />
                <span className="text-white font-semibold text-sm">Categories</span>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.customCategory}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customCategory: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCategory();
                      }
                    }}
                    placeholder="Add category..."
                    className="flex-1 bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                               py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c]
                               transition-colors"
                  />
                  <button
                    onClick={addCategory}
                    className="px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#b9fd5c]
                               text-white hover:bg-[#ff8533] transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.categories.length > 0 ? (
                    formData.categories.map((cat, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs
                                   font-medium bg-[#b9fd5c]/10 text-[#b9fd5c] border border-[#b9fd5c]/20"
                      >
                        {cat}
                        <button
                          onClick={() => removeCategory(i)}
                          className="hover:text-white transition-colors cursor-pointer"
                        >
                          <CloseSmallIcon />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-[#8a8d93] text-xs">No categories added</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#2a2c2f] flex items-center gap-2">
                <TagIcon />
                <span className="text-white font-semibold text-sm">Tags</span>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.customTag}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customTag: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add tag..."
                    className="flex-1 bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                               py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c]
                               transition-colors"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#b9fd5c]
                               text-white hover:bg-[#ff8533] transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.length > 0 ? (
                    formData.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs
                                   font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      >
                        #{tag}
                        <button
                          onClick={() => removeTag(i)}
                          className="hover:text-white transition-colors cursor-pointer"
                        >
                          <CloseSmallIcon />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-[#8a8d93] text-xs">No tags added</span>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#2a2c2f] flex items-center gap-2">
                <StatusIcon />
                <span className="text-white font-semibold text-sm">Status</span>
              </div>
              <div className="p-5">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isEditMode}
                  className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                             py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c]
                             transition-colors cursor-pointer disabled:opacity-50"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── History / Revision / Compare Views ─────────────────────

  const renderPlaceholderView = (title, message) => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveView("posts")}
          className="p-2 rounded-xl bg-[#111214] border border-[#2a2c2f] text-[#8a8d93]
                     hover:text-white hover:border-[#3a3c3f] transition-colors cursor-pointer"
        >
          <BackIcon />
        </button>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      </div>

      <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl">
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-16 h-16 rounded-full bg-[#b9fd5c]/10 flex items-center justify-center mb-4 text-[#b9fd5c]">
            <HistoryIcon className="w-8 h-8" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
          <p className="text-[#8a8d93] text-sm text-center max-w-md mb-6">{message}</p>
          <button
            onClick={() => setActiveView("posts")}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#b9fd5c] text-white
                       hover:bg-[#ff8533] transition-all cursor-pointer"
          >
            Back to Posts
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Main Render ────────────────────────────────────────────

  const renderView = () => {
    switch (activeView) {
      case "posts":
        return renderPostsList();
      case "editor":
        return renderPostEditor();
      case "history":
        return renderPlaceholderView(
          "Post History",
          "History view is coming soon. Track all changes made to your posts."
        );
      case "revision":
        return renderPlaceholderView(
          "Revision View",
          "View detailed revision content coming soon."
        );
      case "compare":
        return renderPlaceholderView(
          "Compare Revisions",
          "Side-by-side revision comparison coming soon."
        );
      default:
        return renderPostsList();
    }
  };

  return (
    <div className="p-2 sm:p-2">
      {renderView()}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmId(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Post"
        subtitle="Are you sure you want to delete this post?"
        confirmText="Delete Post"
        cancelText="Cancel"
        loadingText="Deleting..."
        warningText="This action cannot be undone! The post and all associated data will be permanently removed."
        accentColor="from-red-500 via-red-400 to-orange-500"
        confirmBtnClass="bg-red-500 text-white hover:bg-red-600"
        icon={<TrashLargeIcon />}
        iconBg="bg-red-500/10"
      />

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        maxWidth="max-w-sm"
      >
        <Modal.Accent color="from-blue-500 via-blue-400 to-cyan-500" />

        <div className="flex flex-col items-center pt-8 pb-2 px-6">
          <Modal.Icon
            icon={<CalendarLargeIcon />}
            bgClass="bg-blue-500/10"
          />
          <Modal.Header
            title="Schedule Publication"
            subtitle="Set a date and time to publish"
          />
        </div>

        <Modal.Body className="mb-6 mt-2 space-y-4">
          <div>
            <label className="text-white text-xs font-semibold mb-2 block">Date</label>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              min={format(new Date(), "yyyy-MM-dd")}
              className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                         py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c]
                         transition-colors"
            />
          </div>
          <div>
            <label className="text-white text-xs font-semibold mb-2 block">Time</label>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                         py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c]
                         transition-colors"
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button
            onClick={() => setShowScheduleModal(false)}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#111214]
                       border border-[#2a2c2f] text-[#8a8d93] hover:text-white
                       hover:border-[#3a3c3f] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleScheduleSubmit}
            disabled={!scheduleDate || !scheduleTime}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                       text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600
                       transition-all cursor-pointer disabled:opacity-50"
          >
            <CalendarIcon />
            Schedule
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BlogEditor;

// ─── SVG Icons ───────────────────────────────────────────────────

const BlogIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const SearchIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const RefreshIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
    fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const PlusIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const EditIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const HistoryIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const TrashIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const TrashLargeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
    fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const BackIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const SaveIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const CalendarIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CalendarLargeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
    fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const SeoIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="#b9fd5c" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const ImageIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="#b9fd5c" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const UploadIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const FolderIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="#b9fd5c" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const TagIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const StatusIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="#b9fd5c" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const CloseIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CloseSmallIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);