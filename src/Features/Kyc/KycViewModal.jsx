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
        {/* Document Preview */}
{(data.aadhar_doc_front || data.aadhar_doc_back || data.pan_doc_front) && (
  <div>
    <p className="text-xs font-medium text-[#8a8d93] mb-3 uppercase tracking-wider">
      Identity Documents
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {data.aadhar_doc_front && (
        <DocumentPreview 
          label="Aadhar Front" 
          url={data.aadhar_doc_front} 
        />
      )}
      {data.aadhar_doc_back && (
        <DocumentPreview 
          label="Aadhar Back" 
          url={data.aadhar_doc_back} 
        />
      )}
      {data.pan_doc_front && (
        <DocumentPreview 
          label="PAN Card Front" 
          url={data.pan_doc_front} 
        />
      )}
    </div>
  </div>
)}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field, i) => (
            <ReadOnlyField key={i} label={field.label} value={field.value} />
          ))}
        </div>



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
      hover:border-[#b9fd5c]/50 transition-all group shadow-lg"
  >
    <div className="relative w-full h-40 bg-[#1a1c1e] flex items-center justify-center">
      <img
        src={url}
        alt={label}
        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    </div>
    <div className="bg-[#1a1c1e] border-t border-[#2a2c2f] py-2">
       <p className="text-[10px] font-bold text-[#8a8d93] text-center uppercase tracking-widest group-hover:text-[#b9fd5c]">
         {label}
       </p>
    </div>
  </a>
);

export default KycViewModal;