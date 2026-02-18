import React, { useState } from "react";
import { useAddManualKycMutation } from "./manualKycApiSlice";
import { toast } from "react-toastify";
import { FileText, User, Building2, Info } from "lucide-react";
import InputField from "../../reusableComponents/Inputs/InputField";
import TextareaField from "../../reusableComponents/Inputs/TextareaField";
import SectionCard from "../../reusableComponents/Cards/SectionCard";
import DocumentUpload from "../../reusableComponents/Inputs/DocumentUpload";
import Alert from "../../reusableComponents/Alerts/Alerts";
import SubmitButton from "../../reusableComponents/Buttons/SubmitButton";

const ManualKycAccounts = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    mobile_number: "",
    dob: "",
    panNumber: "",
    aadhar_doc_front: null,
    aadhar_doc_back: null,
    pan_doc_front: null,
    bank_name: "",
    bank_account: "",
    ifsc_code: "",
    upi_id: "",
    address: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [previews, setPreviews] = useState({
    aadhar_doc_front: null,
    aadhar_doc_back: null,
    pan_doc_front: null,
  });

  const [addManualKyc, { isLoading }] = useAddManualKycMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (apiError) setApiError(null);
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(file);

      if (apiError) setApiError(null);
    }
  };

  const removeFile = (fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
    setPreviews((prev) => ({ ...prev, [fieldName]: null }));
    if (apiError) setApiError(null);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      name: "",
      mobile_number: "",
      dob: "",
      panNumber: "",
      aadhar_doc_front: null,
      aadhar_doc_back: null,
      pan_doc_front: null,
      bank_name: "",
      bank_account: "",
      ifsc_code: "",
      upi_id: "",
      address: "",
      reason: "",
    });
    setPreviews({
      aadhar_doc_front: null,
      aadhar_doc_back: null,
      pan_doc_front: null,
    });
    setErrors({});
    setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);

    const requiredFields = [
      "username",
      "name",
      "mobile_number",
      "bank_name",
      "bank_account",
      "ifsc_code",
      "address",
    ];
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = `${field.replace(/_/g, " ")} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          submitData.append(key, formData[key]);
        }
      });

      const response = await addManualKyc(submitData).unwrap();
      toast.success(response?.message || "KYC submitted successfully!");
      resetForm();
    } catch (error) {
      if (error?.status === 409 || error?.data?.success === 0) {
        const msg = error?.data?.message || "An error occurred";
        setApiError(msg);
        toast.error(msg);
      } else if (error?.data && typeof error.data === "object") {
        const fieldErrors = {};
        Object.entries(error.data).forEach(([key, val]) => {
          fieldErrors[key] = val?.message || val;
        });
        setErrors(fieldErrors);
        toast.error(Object.values(fieldErrors)[0] || "Validation failed");
      } else {
        toast.error(error?.data?.message || "Failed to submit KYC");
      }
    }
  };

  // Progress indicator
  const filledFields = Object.values(formData).filter(
    (v) => v !== null && v !== ""
  ).length;
  const totalFields = Object.keys(formData).length;
  const progress = Math.round((filledFields / totalFields) * 100);

  return (

    <div className="p-1 sm:p-2">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="text-xl font-bold text-white">
                Manual KYC Submission
              </h1>
             
            </div>
          </div>

          {/* Progress */}
          
        </div>

        {/* API Error */}
        {apiError && (
          <Alert
            type="error"
            message={apiError}
            onClose={() => setApiError(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Information */}
          <div className="bg-[#282f35] border border-[#2a2c2f] rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2a2c2f]">
              <div className="w-8 h-8 rounded-lg bg-[#b9fd5c]/15 flex items-center justify-center">
                <User size={16} className="text-[#b9fd5c]" />
              </div>
              <h2 className="text-base font-semibold text-white">
                Personal Information
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  error={errors.username}
                  required
                />
                <InputField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  error={errors.name}
                  required
                />
                <InputField
                  label="Mobile Number"
                  name="mobile_number"
                  type="tel"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  error={errors.mobile_number}
                  required
                />
                <InputField
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="PAN Number"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                  error={errors.panNumber}
                   required
                />
              </div>
              <div className="mt-4">
                <TextareaField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  error={errors.address}
                  rows={2}
                  required
                />
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="bg-[#282f35] border border-[#2a2c2f] rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2a2c2f]">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <FileText size={16} className="text-[#b9fd5c]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Document Upload
                </h2>
                <p className="text-xs text-[#8a8d93]">
                  Max 5MB per file • JPG, PNG supported
                </p>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <DocumentUpload
                  label="Aadhar Front"
                  name="aadhar_doc_front"
                  preview={previews.aadhar_doc_front}
                  fileName={formData.aadhar_doc_front?.name}
                  onFileChange={handleFileChange}
                  onRemove={() => removeFile("aadhar_doc_front")}
                  
                />
                <DocumentUpload
                  label="Aadhar Back"
                  name="aadhar_doc_back"
                  preview={previews.aadhar_doc_back}
                  fileName={formData.aadhar_doc_back?.name}
                  onFileChange={handleFileChange}
                  onRemove={() => removeFile("aadhar_doc_back")}
                />
                <DocumentUpload
                  label="PAN Card"
                  name="pan_doc_front"
                  preview={previews.pan_doc_front}
                  fileName={formData.pan_doc_front?.name}
                  onFileChange={handleFileChange}
                  onRemove={() => removeFile("pan_doc_front")}
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-[#282f35] border border-[#2a2c2f] rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2a2c2f]">
              <div className="w-8 h-8 rounded-lg bg-[#b9fd5c]/15 flex items-center justify-center">
                <Building2 size={16} className="text-[#b9fd5c]" />
              </div>
              <h2 className="text-base font-semibold text-white">
                Bank Details
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Bank Name"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  placeholder="Enter bank name"
                  error={errors.bank_name}
                  required
                />
                <InputField
                  label="Account Number"
                  name="bank_account"
                  value={formData.bank_account}
                  onChange={handleChange}
                  placeholder="Enter account number"
                  error={errors.bank_account}
                  required
                />
                <InputField
                  label="IFSC Code"
                  name="ifsc_code"
                  value={formData.ifsc_code}
                  onChange={handleChange}
                  placeholder="Enter IFSC code"
                  error={errors.ifsc_code}
                  required
                />
                <InputField
                  label="UPI ID"
                  name="upi_id"
                  value={formData.upi_id}
                  onChange={handleChange}
                  placeholder="example@upi"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-[#282f35] border border-[#2a2c2f] rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2a2c2f]">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                <Info size={16} className="text-[#b9fd5c]" />
              </div>
              <h2 className="text-white font-semibold ">
                Additional Information
              </h2>
            </div>
            <div className="p-5">
              <TextareaField
                label="Reason for Manual KYC"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Enter reason for manual KYC submission..."
                rows={4}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className="flex flex-col-reverse sm:flex-row items-center gap-3 justify-end 
               rounded-lg px-5 py-4"
          >
            <button
              type="button"
              onClick={resetForm}
              className="w-full sm:w-auto bg-[#111214] hover:bg-[#2a2c2f] text-[#8a8d93] 
                hover:text-white border border-[#2a2c2f] px-8 py-2 rounded-lg text-sm 
                font-medium transition-colors cursor-pointer"
            >
              Reset Form
            </button>
            <div className="w-full sm:w-auto">
              <SubmitButton
                label="Submit KYC"
                loadingLabel="Submitting..."
                isLoading={isLoading || !!apiError}
                fullWidth
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualKycAccounts;