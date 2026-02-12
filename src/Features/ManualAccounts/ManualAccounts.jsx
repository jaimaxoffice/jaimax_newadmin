// src/features/manualAccounts/AddManualAccountsForm.jsx
import React, { useState } from "react";
import { useAddManualAccountsMutation } from "./manualAccountsApiSlice";
import FormCard from "../../reusableComponents/cards/FormCard";
import InputField from "../../reusableComponents/Inputs/InputField";
import FileUpload from "../../reusableComponents/Inputs/FileUpload";
import Alert from "../../reusableComponents/Alerts/Alerts";
import SubmitButton from "../../reusableComponents/Buttons/SubmitButton";

const AddManualAccountsForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    transactionId: "",
    transactionAmount: "",
    utrRef: "",
  });
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});

  const [addManualAccounts, { isLoading, isSuccess, isError, error, reset }] =
    useAddManualAccountsMutation();

  // Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle File
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          screenshot: "Please upload a valid image (JPG, PNG, WEBP)",
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          screenshot: "File size should be less than 5MB",
        }));
        return;
      }
      setScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, screenshot: "" }));
    }
  };

  // Remove File
  const removeFile = () => {
    setScreenshot(null);
    setPreviewUrl(null);
  };

  // Validate
  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "User Name is required";
    if (!formData.utrRef) newErrors.utrRef = "UTR Number is required";
    if (!formData.transactionId)
      newErrors.transactionId = "Transaction ID is required";
    if (!formData.transactionAmount) {
      newErrors.transactionAmount = "Amount is required";
    } else if (
      isNaN(formData.transactionAmount) ||
      Number(formData.transactionAmount) <= 0
    ) {
      newErrors.transactionAmount = "Enter a valid amount";
    }
    if (!screenshot) newErrors.screenshot = "Screenshot is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    reset();
    if (!validateForm()) return;

    const formDataToSend = new FormData();
    formDataToSend.append("username", formData.username);
    formDataToSend.append("transactionId", formData.transactionId);
    formDataToSend.append("transactionAmount", formData.transactionAmount);
    formDataToSend.append("utrRef", formData.utrRef);
    formDataToSend.append("screenshot", screenshot);

    try {
      await addManualAccounts(formDataToSend).unwrap();
      setFormData({
        username: "",
        transactionId: "",
        transactionAmount: "",
        utrRef: "",
      });
      removeFile();
    } catch (err) {
      console.error("Failed to add manual account:", err);
    }
  };

  return (
    <div className="p-2 sm:p-2">
      <div className="max-w-4xl mx-auto">
        <FormCard
          title="Add Screenshot Transaction"
          subtitle="Enter transaction details and upload screenshot"
        >
          {/* Alerts */}
          <div className="space-y-3 mb-6">
            {isSuccess && (
              <Alert
                type="success"
                message="Transaction added successfully!"
                onClose={reset}
              />
            )}
            {isError && (
              <Alert
                type="error"
                message={
                  error?.data?.message || "Failed to add transaction."
                }
                onClose={reset}
              />
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Fields */}
              <div className="space-y-4">
                <InputField
                  label="User Name"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="JAIMAX ..."
                  error={errors.username}
                  required
                />

                <InputField
                  label="UTR Number"
                  name="utrRef"
                  value={formData.utrRef}
                  onChange={handleChange}
                  placeholder="Enter UTR No"
                  error={errors.utrRef}
                  required
                />

                <InputField
                  label="Transaction ID"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleChange}
                  placeholder="TXN_20260112_001"
                  error={errors.transactionId}
                  required
                />

                <InputField
                  label="Amount"
                  name="transactionAmount"
                  type="number"
                  value={formData.transactionAmount}
                  onChange={handleChange}
                  placeholder="0"
                  error={errors.transactionAmount}
                  required
                  prefix="₹"
                />
              </div>

              {/* Right Column - File Upload */}
              <div className="flex flex-col">
                <FileUpload
                  label="Screenshot"
                  file={screenshot}
                  previewUrl={previewUrl}
                  onFileChange={handleFileChange}
                  onRemove={removeFile}
                  error={errors.screenshot}
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6">
              <SubmitButton
                label="Add Transaction"
                loadingLabel="Processing..."
                isLoading={isLoading}
              />
            </div>
          </form>
        </FormCard>
      </div>
    </div>
  );
};

export default AddManualAccountsForm;