// src/features/zoom/ZoomMeetingForm.jsx
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { CheckCircle, Loader } from "lucide-react";

const validationSchema = Yup.object({
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters"),
  subTitle: Yup.string()
    .required("Sub Title is required")
    .min(3, "Sub Title must be at least 3 characters"),
  url: Yup.string().required("URL is required").url("Please enter a valid URL"),
  videoId: Yup.string()
    .required("Video ID is required")
    .min(1, "Video ID cannot be empty"),
  type: Yup.string().required("Meeting type is required"),
});

const MEETING_TYPES = [
  { value: "", label: "Select meeting type" },
  { value: "zoom meet", label: "Zoom Meet" },
  { value: "youtube", label: "YouTube" },
  { value: "google meet", label: "Google Meet" },
  { value: "social media", label: "Social Media" },
];

const FORM_FIELDS = [
  { name: "title", label: "Title", type: "text", placeholder: "Enter meeting title" },
  { name: "subTitle", label: "Sub Title", type: "text", placeholder: "Enter sub title" },
  { name: "url", label: "URL", type: "url", placeholder: "https://zoom.us/j/..." },
  { name: "videoId", label: "Video ID", type: "text", placeholder: "Enter video ID" },
];

const ZoomMeetingForm = ({
  initialValues = { title: "", subTitle: "", url: "", videoId: "", type: "" },
  onSubmit,
  isProcessing = false,
  submitLabel = "Create Meeting",
  processingLabel = "Creating...",
  showCancel = false,
  onCancel,
  layout = "single", // "single" or "grid"
}) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ isSubmitting, resetForm }) => (
        <Form className="space-y-4">
          <div className={layout === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
            {FORM_FIELDS.map((field) => (
              <FormField
                key={field.name}
                {...field}
                disabled={isProcessing}
              />
            ))}

            {/* Meeting Type Select */}
            <div>
              <label className="block text-sm font-medium text-[#b9fd5c] mb-2">
                Meeting Type <span className="text-red-400">*</span>
              </label>
              <Field
                as="select"
                name="type"
                disabled={isProcessing}
                className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                  py-2.5 px-4 text-sm focus:outline-none focus:border-[#b9fd5c]
                  focus:ring-1 focus:ring-[#b9fd5c]/30 transition-colors cursor-pointer"
              >
                {MEETING_TYPES.map((type) => (
                  <option key={type.value} value={type.value} className="bg-[#111214]">
                    {type.label}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="type" component="p" className="text-red-400 text-xs mt-1" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isProcessing}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                text-sm font-semibold text-white bg-[#b9fd5c] hover:bg-[#ff7b1c]
                transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting || isProcessing ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  {processingLabel}
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  {submitLabel}
                </>
              )}
            </button>

            {showCancel && onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                disabled={isProcessing}
                className="px-5 py-3 rounded-xl text-sm font-semibold text-white
                  bg-transparent border border-[#2a2c2f] hover:bg-[#2a2c2f]
                  transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => resetForm()}
                disabled={isProcessing}
                className="px-5 py-3 rounded-xl text-sm font-semibold text-white
                  bg-transparent border border-[#2a2c2f] hover:bg-[#2a2c2f]
                  transition-colors cursor-pointer disabled:opacity-50"
              >
                Clear
              </button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

// Reusable Form Field
const FormField = ({ name, label, type = "text", placeholder, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-[#b9fd5c] mb-2">
      {label} <span className="text-red-400">*</span>
    </label>
    <Field
      type={type}
      name={name}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full bg-[#111214] border text-white rounded-xl
        py-2.5 px-4 text-sm focus:outline-none transition-colors placeholder-[#555]
        border-[#2a2c2f] focus:border-[#b9fd5c] focus:ring-1 focus:ring-[#b9fd5c]/30
        disabled:opacity-50`}
    />
    <ErrorMessage name={name} component="p" className="text-red-400 text-xs mt-1" />
  </div>
);

export default ZoomMeetingForm;