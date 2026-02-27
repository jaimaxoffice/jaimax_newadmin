// src/pages/LegalUpdation.jsx
import React, { useEffect, useState } from "react";
import { useUpdateLegalMutation, useGetLegalQuery } from "./securityApiSlice";
import { Editor } from "@tinymce/tinymce-react";
import { useToast } from "../../reusableComponents/Toasts/ToastContext";

const LegalUpdation = () => {
  const toast = useToast();
  const [legalData, setLegalData] = useState("");
  const [ids, setIds] = useState("");
  const [loading, setLoading] = useState(false);

  const { data, isLoading, refetch } = useGetLegalQuery();
  const [legalUpdate] = useUpdateLegalMutation();

  // Determine TinyMCE API Key
  const getTinyMceApiKey = () => {
    const origin = window.location.origin;
    if (origin.includes("5173") || origin.includes("5174")) {
      return import.meta.env.TINY_MCE_EDITOR_API_KEY;
    } else if (origin === "https://admin.jaimax.com") {
      return import.meta.env.TINY_MCE_EDITOR_API_KEY_PROD;
    }
    return import.meta.TINY_MCE_EDITOR_API_KEY;
  };

  const tinyMceApiKey = getTinyMceApiKey();

  useEffect(() => {
    refetch();
    if (data) {
      setIds(data?.data?._id);
      setLegalData(data?.data?.legal_text || "");
    }
  }, [data]);

  const handleEditorChange = (content) => {
    setLegalData(content);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const value = {
        id: ids,
        legal_text: legalData,
      };
      const response = await legalUpdate(value);
      if (response?.data?.status_code === 200) {
        setLegalData(response?.data?.data?.legal_text);
        toast.success(response?.data?.message, {
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error(error?.message, {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Main Card */}
        <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#2a2c2f]">
            <h1 className="text-xl font-semibold text-white">
              Legal Updations
            </h1>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Label */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-[#8a8d93] uppercase tracking-wider mb-2">
                Content <span className="text-red-400">*</span>
              </label>
            </div>

            {/* Editor Section */}
            {isLoading ? (
              <LoadingState isLoading={isLoading} />
            ) : (
              <div className="space-y-5">
                {/* TinyMCE Editor Wrapper */}
                <div
                  className="relative isolate z-0 rounded-xl overflow-hidden border border-[#2a2c2f]
    [&_.tox]:!z-0
    [&_.tox-tinymce]:!z-0
    [&_.tox-editor-header]:!z-0
    [&_.tox-toolbar__primary]:!z-0
    [&_.tox-toolbar__overflow]:!z-0
    [&_.tox-statusbar]:!z-0

    [&_.tox-tinymce]:!border-0
    [&_.tox_.tox-menubar]:!bg-[#111214]
    [&_.tox_.tox-toolbar__primary]:!bg-[#111214]
    [&_.tox_.tox-toolbar__overflow]:!bg-[#111214]
    [&_.tox_.tox-statusbar]:!bg-[#111214]
    [&_.tox_.tox-statusbar]:!border-t-[#2a2c2f]
    [&_.tox_.tox-mbtn__select-label]:!text-[#8a8d93]
    [&_.tox_.tox-tbtn]:!text-[#8a8d93]
    [&_.tox_.tox-statusbar__wordcount]:!text-[#555]
    [&_.tox_.tox-statusbar__path-item]:!text-[#555]"
                >
                  <Editor
                    apiKey={tinyMceApiKey}
                    init={{
                      selector: "textarea",
                      height: 500,
                      plugins:
                        "table lists media paste anchor autolink charmap codesample emoticons image link wordcount visualblocks",
                      toolbar:
                        "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
                      tinycomments_mode: "embedded",
                      paste_as_text: true,
                      skin: "oxide-dark",
                      content_css: "dark",
                      ai_request: (request, respondWith) =>
                        respondWith.string(() =>
                          Promise.reject("See docs to implement AI Assistant"),
                        ),
                    }}
                    value={legalData}
                    onEditorChange={handleEditorChange}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`
                      min-w-[180px] px-8 py-3 rounded-xl text-sm font-semibold
                      transition-all duration-200 cursor-pointer
                      ${
                        loading
                          ? "bg-[#b9fd5c]/50 text-white/60 cursor-not-allowed"
                          : "bg-[#b9fd5c] text-black  hover:shadow-lg hover:shadow-[#b9fd5c]/20 active:scale-[0.98]"
                      }
                    `}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
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
                        Submitting...
                      </span>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalUpdation;

// ─── Sub-Components ──────────────────────────────────────────────

/**
 * Loading State Component
 */
const LoadingState = ({ isLoading }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <span className="text-[#8a8d93] text-sm font-light">Loading editor...</span>
  </div>
);
