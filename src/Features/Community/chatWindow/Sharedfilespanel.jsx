import React from 'react';
import { ArrowLeft, FolderOpen, File, Image as ImageIcon, Download } from 'lucide-react';

const SharedFilesPanel = ({ chatFiles, loadingFiles, formatTime, formatFileSize, setShowFilesPanel }) => {

    const downloadFile = async (fileUrl, fileName) => {
        try {
            const res = await fetch(fileUrl, { mode: 'cors' });
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName || 'download';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 100);
        } catch {
            window.open(fileUrl, '_blank');
        }
    };

    const allFiles = [];
    chatFiles?.forEach(chatFile => {
        if (chatFile.files && Array.isArray(chatFile.files)) {
            chatFile.files.forEach(file => {
                allFiles.push({
                    _id: chatFile._id,
                    fileName: file.fileName,
                    fileUrl: file.file_url,
                    fileType: file.file_type,
                    fileSize: file.file_size,
                    senderName: chatFile.publisherName,
                    timestamp: chatFile.timestamp || chatFile.createdAt,
                });
            });
        }
    });

    const imageFiles    = allFiles.filter(f => f.fileType?.startsWith('image/'));
    const documentFiles = allFiles.filter(f => !f.fileType?.startsWith('image/'));

    return (
        <div className="flex-1 flex flex-col bg-[#0b141a]">
            {/* Header */}
            <div className="bg-[#202c33] p-3 sm:p-4 flex items-center gap-3 border-b border-[#2a3942]">
                <button onClick={() => setShowFilesPanel(false)} className="hover:bg-[#0a6a72] p-2 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold">Shared Files</h2>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4">
                {loadingFiles ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a884] mx-auto mb-4" />
                            <p>Loading files...</p>
                        </div>
                    </div>
                ) : allFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <FolderOpen className="w-20 h-20 mb-4 opacity-30" />
                        <p className="text-lg mb-2">No files shared yet</p>
                        <p className="text-sm">Files shared in this chat will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Images */}
                        {imageFiles.length > 0 && (
                            <div>
                                <h3 className="text-sm text-gray-400 mb-3 font-semibold flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" /> Images ({imageFiles.length})
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {imageFiles.map((file, i) => (
                                        <div key={`${file._id}-${i}`} className="relative group cursor-pointer" onClick={() => window.open(file.fileUrl, '_blank')}>
                                            <div className="w-full aspect-square rounded-lg overflow-hidden bg-[#1f2f2a]">
                                                <img src={file.fileUrl} alt={file.fileName} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                                            </div>
                                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-2">
                                                <p className="text-xs text-white text-center truncate w-full px-2 mb-1">{file.fileName}</p>
                                                <p className="text-xs text-gray-300">{file.senderName || 'Unknown'}</p>
                                                <p className="text-xs text-gray-400">{formatTime(file.timestamp)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Documents */}
                        {documentFiles.length > 0 && (
                            <div>
                                <h3 className="text-sm text-gray-400 mb-3 font-semibold flex items-center gap-2">
                                    <File className="w-4 h-4" /> Documents ({documentFiles.length})
                                </h3>
                                <div className="space-y-2">
                                    {documentFiles.map((file, i) => (
                                        <div key={`${file._id}-${i}`} className="flex items-center gap-3 p-3 bg-[#202c33] rounded-lg hover:bg-[#2a3942] transition-colors cursor-pointer" onClick={() => window.open(file.fileUrl, '_blank')}>
                                            <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                <File className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate text-white">{file.fileName}</p>
                                                <p className="text-xs text-gray-400">{file.senderName || 'Unknown'} • {formatTime(file.timestamp)}</p>
                                                {file.fileSize && <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>}
                                            </div>
                                            <button onClick={async (e) => { e.stopPropagation(); await downloadFile(file.fileUrl, file.fileName); }} className="p-2 hover:bg-[#0a6a72] rounded-full transition-colors flex-shrink-0">
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {imageFiles.length === 0 && documentFiles.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <FolderOpen className="w-16 h-16 mb-3 opacity-30" />
                                <p>No files found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedFilesPanel;