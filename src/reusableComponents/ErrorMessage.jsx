// components/common/ErrorMessage.jsx
const ErrorMessage = ({ error }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-6">
    <div className="flex items-center">
      <span className="text-3xl mr-3">⚠️</span>
      <div>
        <h3 className="text-red-800 font-semibold mb-1">Error Loading Data</h3>
        <p className="text-red-600 text-sm">
          {error?.data?.message || "Something went wrong. Please try again."}
        </p>
      </div>
    </div>
  </div>
);

export default ErrorMessage;