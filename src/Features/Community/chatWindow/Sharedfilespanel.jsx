import React from 'react';
import { ArrowLeft, File, Image as ImageIcon, FolderOpen, Download } from 'lucide-react';

const SharedFilesPanel = ({
    setShowFilesPanel,
    sharedFilesPanelRef,
    accumulatedFiles,
    filesPage,
    loadingFiles,
    filesPagination,
    filesScrollSentinelRef,
    formatTime,
    formatFileSize,
}) => {
    const flattenFiles = (accumulated) => {
        const all = [];
        if (!Array.isArray(accumulated)) return all;
        accumulated.forEach(cf => {
            const fileList = cf.files || [];
            fileList.forEach(f => {
                const nameFromKey = f.file_key ? f.file_key.split('/').pop() : null;
                const nameFromUrl = f.file_url
                    ? f.file_url.split('?')[0].split('/').pop()
                    : null;
                all.push({
                    _id: cf._id,
                    fileName: f.fileName || nameFromKey || nameFromUrl || 'File',
                    fileUrl: f.file_url,
                    fileType: f.file_type,
                    fileSize: f.file_size,
                    senderName: cf.publisherName,
                    timestamp: cf.timestamp || cf.createdAt,
                });
            });
        });
        return all;
    };

    const allFiles = flattenFiles(accumulatedFiles);
    const imageFiles = allFiles.filter(f => f.fileType?.startsWith('image/'));
    const documentFiles = allFiles.filter(f => !f.fileType?.startsWith('image/'));

    return (
        <div className="flex-1 flex flex-col bg-[#0b141a]">
            <div className="bg-[#202c33] p-3 sm:p-4 flex items-center gap-3 border-b border-[#2a3942] flex-shrink-0">
                <button onClick={() => setShowFilesPanel(false)} className="hover:bg-[#0a6a72] p-2 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold">Shared Files</h2>
            </div>

            <div ref={sharedFilesPanelRef} className="flex-1 overflow-y-auto p-4">
                {filesPage === 1 && loadingFiles ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a884]" />
                    </div>
                ) : allFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <FolderOpen className="w-20 h-20 mb-4 opacity-30" />
                        <p className="text-lg mb-2">No files shared yet</p>
                        <p className="text-sm">Files shared in this chat will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {imageFiles.length > 0 && (
                            <div>
                                <h3 className="text-sm text-gray-400 mb-3 font-semibold flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" />
                                    Images ({filesPagination?.totalCount || imageFiles.length})
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {imageFiles.map((file, index) => (
                                        <div
                                            key={`${file._id}-${index}`}
                                            className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden bg-[#1f2f2a]"
                                            onClick={() => window.open(file.fileUrl, '_blank')}
                                        >
                                            <img
                                                src={file.fileUrl}
                                                alt={file.fileName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-2">
                                                <p className="text-xs text-white text-center truncate w-full px-2 mb-1">{file.fileName}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {documentFiles.length > 0 && (
                            <div>
                                <h3 className="text-sm text-gray-400 mb-3 font-semibold flex items-center gap-2">
                                    <File className="w-4 h-4" />
                                    Documents ({filesPagination?.totalCount || documentFiles.length})
                                </h3>
                                <div className="space-y-2">
                                    {documentFiles.map((file, index) => (
                                        <div
                                            key={`${file._id}-${index}`}
                                            className="flex items-center gap-3 p-3 bg-[#202c33] rounded-lg hover:bg-[#2a3942] transition-colors cursor-pointer"
                                            onClick={() => window.open(file.fileUrl, '_blank')}
                                        >
                                            <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                <File className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate text-white">{file.fileName}</p>
                                                <p className="text-xs text-gray-400">{file.senderName || 'Unknown'} • {formatTime(file.timestamp)}</p>
                                                {file.fileSize && <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>}
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); window.open(file.fileUrl, '_blank'); }}
                                                className="p-2 hover:bg-[#0a6a72] rounded-full transition-colors flex-shrink-0"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Infinite scroll sentinel */}
                        <div ref={filesScrollSentinelRef} className="py-2 flex justify-center">
                            {loadingFiles && filesPage > 1 && (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00a884]" />
                            )}
                            {!filesPagination?.hasNextPage && allFiles.length > 0 && (
                                <p className="text-xs text-gray-600">All files loaded</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedFilesPanel;