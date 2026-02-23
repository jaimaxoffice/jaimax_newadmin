import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  ArrowRight,
  ArrowLeft,
  Trash,
  Plus,
  Pencil,
  X,
  Upload,
  Megaphone,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import Loader from "../../reusableComponents/Loader/Loader"
import Modal from "../../reusableComponents/Modals/Modals";
import ConfirmModal from "../../reusableComponents/Modals/ConfirmModal";

import {
  useGetAnnouncementsQuery,
  useToggleAnnouncementStatusMutation,
  useDeleteAnnouncementMutation,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
} from "./AnnouncementsApiSlice";
const AnnouncementForm = ({
  title,
  setTitle,
  description,
  setDescription,
  isActive,
  setIsActive,
  formError,
  submitSuccess,
  isEditing,
  isSubmitting,
  existingImages,
  imageUploadSections,
  onSubmit,
  onCancel,
  onImageChange,
  onRedirectChange,
  onAddSection,
  onRemoveSection,
  onRemoveExisting,
  onMoveSectionUp,
  onMoveSectionDown,
  onMoveExistingUp,
  onMoveExistingDown,
  redirectOptions,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Alerts */}
      {formError && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <span className="text-red-400 text-sm">{formError}</span>
        </div>
      )}

      {submitSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0ecb6f]/5 border border-[#0ecb6f]/20 text-black">
          <CheckCircle size={18} className="text-[#0ecb6f] shrink-0" />
          <span className="text-[#0ecb6f] text-sm text-black">
            Announcement {isEditing ? "updated" : "created"} successfully!
          </span>
        </div>
      )}

      {/* Details Section */}
      <div className="bg-[#111214] border border-[#2a2c2f] rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-[#b9fd5c] uppercase tracking-widest">
          Announcement Details
        </h3>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[#b9fd5c] mb-2">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter announcement title"
            className="w-full bg-[#282f35] border border-[#2a2c2f] text-white rounded-lg
              py-2.5 px-4 text-sm focus:outline-none focus:border-[#b9fd5c]
              focus:ring-1 focus:ring-[#b9fd5c]/30 transition-colors placeholder-[#555]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#b9fd5c] mb-2">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Enter announcement description"
            className="w-full bg-[#282f35] border border-[#2a2c2f] text-white rounded-lg
              py-2.5 px-4 text-sm focus:outline-none focus:border-[#b9fd5c]
              focus:ring-1 focus:ring-[#b9fd5c]/30 transition-colors placeholder-[#555]
              resize-y"
          />
        </div>

        {/* Status Toggle */}
        <div className="bg-[#282f35] border border-[#2a2c2f] rounded-lg p-4">
          <label className="block text-xs font-medium text-[#b9fd5c] mb-2">
            Status
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                isActive ? "bg-[#b9fd5c]" : "bg-[#4b4545]"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                  isActive ? "left-5.5" : "left-0.5"
                }`}
              />
            </button>
            <span
              className={`text-sm ${
                isActive ? "text-[#b9fd5c]" : "text-[#8a8d93]"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Media Gallery Section */}
      <div className="bg-[#111214] border border-[#2a2c2f] rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-[#b9fd5c] uppercase tracking-widest flex items-center gap-2">
          <ImageIcon size={14} />
          Media Gallery
        </h3>

        {/* Existing Images (Edit Mode) */}
        {isEditing && existingImages.length > 0 && (
          <div>
            <p className="text-sm text-[#b9fd5c] mb-3 pb-2 border-b border-[#2a2c2f]">
              Current Images
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {existingImages.map((image, idx) => (
                <ImageThumbnail
                  key={`existing-${idx}`}
                  src={image.fileUrl || image}
                  index={idx}
                  total={existingImages.length}
                  onMoveUp={() => onMoveExistingUp(idx)}
                  onMoveDown={() => onMoveExistingDown(idx)}
                  onRemove={() => onRemoveExisting(idx)}
                />
              ))}
            </div>
          </div>
        )}

        {/* New Image Uploads */}
        <div>
          <p className="text-sm text-[#b9fd5c] mb-3 pb-2 border-b border-[#2a2c2f]">
            {isEditing ? "Add New Images" : "Upload Images"}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {imageUploadSections.map((section, index) => (
              <div
                key={section.id}
                className={`rounded-xl overflow-hidden h-44 flex flex-col ${
                  section.preview
                    ? "bg-[#282f35] border border-[#2a2c2f]"
                    : "border border-dashed border-[#b9fd5c]/50"
                }`}
              >
                {section.preview ? (
                  <div className="relative flex-1 flex flex-col">
                    {/* Preview Image */}
                    <div className="flex-1 relative">
                      <img
                        src={section.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Overlay Controls */}
                      <div
                        className="absolute inset-0 bg-black/70 flex flex-col
                          justify-between p-2 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <span
                          className="self-start bg-[#b9fd5c] text-white text-[10px]
                            font-bold px-1.5 py-0.5 rounded"
                        >
                          #{index + 1}
                        </span>

                        <div className="flex justify-between">
                          <div className="flex gap-1">
                            {index !== 0 && (
                              <MoveButton onClick={() => onMoveSectionUp(index)}>
                                <ArrowLeft size={12} />
                              </MoveButton>
                            )}
                            {index !== imageUploadSections.length - 1 && (
                              <MoveButton onClick={() => onMoveSectionDown(index)}>
                                <ArrowRight size={12} />
                              </MoveButton>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveSection(section.id)}
                            className="w-7 h-7 bg-[#b9fd5c] rounded flex items-center
                              justify-center text-white cursor-pointer hover:bg-[#ff7b1c]
                              transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Redirect URL */}
                    <div className="p-2">
                      <select
                        value={section.redirectUrl || ""}
                        onChange={(e) => onRedirectChange(e, section.id)}
                        className="w-full bg-[#111214] border border-[#2a2c2f] text-white
                          rounded-lg py-1.5 px-2 text-xs focus:outline-none
                          focus:border-[#b9fd5c] transition-colors cursor-pointer"
                      >
                        <option value="">Select Redirect</option>
                        {redirectOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center justify-center h-full p-4
                      cursor-pointer hover:bg-[#282f35] transition-colors"
                  >
                    <input
                      type="file"
                      onChange={(e) => onImageChange(e, section.id)}
                      accept="image/*"
                      className="hidden"
                    />
                    <div
                      className="w-10 h-10 rounded-full bg-[#b9fd5c]/10 border border-[#b9fd5c]
                        flex items-center justify-center mb-3"
                    >
                      <Upload size={18} className="text-[#b9fd5c]" />
                    </div>
                    <p className="text-center text-xs leading-relaxed">
                      <span className="text-[#b9fd5c]">Click to upload</span>
                      <br />
                      <span className="text-[#555]">or drag image here</span>
                    </p>
                  </label>
                )}
              </div>
            ))}

            {/* Add Image Button */}
            <button
              type="button"
              onClick={onAddSection}
              className="border border-dashed border-[#b9fd5c]/50 rounded-xl h-44
                flex flex-col items-center justify-center cursor-pointer
                hover:bg-[#282f35] transition-colors group"
            >
              <div
                className="w-9 h-9 rounded-full border border-dashed border-[#b9fd5c]
                  flex items-center justify-center mb-3
                  group-hover:bg-[#b9fd5c]/10 transition-colors"
              >
                <Plus size={16} className="text-[#b9fd5c]" />
              </div>
              <span className="text-[#b9fd5c] text-xs">Add Image</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between pt-4 border-t border-[#2a2c2f]">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white
            bg-transparent border border-[#2a2c2f] hover:bg-[#2a2c2f]
            transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-black
            bg-[#b9fd5c] hover:bg-[#ff7b1c] transition-colors cursor-pointer
            disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              {isEditing ? <CheckCircle size={16} /> : <Plus size={16} />}
              {isEditing ? "Update" : "Create"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
const AnnouncementCard = ({
  announcement,
  carouselIndex,
  onCarouselPrev,
  onCarouselNext,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const images = announcement.images || [];
  const hasImages = images.length > 0;
  const hasMultiple = images.length > 1;

  return (
    <div
      className="bg-[#282f35] border border-[#2a2c2f] rounded-lg overflow-hidden
        flex flex-col relative group hover:border-[#b9fd5c]/30 transition-colors"
    >
      {/* Image Section */}
      <div className="relative h-48 bg-[#111214]">
        {hasImages ? (
          <>
            <img
              src={images[carouselIndex]?.fileUrl}
              alt={`${announcement.title} - ${carouselIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Carousel Controls */}
            {hasMultiple && (
              <>
                <button
                  onClick={onCarouselPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7
                    bg-black/60 hover:bg-black/80 rounded-full flex items-center
                    justify-center text-white transition-colors cursor-pointer
                    opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={onCarouselNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7
                    bg-black/60 hover:bg-black/80 rounded-full flex items-center
                    justify-center text-white transition-colors cursor-pointer
                    opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={14} />
                </button>

                {/* Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        idx === carouselIndex ? "bg-[#b9fd5c]" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Megaphone size={40} className="text-[#2a2c2f]" />
          </div>
        )}

        {/* Status Badge */}
        <span
          className={`absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
            announcement.isActive
              ? "bg-[#b9fd5c] text-black"
              : "bg-[#2a2c2f] text-[#8a8d93]"
          }`}
        >
          {announcement.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        <h3 className="text-[#b9fd5c] text-sm font-semibold mb-2 line-clamp-1">
          {announcement.title}
        </h3>
        <p className="text-[#ccc] text-xs leading-relaxed line-clamp-2">
          {announcement.description}
        </p>
      </div>

      {/* Actions */}
      <div
        className="px-4 py-3 border-t border-[#2a2c2f] flex items-center
          justify-between"
      >
        {/* Toggle */}
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs
            font-semibold transition-colors cursor-pointer ${
              announcement.isActive
                ? "bg-[#b9fd5c]/10 text-[#b9fd5c] hover:bg-[#b9fd5c]/20"
                : "bg-[#2a2c2f] text-[#8a8d93] hover:bg-[#333]"
            }`}
        >
          {announcement.isActive ? "ON" : "OFF"}
          <span
            className={`w-8 h-4 rounded-full relative transition-colors ${
              announcement.isActive ? "bg-[#b9fd5c]" : "bg-[#4b4545]"
            }`}
          >
            <span
              className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                announcement.isActive ? "left-4.5" : "left-0.5"
              }`}
            />
          </span>
        </button>

        {/* Edit + Delete */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center rounded-lg
              bg-[#b9fd5c]/10 text-[#b9fd5c] hover:bg-[#b9fd5c]/20
              transition-colors cursor-pointer"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center rounded-lg
              bg-red-500/10 text-red-400 hover:bg-red-500/20
              transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
const ImageThumbnail = ({ src, index, total, onMoveUp, onMoveDown, onRemove }) => (
  <div
    className="relative rounded-xl overflow-hidden h-28 bg-[#282f35]
      border border-[#2a2c2f] group"
  >
    <img src={src} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />

    {/* Hover Overlay */}
    <div
      className="absolute inset-0 bg-black/70 flex flex-col justify-between p-2
        opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <span className="self-start bg-[#b9fd5c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
        #{index + 1}
      </span>

      <div className="flex justify-between">
        <div className="flex gap-1">
          {index !== 0 && (
            <MoveButton onClick={onMoveUp}>
              <ArrowLeft size={12} />
            </MoveButton>
          )}
          {index !== total - 1 && (
            <MoveButton onClick={onMoveDown}>
              <ArrowRight size={12} />
            </MoveButton>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="w-7 h-7 bg-[#b9fd5c] rounded flex items-center justify-center
            text-white cursor-pointer hover:bg-[#ff7b1c] transition-colors"
        >
          <Trash size={12} />
        </button>
      </div>
    </div>
  </div>
);

const MoveButton = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-7 h-7 bg-black/70 border border-[#2a2c2f] rounded
      flex items-center justify-center text-white cursor-pointer
      hover:bg-[#2a2c2f] transition-colors"
  >
    {children}
  </button>
);
const REDIRECT_OPTIONS = [
  "wallet",
  "deposit",
  "goa",
  "buy",
  "kyc",
  "teams",
  "lockedsuperbonus",
  "jaimaxhub",
  "refer",
];

const AnnouncementList = () => {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useGetAnnouncementsQuery();
  const [toggleStatus] = useToggleAnnouncementStatusMutation();
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();
  const [createAnnouncement, { isLoading: isCreating }] =
    useCreateAnnouncementMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] =
    useUpdateAnnouncementMutation();

  // Modal states
  const [modals, setModals] = useState({
    delete: false,
    form: false,
  });
  const [deleteId, setDeleteId] = useState(null);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Image states
  const [imageUploadSections, setImageUploadSections] = useState([
    { id: Date.now(), file: null, preview: null, base64: null, redirectUrl: "" },
  ]);
  const [existingImages, setExistingImages] = useState([]);

  // Carousel states for cards
  const [carouselIndexes, setCarouselIndexes] = useState({});

  const announcements =
    response?.success && Array.isArray(response.data) ? response.data : [];

  // Populate form when editing
  useEffect(() => {
    if (selectedAnnouncement) {
      setTitle(selectedAnnouncement.title || "");
      setDescription(selectedAnnouncement.description || "");
      setIsActive(selectedAnnouncement.isActive || false);
      setExistingImages(
        selectedAnnouncement.images?.length > 0
          ? selectedAnnouncement.images
          : []
      );
      setImageUploadSections([
        { id: Date.now(), file: null, preview: null, base64: null, redirectUrl: "" },
      ]);
    }
  }, [selectedAnnouncement]);

  // Reset form
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setIsActive(true);
    setExistingImages([]);
    setSelectedAnnouncement(null);
    setIsEditing(false);
    setFormError("");
    setSubmitSuccess(false);
    setImageUploadSections([
      { id: Date.now(), file: null, preview: null, base64: null, redirectUrl: "" },
    ]);
  };

  // Handlers
  const handleToggleStatus = async (id) => {
    try {
      await toggleStatus(id);
      await refetch();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setModals((prev) => ({ ...prev, delete: true }));
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteAnnouncement(deleteId);
      setModals((prev) => ({ ...prev, delete: false }));
      refetch();
    }
  };

  const openCreateModal = () => {
    resetForm();
    setModals((prev) => ({ ...prev, form: true }));
  };

  const openEditModal = (announcement) => {
    setIsEditing(true);
    setSelectedAnnouncement(announcement);
    setModals((prev) => ({ ...prev, form: true }));
  };

  // Image handlers
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e, sectionId) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const preview = URL.createObjectURL(file);
        const base64String = await fileToBase64(file);
        setImageUploadSections((sections) =>
          sections.map((section) =>
            section.id === sectionId
              ? { ...section, file, preview, base64: base64String }
              : section
          )
        );
      } catch (err) {
        setFormError("Error processing image. Please try again.");
      }
    }
  };

  const handleRedirectUrlChange = (e, id) => {
    setImageUploadSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, redirectUrl: e.target.value } : section
      )
    );
  };

  const addImageUploadSection = () => {
    setImageUploadSections((sections) => [
      ...sections,
      { id: Date.now(), file: null, preview: null, base64: null, redirectUrl: "" },
    ]);
  };

  const removeUploadSection = (sectionId) => {
    const section = imageUploadSections.find((s) => s.id === sectionId);
    if (section?.preview) URL.revokeObjectURL(section.preview);
    setImageUploadSections((sections) => {
      const filtered = sections.filter((s) => s.id !== sectionId);
      return filtered.length === 0
        ? [{ id: Date.now(), file: null, preview: null, base64: null, redirectUrl: "" }]
        : filtered;
    });
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveSectionUp = (index) => {
    if (index === 0) return;
    const updated = [...imageUploadSections];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setImageUploadSections(updated);
  };

  const moveSectionDown = (index) => {
    if (index === imageUploadSections.length - 1) return;
    const updated = [...imageUploadSections];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setImageUploadSections(updated);
  };

  const moveExistingImageUp = (index) => {
    if (index === 0) return;
    const updated = [...existingImages];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setExistingImages(updated);
  };

  const moveExistingImageDown = (index) => {
    if (index === existingImages.length - 1) return;
    const updated = [...existingImages];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setExistingImages(updated);
  };

  // Carousel navigation
  const handleCarouselPrev = (id, total) => {
    setCarouselIndexes((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) - 1 + total) % total,
    }));
  };

  const handleCarouselNext = (id, total) => {
    setCarouselIndexes((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % total,
    }));
  };

  // Form submission
  const validateForm = () => {
    setFormError("");
    if (!title.trim()) {
      setFormError("Title is required");
      return false;
    }
    if (!description.trim()) {
      setFormError("Description is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitSuccess(false);
    if (!validateForm()) return;

    try {
      const requestData = { title, description, isActive };

      const newImages = imageUploadSections
        .filter((section) => section.base64)
        .map((section) => ({
          base64: section.base64.split(",")[1] || section.base64,
          redirectUrl: section.redirectUrl || "",
        }));

      if (newImages.length > 0) requestData.images = newImages;

      if (isEditing) {
        requestData.existingImages = existingImages.map((img) => ({
          image: img.fileUrl,
          redirectUrl: img.redirectUrl || "",
        }));
        await updateAnnouncement({
          id: selectedAnnouncement._id,
          data: requestData,
        }).unwrap();
      } else {
        await createAnnouncement(requestData).unwrap();
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setModals((prev) => ({ ...prev, form: false }));
        resetForm();
        refetch();
      }, 1000);
    } catch (err) {
      setFormError(err.data?.message || err.message || "An unexpected error occurred");
    }
  };

  return (
    <>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Header */}
        <div className="flex w-full">
          <h1 className="text-lg font-semibold text-white">Announcements</h1>
          <div className="flex flex-wrap items-center gap-3 ml-auto">
            <button
              onClick={openCreateModal}
              className="bg-[#b9fd5c] hover:bg-[#ff7b1c] text-white rounded-xl
                py-2.5 px-4 text-sm font-semibold transition-colors cursor-pointer
                flex items-center gap-2"
            >
              <Plus size={16} />
              Create
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
         <Loader/>
        )}

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl
              bg-red-500/5 border border-red-500/20"
          >
            <AlertTriangle size={18} className="text-[#b9fd5c] shrink-0" />
            <p className="text-[#b9fd5c] text-sm">
              {error.data?.message || "An error occurred while fetching announcements."}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && announcements.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16
              bg-[#282f35] border border-[#2a2c2f] rounded-2xl"
          >
            <Megaphone size={48} className="text-[#b9fd5c] mb-4" />
            <h3 className="text-[#b9fd5c] text-lg font-semibold mb-2">
              No announcements yet
            </h3>
            <button
              onClick={openCreateModal}
              className="bg-[#b9fd5c] hover:bg-[#ff7b1c] text-white rounded-xl
                py-2.5 px-5 text-sm font-semibold transition-colors cursor-pointer mt-2"
            >
              Create First Announcement
            </button>
          </div>
        )}

        {/* Announcements Grid */}
        {!isLoading && !error && announcements.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement._id}
                announcement={announcement}
                carouselIndex={carouselIndexes[announcement._id] || 0}
                onCarouselPrev={() =>
                  handleCarouselPrev(announcement._id, announcement.images?.length || 1)
                }
                onCarouselNext={() =>
                  handleCarouselNext(announcement._id, announcement.images?.length || 1)
                }
                onToggle={() => handleToggleStatus(announcement._id)}
                onEdit={() => openEditModal(announcement)}
                onDelete={() => confirmDelete(announcement._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={modals.delete}
        onClose={() => setModals((prev) => ({ ...prev, delete: false }))}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Create/Edit Form Modal */}
      <Modal
        isOpen={modals.form}
        onClose={() => {
          setModals((prev) => ({ ...prev, form: false }));
          resetForm();
        }}
        title={isEditing ? "Edit Announcement" : "Create Announcement"}
        size="lg"
      >
        <AnnouncementForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          isActive={isActive}
          setIsActive={setIsActive}
          formError={formError}
          submitSuccess={submitSuccess}
          isEditing={isEditing}
          isSubmitting={isCreating || isUpdating}
          existingImages={existingImages}
          imageUploadSections={imageUploadSections}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModals((prev) => ({ ...prev, form: false }));
            resetForm();
          }}
          onImageChange={handleImageChange}
          onRedirectChange={handleRedirectUrlChange}
          onAddSection={addImageUploadSection}
          onRemoveSection={removeUploadSection}
          onRemoveExisting={removeExistingImage}
          onMoveSectionUp={moveSectionUp}
          onMoveSectionDown={moveSectionDown}
          onMoveExistingUp={moveExistingImageUp}
          onMoveExistingDown={moveExistingImageDown}
          redirectOptions={REDIRECT_OPTIONS}
        />
      </Modal>
    </>
  );
};

export default AnnouncementList;