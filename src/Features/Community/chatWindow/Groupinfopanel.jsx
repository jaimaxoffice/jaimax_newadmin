import React, { useState } from 'react';
import { ArrowLeft, Info, Image as ImageIcon, File, Download, Eye } from 'lucide-react';

const GroupInfoPanel = ({
    selectedGroup,
    chatFiles,
    loadingFiles,
    totalUsers,
    formatTime,
    formatFileSize,
    setShowMembers,
    messagesEndRef,
    refetchFiles,
}) => {
    const [activeTab, setActiveTab] = useState('overview');

    const downloadFile = async (fileUrl, fileName) => {
        try {
            const res  = await fetch(fileUrl, { mode: 'cors' });
            const blob = await res.blob();
            const url  = window.URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url; a.download = fileName || 'download'; a.style.display = 'none';
            document.body.appendChild(a); a.click();
            setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 100);
        } catch {
            window.open(fileUrl, '_blank');
        }
    };

    // Flatten chatFiles into individual file objects
    const allFiles = [];
    chatFiles?.forEach((cf) => {
        if (cf.files && Array.isArray(cf.files)) {
            cf.files.forEach((f) => allFiles.push({
                _id: cf._id, fileName: f.fileName, fileUrl: f.file_url,
                fileType: f.file_type, fileSize: f.file_size,
                senderName: cf.publisherName, timestamp: cf.timestamp || cf.createdAt,
            }));
        }
    });

    const imageFiles    = allFiles.filter((f) => f.fileType?.startsWith('image/'));
    const documentFiles = allFiles.filter((f) => !f.fileType?.startsWith('image/'));

    const tabs = [
        { id: 'overview', Icon: Info,      label: 'Overview' },
        { id: 'media',    Icon: ImageIcon,  label: 'Media'    },
        { id: 'files',    Icon: File,       label: 'Files'    },
    ];

    return (
        <div className="flex-1 flex flex-col bg-[#0b141a] h-full">
            {/* Header */}
            <div className="bg-[#202c33] p-2 sm:p-3 md:p-4 flex items-center gap-2 sm:gap-3 border-b border-[#2a3942]">
                <button
                    onClick={() => { setShowMembers(false); setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                    className="hover:bg-[#0a6a72] p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0"
                >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <h2 className="text-base sm:text-lg font-semibold truncate">Group Info</h2>
            </div>

            {/* Tabs */}
            <div className="bg-[#202c33] border-b border-[#2a3942] overflow-x-auto">
                <div className="flex min-w-max">
                    {tabs.map(({ id, Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => { setActiveTab(id); if (id !== 'overview') refetchFiles?.(); }}
                            className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeTab === id ? 'border-[#00a884] text-[#00a884]' : 'border-transparent text-gray-400 hover:text-white'}`}
                        >
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                <Icon className="w-4 h-4" />
                                <span className="hidden xs:inline">{label}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Overview */}
                {activeTab === 'overview' && (
                    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                        <div className="bg-[#202c33] rounded-lg p-3 sm:p-4">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2">Group Description</h4>
                            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                                {selectedGroup?.groupDescription || 'No description available'}
                            </p>
                        </div>
                        <div className="bg-[#202c33] rounded-lg p-3 sm:p-4">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2">Group Details</h4>
                            <div className="space-y-2 text-xs sm:text-sm">
                                <div className="flex justify-between gap-2">
                                    <span className="text-gray-400">Created</span>
                                    <span className="text-gray-300">{formatTime(selectedGroup?.createdAt)}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <span className="text-gray-400">Total Members</span>
                                    <span className="text-gray-300">{totalUsers || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Media */}
                {activeTab === 'media' && (
                    <div className="p-3 sm:p-4">
                        {loadingFiles ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00a884]" />
                            </div>
                        ) : imageFiles.length > 0 ? (
                            <>
                                <h3 className="text-xs sm:text-sm text-gray-400 mb-2 font-semibold">{imageFiles.length} Images</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                                    {imageFiles.map((file, i) => (
                                        <div key={`${file._id}-${i}`} className="relative group cursor-pointer" onClick={() => window.open(file.fileUrl, '_blank')}>
                                            <div className="w-full aspect-square rounded-lg overflow-hidden bg-[#1f2f2a]">
                                                <img src={file.fileUrl} alt={file.fileName} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                <Eye className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <ImageIcon className="w-14 h-14 mb-3 opacity-30" />
                                <p className="text-xs sm:text-sm">No images shared yet</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Files */}
                {activeTab === 'files' && (
                    <div className="p-3 sm:p-4">
                        {loadingFiles ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00a884]" />
                            </div>
                        ) : documentFiles.length > 0 ? (
                            <>
                                <h3 className="text-xs sm:text-sm text-gray-400 mb-2 font-semibold">{documentFiles.length} Documents</h3>
                                <div className="space-y-1.5 sm:space-y-2">
                                    {documentFiles.map((file, i) => (
                                        <div key={`${file._id}-${i}`} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#202c33] rounded-lg hover:bg-[#2a3942] transition-colors cursor-pointer" onClick={() => window.open(file.fileUrl, '_blank')}>
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                <File className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-semibold truncate text-white">{file.fileName}</p>
                                                <p className="text-xs text-gray-400 truncate">{file.senderName || 'Unknown'} • {formatTime(file.timestamp)}</p>
                                                {file.fileSize && <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>}
                                            </div>
                                            <button onClick={async (e) => { e.preventDefault(); e.stopPropagation(); await downloadFile(file.fileUrl, file.fileName); }} className="p-1.5 sm:p-2 hover:bg-[#0a6a72] rounded-full transition-colors flex-shrink-0">
                                                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <File className="w-14 h-14 mb-3 opacity-30" />
                                <p className="text-xs sm:text-sm">No documents shared yet</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupInfoPanel;