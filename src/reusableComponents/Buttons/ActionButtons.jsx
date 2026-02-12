// src/components/ActionButtons.jsx
import { Icon } from "@iconify/react/dist/iconify.js";

const ActionButtons = ({ onApprove, onReject }) => {
  return (
    <span>
      <button
        className="bg-transparent border-0"
        title="Approve"
        onClick={onApprove}
      >
        <Icon
          icon="mdi:check"
          width="20"
          height="20"
          style={{ color: "var(--green)" }}
        />
      </button>
      <button
        className="bg-transparent border-0"
        title="Reject"
        onClick={onReject}
      >
        <Icon
          icon="charm:cross"
          width="26"
          height="26"
          style={{ color: "var(--red)" }}
        />
      </button>
    </span>
  );
};

export default ActionButtons;