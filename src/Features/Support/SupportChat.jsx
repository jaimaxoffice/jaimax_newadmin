// src/features/support/SupportChart.jsx
import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useChatGetQuery,
  useCreateCommentMutation,
} from "../features/support/supportApiSlice";
import DashboardLayout from "../Layout/DashboardLayout";
import ImageViewerModal from "../../reusableComponents/Modals/ImageViewerModal";

const SupportChart = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useChatGetQuery(id);
  const [createComment] = useCreateCommentMutation();
  const [displayImage, setDisplayImage] = useState("");
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [clickedImage, setClickedImage] = useState("");

  const chartData = data;

  const [state, setState] = useState({
    comment: "",
    image: null,
  });

  const openImageViewer = useCallback((item) => {
    setClickedImage(item.image);
    setIsViewerOpen(true);
  }, []);

  const closeImageViewer = () => {
    setIsViewerOpen(false);
    setClickedImage("");
  };

  // Send comment
  const sendComment = async () => {
    if (state?.comment === "") {
      return toast?.error("Please enter a message");
    }
    const formData = new FormData();
    formData.append("comment", state.comment);
    if (state?.image) {
      formData.append("image", state.image);
    }
    formData.append("ticket_id", id);

    try {
      const response = await createComment(formData);
      if (response?.data?.status_code === 200) {
        setState({ comment: "", image: null });
        setDisplayImage("");
      } else {
        toast.error(response?.error?.data?.message, {
          position: "top-center",
        });
        setState({ comment: "", image: null });
        setDisplayImage("");
      }
    } catch (error) {
      if (error.response.status >= 400 && error.response.status <= 500) {
        toast.error(error.response.data.message, {
          position: "top-center",
        });
      }
    }
  };

  // Upload file
  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (_) => {
      const files = Array.from(input.files);
      if (files) {
        const acceptedFormats = ["image/png", "image/jpeg", "image/jpg"];
        const invalidFile = !acceptedFormats.includes(files[0].type);
        if (invalidFile) {
          toast.warning("Only JPG / PNG files are allowed", {
            position: "top-center",
          });
          return;
        }
      }
      const showImage = URL.createObjectURL(files[0]);
      setDisplayImage(showImage);
      setState({ ...state, image: files[0] });
    };
    input.click();
  };

  const clearImage = () => {
    setDisplayImage("");
    setState({ ...state, image: null });
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    const chatBox = document.getElementById("chat_scroll");
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chartData]);

  // Format date
  const formatDateWithAmPm = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    let hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const amAndPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}-${month}-${year} ${hours}:${minutes} ${amAndPm}`;
  };

  return (
    <>
      <DashboardLayout>
        <section className="p-2 sm:p-2 text-white">
          <div className="w-full">
            {/* Back Button */}
            <Link
              to="/support"
              className="inline-flex items-center gap-1 text-[#b9fd5c] text-lg 
                         no-underline mb-4 hover:text-[#ff8533] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-[#b9fd5c]"
              >
                <path d="M12.707 17.293 8.414 13H18v-2H8.414l4.293-4.293-1.414-1.414L4.586 12l6.707 6.707z" />
              </svg>
            </Link>

            <div className="flex flex-col xl:flex-row justify-center gap-5">
              {/* Chat Section */}
              <div className="w-full xl:w-5/12">
                {/* Chat Header & Messages */}
                <div className="bg-[#282f35] border border-[#2a2c2f] rounded-t-2xl px-4 pb-1 pt-5">
                  <h3 className="text-white text-lg font-semibold pb-3">
                    Chat Support
                  </h3>

                  {/* Chat Messages */}
                  <div className="h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#2a2c2f] scrollbar-track-transparent">
                    <ul
                      className="list-none p-0 m-0 pr-1 space-y-4"
                      id="chat_scroll"
                    >
                      {chartData?.data?.comments?.map((item, i) =>
                        item?.commented_by?.role === "0" ? (
                          // User message (right side)
                          <ChatBubble
                            key={`${item?._id}-${i}`}
                            item={item}
                            isUser={true}
                            onImageClick={openImageViewer}
                            formatDate={formatDateWithAmPm}
                          />
                        ) : (
                          // Admin message (left side)
                          <ChatBubble
                            key={`${item?._id}-${i}`}
                            item={item}
                            isUser={false}
                            onImageClick={openImageViewer}
                            formatDate={formatDateWithAmPm}
                          />
                        )
                      )}
                    </ul>
                  </div>
                </div>

                {/* Chat Input */}
                <div
                  className="bg-[#111214] border border-[#2a2c2f] border-t-0 rounded-b-2xl 
                              flex items-center gap-2 sm:gap-3 px-3 py-3"
                >
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={state?.comment}
                    onChange={(e) =>
                      setState({ ...state, comment: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendComment();
                    }}
                    className="flex-1 bg-transparent border-none text-white text-sm 
                               placeholder-[#555] focus:outline-none focus:ring-0"
                  />

                  <div className="flex items-center gap-3">
                    {/* File Upload / Preview */}
                    {displayImage ? (
                      <div className="relative flex gap-1">
                        <img
                          src={displayImage}
                          alt="file"
                          className="h-7 w-[50px] object-cover rounded cursor-pointer"
                        />
                        <button
                          onClick={clearImage}
                          className="absolute -top-2.5 -right-2 bg-white rounded-full 
                                     h-5 w-5 flex items-center justify-center cursor-pointer
                                     hover:bg-gray-200 transition-colors"
                        >
                          <span
                            className="text-[10px] font-bold text-[#b9fd5c] leading-none"
                          >
                            X
                          </span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleUpload}
                        className="cursor-pointer bg-transparent border-none p-0 
                                   hover:opacity-80 transition-opacity"
                      >
                        <img
                          src="/images/file.png"
                          alt="file"
                          className="h-7"
                        />
                      </button>
                    )}

                    {/* Send Button */}
                    <button
                      onClick={sendComment}
                      className="cursor-pointer bg-transparent border-none p-0 
                                 hover:opacity-80 transition-opacity"
                    >
                      <img
                        src="/images/send.png"
                        alt="send"
                        className="h-5"
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Ticket Details Section */}
              <div className="w-full xl:w-5/12">
                <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl p-5 mb-3">
                  <h3 className="text-white text-lg font-semibold mb-4">
                    Ticket Details
                  </h3>

                  <div className="px-3 space-y-3">
                    <TicketDetailRow
                      label="Name"
                      value={
                        chartData?.data?.ticket?.author_name
                          ? chartData.data.ticket.author_name
                              .charAt(0)
                              .toUpperCase() +
                            chartData.data.ticket.author_name
                              .slice(1)
                              .toLowerCase()
                          : ""
                      }
                    />
                    <TicketDetailRow
                      label="Email"
                      value={chartData?.data?.ticket?.author_email}
                    />
                    <TicketDetailRow
                      label="Title"
                      value={chartData?.data?.ticket?.title}
                      capitalize
                    />
                    <TicketDetailRow
                      label="Content"
                      value={chartData?.data?.ticket?.content}
                      capitalize
                    />
                    <TicketDetailRow
                      label="Priority"
                      value={chartData?.data?.ticket?.priority}
                      capitalize
                    />

                    {chartData?.data?.ticket?.image && (
                      <div className="flex items-start gap-3">
                        <h6 className="text-sm font-bold text-white whitespace-nowrap my-auto">
                          Image:
                        </h6>
                        <img
                          src={chartData?.data?.ticket?.image}
                          alt="Ticket"
                          className="max-h-[200px] max-w-[300px] object-contain rounded-lg 
                                     cursor-pointer hover:opacity-90 transition-opacity
                                     border border-[#2a2c2f]"
                          onClick={() =>
                            openImageViewer(chartData?.data?.ticket)
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </DashboardLayout>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={isViewerOpen}
        onClose={closeImageViewer}
        imageSrc={clickedImage}
      />
    </>
  );
};

export default SupportChart;

// ─── Sub-Components ──────────────────────────────────────────────

/**
 * Chat Bubble Component
 */
const ChatBubble = ({ item, isUser, onImageClick, formatDate }) => {
  return (
    <li
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Avatar + Name */}
        <div
          className={`flex items-center gap-1.5 mb-1.5 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <img
            src={item.commented_by?.profile || "/images/chart-user.png"}
            alt="avatar"
            className="h-[30px] w-[30px] rounded-full object-cover 
                       border border-[#2a2c2f]"
          />
          <h6 className="text-sm text-white font-medium m-0">
            {item?.commented_by?.name}
          </h6>
        </div>

        {/* Message Bubble */}
        <div
          className={`p-3 rounded-xl ${
            isUser
              ? "bg-[#b9fd5c]/15 border border-[#b9fd5c]/20 rounded-tr-sm"
              : "bg-[#2a2c2f] border border-[#333] rounded-tl-sm"
          }`}
        >
          <p className="text-sm text-white m-0 break-words">
            {item?.comment}
          </p>

          {item?.image && (
            <div
              className={`mt-2 ${isUser ? "text-right" : "text-left"}`}
            >
              <img
                src={item?.image}
                alt="chat-image"
                className="h-[100px] w-[100px] object-cover rounded-lg cursor-pointer 
                           hover:opacity-80 transition-opacity border border-[#2a2c2f]"
                onClick={() => onImageClick(item)}
              />
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p
          className={`text-[10px] text-[#8a8d93] mt-1 mx-1 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {formatDate(item?.created_at)}
        </p>
      </div>
    </li>
  );
};

/**
 * Ticket Detail Row Component
 */
const TicketDetailRow = ({ label, value, capitalize = false }) => (
  <h6 className={`text-sm font-bold text-white ${capitalize ? "capitalize" : ""}`}>
    <span className="text-[#8a8d93] font-semibold">{label}:</span>{" "}
    <span className="font-normal">{value || "N/A"}</span>
  </h6>
);