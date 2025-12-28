import { useState, useEffect } from "react";
import { Wallet, X, CheckCircle2 } from "lucide-react";
import CustomSelect from "./CustomSelect";

const AddInvoiceModal = ({ onClose, onSave, payment, projectId }) => {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);

  // Prefill form when editing
  useEffect(() => {
    if (payment) {
      setInvoiceNumber(payment.invoiceNumber || "");
      setDate(payment.date || "");
      setAmount(payment.amount || "");
      setStatus(payment.status || "Pending");
    }
  }, [payment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newPayment = {
      invoiceNumber,
      date,
      amount,
      status,
    };

    try {
      let response;
      if (payment) {
        // Update existing
        response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/payments/${payment._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPayment),
          }
        );
      } else {
        // Add new
        response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payments/${projectId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPayment),
        });
      }

      if (!response.ok) throw new Error("Failed to save payment");
      const saved = await response.json();
      onSave(saved);
      onClose();
    } catch (error) {
      console.error("Error saving payment:", error);
      alert("Failed to save ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg shadow-sm">
              <Wallet className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {payment ? "Edit Invoice" : "Add Invoice"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Invoice Number */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-800 font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal uppercase tracking-wide"
                placeholder="INV-2023-001"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-800 font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300 font-mono"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <CustomSelect
                label="Status"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "Pending", label: "Pending" },
                  { value: "Paid", label: "Paid" },
                  { value: "Overdue", label: "Overdue" }
                ]}
                icon={CheckCircle2}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-white text-slate-600 rounded-lg hover:bg-slate-50 border border-slate-200 transition-all text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-slate-900/20"
                disabled={loading}
              >
                {loading ? "Saving..." : payment ? "Update" : "Save Invoice"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInvoiceModal;
