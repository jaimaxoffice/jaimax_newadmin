import React, { useEffect } from "react";
import {
  ArrowLeft,
  Info,
  File,
  Image as ImageIcon,
  Eye,
  Download,
} from "lucide-react";

const GroupInfoPanel = ({
  selectedGroup,
  activeGroupTab,
  setActiveGroupTab,
  totalUsers,
  membersContainerRef,
  accumulatedFiles,
  filesPage,
  setFilesPage,
  loadingFiles,
  filesPagination,
  refetchFiles,
  setShowMembers,
  messagesEndRef,
  formatFileSize,
  downloadFileToDesktop,
}) => {
  const allFiles = Array.isArray(accumulatedFiles) ? accumulatedFiles : [];

  // Fetch when tab changes — only media and files tabs
  useEffect(() => {
    if (activeGroupTab === "media") refetchFiles?.("image");
    else if (activeGroupTab === "files") refetchFiles?.("document");
  }, [activeGroupTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // REPLACE WITH
  useEffect(() => {
    const container = membersContainerRef.current;
    if (!container || activeGroupTab === "overview") return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const hasMore = filesPagination?.page < filesPagination?.totalPages;
      if (
        scrollHeight - scrollTop - clientHeight < 150 &&
        hasMore &&
        !loadingFiles &&
        filesPagination?.page >= 1 // ← only fire if first page already loaded
      ) {
        setFilesPage((p) => p + 1);
      }
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeGroupTab, loadingFiles, filesPagination]);

  const getFileType = (url) => {
    if (!url || typeof url !== "string") return "unknown";
    const clean = url.split("?")[0].toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/.test(clean)) return "image";
    if (/\.(pdf)$/.test(clean)) return "pdf";
    if (/\.(doc|docx)$/.test(clean)) return "word";
    if (/\.(xls|xlsx)$/.test(clean)) return "excel";
    if (/\.(ppt|pptx)$/.test(clean)) return "powerpoint";
    if (/\.(zip|rar)$/.test(clean)) return "archive";
    return "file";
  };

  const getFileName = (url) => {
    if (!url) return "File";
    return url.split("?")[0].split("/").pop() || "File";
  };

  const imageFiles = allFiles.filter((url) => getFileType(url) === "image");
  const documentFiles = allFiles.filter((url) => getFileType(url) !== "image");

  const LoadMoreSpinner = () => {
    const hasMore = filesPagination?.page < filesPagination?.totalPages;
    if (loadingFiles && filesPage > 1) {
      return (
        <div className="py-4 flex justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00a884]" />
        </div>
      );
    }
    if (hasMore) {
      return (
        <div className="py-4 flex justify-center">
          <button
            onClick={() => setFilesPage((p) => p + 1)}
            className="px-4 py-2 text-xs text-[#00a884] border border-[#00a884] rounded-full hover:bg-[#00a884]/10 transition-colors"
          >
            Load more
          </button>
        </div>
      );
    }
    if (allFiles.length > 0) {
      return (
        <div className="py-4 flex justify-center">
          <p className="text-xs text-gray-600">All loaded</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b141a] h-full">
      {/* Header */}
      <div className="bg-[#202c33] p-2 sm:p-4 flex items-center gap-2 sm:gap-3 border-b border-[#2a3942] flex-shrink-0">
        <button
          onClick={() => {
            setShowMembers(false);
            setActiveGroupTab("overview");
            setTimeout(
              () =>
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
              100,
            );
          }}
          className="hover:bg-[#0a6a72] p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <h2 className="text-base sm:text-lg font-semibold truncate">
          Group Info
        </h2>
      </div>

      {/* Tabs */}
      <div className="bg-[#202c33] border-b border-[#2a3942] overflow-x-auto flex-shrink-0">
        <div className="flex min-w-max">
          {[
            { id: "overview", icon: Info, label: "Overview" },
            {
              id: "media",
              icon: ImageIcon,
              label:
                imageFiles.length > 0
                  ? `Media (${imageFiles.length})`
                  : "Media",
            },
            {
              id: "files",
              icon: File,
              label:
                documentFiles.length > 0
                  ? `Files (${documentFiles.length})`
                  : "Files",
            },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
            
              onClick={() => {
                if (activeGroupTab === id) return;
                setActiveGroupTab(id); // useEffect handles the fetch
              }}
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                activeGroupTab === id
                  ? "border-[#00a884] text-[#00a884]"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div ref={membersContainerRef} className="flex-1 overflow-y-auto">
        {/* Overview Tab */}
        {activeGroupTab === "overview" && (
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="bg-[#202c33] rounded-lg p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 sm:mb-3">
                Group Description
              </h4>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {selectedGroup?.groupDescription || "No description available"}
              </p>
            </div>
            <div className="bg-[#202c33] rounded-lg p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 sm:mb-3">
                Group Details
              </h4>
              <div className="flex justify-between gap-2 text-xs sm:text-sm">
                <span className="text-gray-400">Total Members</span>
                <span className="text-gray-300">{totalUsers || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Media Tab */}
        {activeGroupTab === "media" && (
          <div className="p-3 sm:p-4">
            {filesPage === 1 && loadingFiles ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a884]" />
              </div>
            ) : imageFiles.length > 0 ? (
              <>
                <h3 className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 font-semibold">
                  {filesPagination?.totalMessages || imageFiles.length} Image
                  {imageFiles.length !== 1 ? "s" : ""}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                  {imageFiles.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden bg-[#1f2f2a]"
                      onClick={() => window.open(url, "_blank")}
                    >
                      <img
                        src={url}
                        alt={getFileName(url)}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
                <LoadMoreSpinner />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <ImageIcon className="w-16 h-16 mb-3 opacity-30" />
                <p className="text-sm">No images shared yet</p>
              </div>
            )}
          </div>
        )}

        {/* Files Tab */}
        {activeGroupTab === "files" && (
          <div className="p-3 sm:p-4">
            {filesPage === 1 && loadingFiles ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a884]" />
              </div>
            ) : documentFiles.length > 0 ? (
              <>
                <h3 className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 font-semibold">
                  {filesPagination?.totalMessages || documentFiles.length}{" "}
                  Document
                  {documentFiles.length !== 1 ? "s" : ""}
                </h3>
                <div className="space-y-1.5 sm:space-y-2">
                  {documentFiles.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#202c33] rounded-lg hover:bg-[#2a3942] transition-colors cursor-pointer"
                      onClick={() => window.open(url, "_blank")}
                    >
                      <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <File className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold truncate text-white">
                          {getFileName(url)}
                        </p>
                      </div>
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          await downloadFileToDesktop(url, getFileName(url));
                        }}
                        className="p-1.5 sm:p-2 hover:bg-[#0a6a72] rounded-full transition-colors flex-shrink-0"
                      >
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <LoadMoreSpinner />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <File className="w-16 h-16 mb-3 opacity-30" />
                <p className="text-sm">No documents shared yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupInfoPanel;
