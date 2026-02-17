// // src/features/manualAccounts/AddManualAccountsForm.jsx
// import React, { useState } from "react";
// import { useAddManualAccountsMutation } from "./manualAccountsApiSlice";
// import FormCard from "../../reusableComponents/cards/FormCard";
// import InputField from "../../reusableComponents/Inputs/InputField";
// import FileUpload from "../../reusableComponents/Inputs/FileUpload";
// import Alert from "../../reusableComponents/Alerts/Alerts";
// import SubmitButton from "../../reusableComponents/Buttons/SubmitButton";

// const AddManualAccountsForm = () => {
//   const [formData, setFormData] = useState({
//     username: "",
//     transactionId: "",
//     transactionAmount: "",
//     utrRef: "",
//   });
//   const [screenshot, setScreenshot] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [errors, setErrors] = useState({});

//   const [addManualAccounts, { isLoading, isSuccess, isError, error, reset }] =
//     useAddManualAccountsMutation();

//   // Handle Change
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: "" }));
//     }
//   };

//   // Handle File
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const allowedTypes = [
//         "image/jpeg",
//         "image/png",
//         "image/jpg",
//         "image/webp",
//       ];
//       if (!allowedTypes.includes(file.type)) {
//         setErrors((prev) => ({
//           ...prev,
//           screenshot: "Please upload a valid image (JPG, PNG, WEBP)",
//         }));
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         setErrors((prev) => ({
//           ...prev,
//           screenshot: "File size should be less than 5MB",
//         }));
//         return;
//       }
//       setScreenshot(file);
//       setPreviewUrl(URL.createObjectURL(file));
//       setErrors((prev) => ({ ...prev, screenshot: "" }));
//     }
//   };

//   // Remove File
//   const removeFile = () => {
//     setScreenshot(null);
//     setPreviewUrl(null);
//   };

//   // Validate
//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.username) newErrors.username = "User Name is required";
//     if (!formData.utrRef) newErrors.utrRef = "UTR Number is required";
//     if (!formData.transactionId)
//       newErrors.transactionId = "Transaction ID is required";
//     if (!formData.transactionAmount) {
//       newErrors.transactionAmount = "Amount is required";
//     } else if (
//       isNaN(formData.transactionAmount) ||
//       Number(formData.transactionAmount) <= 0
//     ) {
//       newErrors.transactionAmount = "Enter a valid amount";
//     }
//     if (!screenshot) newErrors.screenshot = "Screenshot is required";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     reset();
//     if (!validateForm()) return;

//     const formDataToSend = new FormData();
//     formDataToSend.append("username", formData.username);
//     formDataToSend.append("transactionId", formData.transactionId);
//     formDataToSend.append("transactionAmount", formData.transactionAmount);
//     formDataToSend.append("utrRef", formData.utrRef);
//     formDataToSend.append("screenshot", screenshot);

//     try {
//       await addManualAccounts(formDataToSend).unwrap();
//       setFormData({
//         username: "",
//         transactionId: "",
//         transactionAmount: "",
//         utrRef: "",
//       });
//       removeFile();
//     } catch (err) {
//       console.error("Failed to add manual account:", err);
//     }
//   };

//   return (
//     <div className="p-2 sm:p-2">
//       <div className="max-w-4xl mx-auto">
//         <FormCard
//           title="Add Screenshot Transaction"
//           subtitle="Enter transaction details and upload screenshot"
//         >
//           {/* Alerts */}
//           <div className="space-y-3 mb-6">
//             {isSuccess && (
//               <Alert
//                 type="success"
//                 message="Transaction added successfully!"
//                 onClose={reset}
//               />
//             )}
//             {isError && (
//               <Alert
//                 type="error"
//                 message={
//                   error?.data?.message || "Failed to add transaction."
//                 }
//                 onClose={reset}
//               />
//             )}
//           </div>

//           <form onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Left Column - Fields */}
//               <div className="space-y-4">
//                 <InputField
//                   label="User Name"
//                   name="username"
//                   value={formData.username}
//                   onChange={handleChange}
//                   placeholder="JAIMAX ..."
//                   error={errors.username}
//                   required
//                 />

//                 <InputField
//                   label="UTR Number"
//                   name="utrRef"
//                   value={formData.utrRef}
//                   onChange={handleChange}
//                   placeholder="Enter UTR No"
//                   error={errors.utrRef}
//                   required
//                 />

//                 <InputField
//                   label="Transaction ID"
//                   name="transactionId"
//                   value={formData.transactionId}
//                   onChange={handleChange}
//                   placeholder="TXN_20260112_001"
//                   error={errors.transactionId}
//                   required
//                 />

//                 <InputField
//                   label="Amount"
//                   name="transactionAmount"
//                   type="number"
//                   value={formData.transactionAmount}
//                   onChange={handleChange}
//                   placeholder="0"
//                   error={errors.transactionAmount}
//                   required
//                   prefix="₹"
//                 />
//               </div>

//               {/* Right Column - File Upload */}
//               <div className="flex flex-col">
//                 <FileUpload
//                   label="Screenshot"
//                   file={screenshot}
//                   previewUrl={previewUrl}
//                   onFileChange={handleFileChange}
//                   onRemove={removeFile}
//                   error={errors.screenshot}
//                   required
//                 />
//               </div>
//             </div>

//             {/* Submit */}
//             <div className="mt-6">
//               <SubmitButton
//                 label="Add Transaction"
//                 loadingLabel="Processing..."
//                 isLoading={isLoading}
//               />
//             </div>
//           </form>
//         </FormCard>
//       </div>
//     </div>
//   );
// };

// export default AddManualAccountsForm;




// src/features/manualAccounts/AddManualAccountsForm.jsx
import React, { useState } from "react";
import { useAddManualAccountsMutation } from "./manualAccountsApiSlice";
import { FileText, Upload } from "lucide-react";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

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

  const removeFile = () => {
    setScreenshot(null);
    setPreviewUrl(null);
  };

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

  // Progress
  const filledFields = [
    formData.username,
    formData.transactionId,
    formData.transactionAmount,
    formData.utrRef,
    screenshot,
  ].filter(Boolean).length;
  const progress = Math.round((filledFields / 5) * 100);

  return (
    <div className="p-1 sm:p-2">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="text-xl font-bold text-white">
                Add Screenshot Transaction
              </h1>
              <p className="text-sm text-[#8a8d93]">
                Enter transaction details and upload screenshot
              </p>
            </div>
          </div>

          {/* Progress */}
          
        </div>

        {/* Alerts */}
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
            message={error?.data?.message || "Failed to add transaction."}
            onClose={reset}
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left - Fields */}
            <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2a2c2f]">
                <div className="w-8 h-8 rounded-lg bg-[#eb660f]/15 flex items-center justify-center">
                  <FileText size={16} className="text-[#eb660f]" />
                </div>
                <h2 className="text-base font-semibold text-white">
                  Transaction Details
                </h2>
              </div>
              <div className="p-5 space-y-4">
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
            </div>

            {/* Right - Upload */}
            <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2a2c2f]">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                  <Upload size={16} className="text-[#eb660f]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Screenshot
                  </h2>
                  <p className="text-xs text-[#8a8d93]">
                    Max 5MB • JPG, PNG, WEBP
                  </p>
                </div>
              </div>
              <div className="p-5 h-[calc(100%-65px)] flex flex-col">
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
          </div>

          {/* Submit */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-3 justify-end 
            bg-[#1b232d] border border-[#2a2c2f] rounded-2xl px-5 py-4"
          >
            <button
              type="button"
              onClick={() => {
                setFormData({
                  username: "",
                  transactionId: "",
                  transactionAmount: "",
                  utrRef: "",
                });
                removeFile();
                setErrors({});
                reset();
              }}
              className="w-full sm:w-auto bg-[#111214] hover:bg-[#2a2c2f] text-[#8a8d93] 
                hover:text-white border border-[#2a2c2f] px-8 py-2 rounded-xl text-sm 
                font-medium transition-colors cursor-pointer"
            >
              Reset Form
            </button>
            <div className="w-full sm:w-auto">
              <SubmitButton
                label="Add Transaction"
                loadingLabel="Processing..."
                isLoading={isLoading}
                fullWidth
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddManualAccountsForm;