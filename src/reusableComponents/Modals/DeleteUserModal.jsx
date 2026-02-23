// src/reusableComponents/Modals/DeleteUserModal.jsx (or keep inline)
import {TrashIcon ,X,CircleAlert } from "lucide-react";
const DeleteUserModal = ({
  isOpen,
  onClose,
  formData,
  onChange,
  onSubmit,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2c2f]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-red-400">
              <TrashIcon />
            </span>
            Delete User
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full
                       bg-[#111214] border border-[#2a2c2f] text-[#8a8d93]
                       hover:text-white hover:border-red-500
                       transition-colors cursor-pointer"
          >
            <X />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit}>
          <div className="p-6 space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-medium text-[#8a8d93] uppercase tracking-wider"
              >
                Username <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={onChange}
                placeholder="Enter username to delete"
                required
                className="w-full bg-[#111214] border border-[#2a2c2f] text-white text-sm
                           rounded-xl py-2.5 px-4
                           placeholder-[#555]
                           focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50
                           transition-all duration-200
                           hover:border-[#3a3c3f]"
              />
            </div>

            {/* Reason Textarea */}
            <div className="space-y-1.5">
              <label
                htmlFor="reasonForDelete"
                className="block text-xs font-medium text-[#8a8d93] uppercase tracking-wider"
              >
                Reason for Delete <span className="text-red-400">*</span>
              </label>
              <textarea
                id="reasonForDelete"
                name="reasonForDelete"
                rows="3"
                value={formData.reasonForDelete}
                onChange={onChange}
                placeholder="Enter reason for deletion"
                required
                className="w-full bg-[#111214] border border-[#2a2c2f] text-white text-sm
                           rounded-xl py-2.5 px-4 resize-none
                           placeholder-[#555]
                           focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50
                           transition-all duration-200
                           hover:border-[#3a3c3f]"
              />
            </div>

            {/* Warning Alert */}
            <div
              className="flex items-start gap-3 p-3 rounded-xl
                          bg-yellow-500/10 border border-yellow-500/20"
            >
              <span className="text-yellow-400 mt-0.5">
                <CircleAlert /> 
              </span>
              <p className="text-xs text-yellow-400/90 m-0 leading-relaxed">
                <strong className="text-yellow-400">Warning:</strong> This
                action cannot be undone. The user will be permanently deleted.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#2a2c2f] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium
                         bg-[#111214] border border-[#2a2c2f] text-[#8a8d93]
                         hover:text-white hover:border-[#3a3c3f]
                         transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isDeleting}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                transition-all duration-200 cursor-pointer
                ${
                  isDeleting
                    ? "bg-red-500/50 text-white/60 cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 active:scale-[0.98]"
                }
              `}
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon />
                  Delete User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default DeleteUserModal ;