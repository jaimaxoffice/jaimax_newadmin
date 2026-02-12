// src/features/kyc/KycViewModal.jsx
import React from "react";
import Modal from "../../reusableComponents/Modals/Modals";
import ReadOnlyField from "../../reusableComponents/Inputs/ReadOnlyField";

const KycViewModal = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  const fields = [
    { label: "Name", value: data.name },
    { label: "User ID", value: data.user_id?.username },
    { label: "Bank Name", value: data.bank_name },
    { label: "Bank Account", value: data.bank_account },
    { label: "IFSC Code", value: data.ifsc_code },
    { label: "Address", value: data.address },
    { label: "Mobile Number", value: data.mobile_number },
    { label: "UPI ID", value: data.upi_id },
    {
      label: "Status",
      value:
        data.status === "open"
          ? "In Open"
          : data.status === "approve"
          ? "Approved"
          : data.status === "inprogress"
          ? "In Progress"
          : data.status === "reject"
          ? "Rejected"
          : "N/A",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="KYC Details" size="lg">
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field, i) => (
            <ReadOnlyField key={i} label={field.label} value={field.value} />
          ))}
        </div>

        {/* Document Preview */}
        {(data.front_image || data.back_image || data.selfie_image) && (
          <div>
            <p className="text-xs font-medium text-[#8a8d93] mb-3">
              Documents
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.front_image && (
                <DocumentPreview label="Front" url={data.front_image} />
              )}
              {data.back_image && (
                <DocumentPreview label="Back" url={data.back_image} />
              )}
              {data.selfie_image && (
                <DocumentPreview label="Selfie" url={data.selfie_image} />
              )}
            </div>
          </div>
        )}

        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="bg-[#2a2c2f] hover:bg-[#333] text-white px-6 py-2.5 
              rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

const DocumentPreview = ({ label, url }) => (
  <a
    href={url}
    target="_blank"
    rel="noreferrer"
    className="block bg-[#111214] border border-[#2a2c2f] rounded-xl overflow-hidden 
      hover:border-[#0ecb6f]/30 transition-colors group"
  >
    <img
      src={url}
      alt={label}
      className="w-full h-32 object-cover group-hover:opacity-90 transition-opacity"
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
    <p className="text-xs text-[#8a8d93] text-center py-2">{label}</p>
  </a>
);

export default KycViewModal;