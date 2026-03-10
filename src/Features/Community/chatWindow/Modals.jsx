import React from 'react';
import { X, Send, File, Trash2, AlertTriangle, Image as ImageIcon } from 'lucide-react';

// ── ClearChatModal ─────────────────────────────────────────────────────────────
export const ClearChatModal = ({ selectedGroup, onClearChat, setShowClearChatModal }) => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowClearChatModal(false)}>
        <div className="bg-[#202c33] rounded-lg max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-[#2a3942]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-[#202c33]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Clear Chat</h3>
                        <p className="text-xs text-gray-400">{selectedGroup?.name}</p>
                    </div>
                </div>
            </div>
            <div className="p-4">
                <div className="mb-4 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-semibold text-white mb-1">This action cannot be undone</p>
                        <p className="text-xs text-white">All messages, media, and files will be permanently deleted from your view.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowClearChatModal(false)} className="flex-1 bg-[#0b141a] hover:bg-[#1a2730] text-white py-2.5 rounded-lg font-medium text-sm transition-colors">Cancel</button>
                    <button onClick={onClearChat} className="flex-1 bg-[#b9fd5c] text-black py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" />Clear Chat
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ── FileTypeModal ──────────────────────────────────────────────────────────────
export const FileTypeModal = ({ setShowFileTypeModal, fileInputRef }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-[#b9fd5c] border border-[#1e7f85] p-6">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-black">Select file type</h3>
                <button onClick={() => setShowFileTypeModal(false)} className="p-2 rounded-full hover:bg-white/10 transition">
                    <X className="w-5 h-5 text-black" />
                </button>
            </div>
            <div className="space-y-3">
                <button
                    onClick={() => {
                        fileInputRef?.current?.setAttribute("accept", "image/*");
                        fileInputRef?.current?.setAttribute("multiple", "true");
                        fileInputRef?.current?.click();
                        setShowFileTypeModal(false);
                    }}
                    className="group w-full flex items-center gap-4 rounded-xl bg-[#000000] p-4 transition active:scale-[0.97]"
                >
                    <div className="w-12 h-12 rounded-full bg-[#b9fd5c] flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="text-base font-medium text-white">Images</div>
                        <div className="text-sm text-[#d1f5f7]">Send images from your device</div>
                    </div>
                </button>
                <button
                    onClick={() => {
                        fileInputRef?.current?.setAttribute("accept", "application/pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx,.zip,.rar");
                        fileInputRef?.current?.removeAttribute("multiple");
                        fileInputRef?.current?.click();
                        setShowFileTypeModal(false);
                    }}
                    className="group w-full flex items-center gap-4 rounded-xl bg-[#000000] p-4 transition active:scale-[0.97]"
                >
                    <div className="w-12 h-12 rounded-full bg-[#b9fd5c] flex items-center justify-center">
                        <File className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="text-base font-medium text-white">Documents</div>
                        <div className="text-sm text-[#d1f5f7]">PDFs, Word, Excel, PowerPoint files</div>
                    </div>
                </button>
            </div>
        </div>
    </div>
);

// ── ImagePreviewModal ──────────────────────────────────────────────────────────
export const ImagePreviewModal = ({ selectedImages, imageCaption, setImageCaption, sendImageMessage, cancelImageUpload, removeImage, formatFileSize, uploadingFile }) => (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-[#2a3942]">
            <button onClick={cancelImageUpload} className="text-white hover:bg-white/10 p-2 rounded-full transition"><X className="w-6 h-6" /></button>
            <h3 className="text-lg font-semibold text-white">{selectedImages.length} {selectedImages.length === 1 ? 'Photo' : 'Photos'}</h3>
            <div className="w-10" />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-4xl mx-auto">
                {selectedImages.map((img, index) => (
                    <div key={index} className="relative group aspect-square">
                        <img src={img.preview} alt={img.name} className="w-full h-full object-cover rounded-lg" />
                        <button onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 rounded-b-lg">
                            <p className="truncate">{img.name}</p>
                            <p className="text-gray-300">{formatFileSize(img.size)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="bg-[#202c33] p-4 border-t border-[#2a3942]">
            <div className="max-w-4xl mx-auto space-y-3">
                <input
                    type="text" value={imageCaption} onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="Add a caption..." maxLength={1000}
                    className="w-full px-4 py-3 bg-[#2a3942] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884] placeholder-gray-400"
                />
                <button onClick={sendImageMessage} disabled={uploadingFile} className="w-full bg-[#00a884] hover:bg-[#008069] disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2">
                    {uploadingFile ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Sending...</> : <><Send className="w-5 h-5" />Send {selectedImages.length} {selectedImages.length === 1 ? 'Photo' : 'Photos'}</>}
                </button>
            </div>
        </div>
    </div>
);

// ── DocumentPreviewModal ───────────────────────────────────────────────────────
export const DocumentPreviewModal = ({ selectedDocument, cancelDocumentUpload, sendDocumentMessage, formatFileSize, uploadingFile, uploadProgress }) => (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-[#202c33] rounded-lg w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-[#2a3942] flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Send Document</h3>
                <button onClick={cancelDocumentUpload} className="text-gray-400 hover:text-white transition"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6">
                <div className="flex items-center gap-4 p-4 bg-[#0b141a] rounded-lg mb-4">
                    <div className="w-16 h-16 rounded-lg bg-blue-500/20 flex items-center justify-center text-4xl flex-shrink-0">{selectedDocument.icon}</div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate text-lg">{selectedDocument.name}</p>
                        <p className="text-sm text-gray-400">{formatFileSize(selectedDocument.size)}</p>
                        <p className="text-xs text-gray-500 mt-1">{selectedDocument.type || 'Document'}</p>
                    </div>
                </div>
                {uploadingFile && uploadProgress > 0 && (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1 text-gray-300">
                            <span>Uploading...</span><span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-[#0b141a] rounded-full h-2">
                            <div className="bg-[#00a884] h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                    </div>
                )}
                <button onClick={sendDocumentMessage} disabled={uploadingFile} className="w-full bg-[#00a884] hover:bg-[#008069] disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2">
                    {uploadingFile ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Sending...</> : <><Send className="w-5 h-5" />Send Document</>}
                </button>
            </div>
        </div>
    </div>
);

// ── ReportModal ────────────────────────────────────────────────────────────────
export const ReportModal = ({ reportingMessage, reportReason, setReportReason, reportDescription, setReportDescription, submitReport, onClose }) => (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2">
        <div className="bg-[#202c33] rounded-lg w-full max-w-sm">
            <div className="p-3 border-b border-[#2a3942] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Report Message</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-3 space-y-3">
                <div className="p-2 bg-[#0b141a] rounded-md border border-[#2a3942]">
                    <p className="text-[11px] text-gray-400 mb-1">Message from {reportingMessage.publisherName || reportingMessage.senderName}</p>
                    <p className="text-xs text-gray-200 break-words">{reportingMessage.msgBody?.message || "Media message"}</p>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Why are you reporting this? *</label>
                    <div className="space-y-1">
                        {['spam', 'harassment', 'violence', 'inappropriate', 'other'].map((val) => (
                            <label key={val} className={`flex items-center gap-2 p-2 rounded-md cursor-pointer text-xs ${reportReason === val ? 'bg-[#00a884]/20 border border-[#00a884]' : 'bg-[#0b141a] hover:bg-[#1a2730]'}`}>
                                <input type="radio" name="reportReason" value={val} checked={reportReason === val} onChange={(e) => setReportReason(e.target.value)} className="w-3 h-3 text-[#00a884]" />
                                <span className="text-gray-200 capitalize">{val}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Additional details (optional)</label>
                    <textarea value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} placeholder="More details..." rows={2} maxLength={500}
                        className="w-full p-2 bg-[#0b141a] text-xs text-white rounded-md border border-[#2a3942] focus:ring-1 focus:ring-[#00a884] resize-none" />
                    <p className="text-[10px] text-gray-500 text-right">{reportDescription.length}/500</p>
                </div>
                <div className="flex items-start gap-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded-md">
                    <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5" />
                    <p className="text-[10px] text-orange-200">False reports may result in action on your account.</p>
                </div>
                <div className="flex gap-2 pt-1">
                    <button onClick={onClose} className="flex-1 py-2 bg-[#0b141a] hover:bg-[#1a2730] text-xs text-white rounded-md">Cancel</button>
                    <button onClick={submitReport} disabled={!reportReason} className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-xs text-white rounded-md">Submit</button>
                </div>
            </div>
        </div>
    </div>
);