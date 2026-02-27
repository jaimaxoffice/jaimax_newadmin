// src/components/TransactionModal.jsx
import React, { useState } from "react";
import Modal from "../../reusableComponents/Modals/Modals";

const TransactionModal = ({ isOpen, onClose, onSubmit }) => {
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState("referral_amount");

  const handleSubmit = (e) => {
    onSubmit(e, transactionType, amount);
    setAmount("");
    setTransactionType("referral_amount");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Transaction" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#8a8d93] mb-2">
            Transaction Type
          </label>
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl py-3 px-4 text-sm
              focus:outline-none focus:border-[#b9fd5c] focus:ring-1 focus:ring-[#b9fd5c]/50 
              transition-colors cursor-pointer"
          >
            <option value="referral_amount">Referral Amount</option>
                  <option value="jaimax">Jaimax Coins</option>
                  <option value="super_bonus">Super Bonus</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#8a8d93] mb-2">
            Amount
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full bg-[#111214] border border-[#2a2c2f] text-white placeholder-[#555] rounded-xl py-3 px-4 text-sm
              focus:outline-none focus:border-[#b9fd5c] focus:ring-1 focus:ring-[#b9fd5c]/50 transition-colors"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-[#2a2c2f] hover:bg-[#333] text-white py-3 rounded-3xl text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-[#b9fd5c] hover:bg-[#b9fd5c]/90 text-[#111214] py-3 rounded-3xl text-sm font-semibold transition-colors cursor-pointer"
          >
            Send
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionModal;