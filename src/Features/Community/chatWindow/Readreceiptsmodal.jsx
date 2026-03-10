import React from 'react';
import { X, CheckCheck, Eye } from 'lucide-react';

const ReadReceiptsModal = ({ selectedMessageForReceipts, members, currentUser, formatTime, onClose }) => {
    const readByIds = selectedMessageForReceipts.metaData?.readBy?.map(r => r.userId) || [];
    const unreadMembers = members?.filter(m => m.id !== currentUser?.id && !readByIds.includes(m.id)) || [];

    return (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-[#202c33] rounded-lg max-w-md w-full max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-[#2a3942] flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Read by</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {readByIds.length > 0 ? (
                        <div className="space-y-3">
                            {selectedMessageForReceipts.metaData.readBy.map(readInfo => {
                                const member = members?.find(m => m.id === readInfo.userId);
                                return (
                                    <div key={readInfo.userId} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                            {member?.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">{member?.name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-400">{readInfo.readAt ? formatTime(readInfo.readAt) : 'Just now'}</p>
                                        </div>
                                        <CheckCheck className="w-5 h-5 text-[#53bdeb]" />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <Eye className="w-12 h-12 mb-3 opacity-30" />
                            <p>No one has read this message yet</p>
                        </div>
                    )}

                    {unreadMembers.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-sm text-gray-400 mb-3 font-semibold">Delivered to</h4>
                            <div className="space-y-3">
                                {unreadMembers.map(member => (
                                    <div key={member.id} className="flex items-center gap-3 opacity-60">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                            {member.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">{member.name}</p>
                                            <p className="text-xs text-gray-400">Not read yet</p>
                                        </div>
                                        <CheckCheck className="w-5 h-5 text-gray-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReadReceiptsModal;