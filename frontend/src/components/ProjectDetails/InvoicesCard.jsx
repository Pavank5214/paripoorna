import { useEffect, useState } from "react";
import { Receipt, Pencil, Trash2, Wallet } from "lucide-react";
import ProjectCard from "./ProjectCard";
import AddInvoiceModal from "../common/AddInvoiceModal";
import { useParams } from "react-router-dom";

const InvoicesCard = () => {
  const { id: projectId } = useParams();
  const [payments, setPayments] = useState([]);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(null);

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payments/${projectId}`);
        if (!res.ok) throw new Error("Failed to fetch payments");
        const data = await res.json();
        setPayments(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPayments();
  }, [projectId]);

  const handleAddPayment = (newPayment) => {
    setPayments((prev) => [...prev, newPayment]);
    setIsAddingPayment(false);
  };

  const handleEditPayment = (updatedPayment) => {
    setPayments((prev) =>
      prev.map((p) => (p._id === updatedPayment._id ? updatedPayment : p))
    );
    setIsEditingPayment(null);
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm("Delete this payment?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete payment");
      setPayments((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete payment ❌");
    }
  };

  return (
    <>
      <ProjectCard
        title="Client Payments"
        icon={<Receipt className="w-4 h-4" />}
        onAdd={() => setIsAddingPayment(true)}
      >
        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 border border-slate-100 rounded-lg border-dashed">
            <Wallet className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">No payments recorded</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {payments.map((inv) => (
              <div
                key={inv._id}
                className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 hover:border-amber-200 hover:shadow-sm transition-all group"
              >
                {/* Left: Invoice number + Date */}
                <div className="flex-1 min-w-0 truncate">
                  <span className="font-bold text-slate-700 text-xs uppercase tracking-tight block">{inv.invoiceNumber}</span>
                  <span className="text-slate-400 text-[10px] font-mono">{inv.date}</span>
                </div>

                {/* Middle: Amount + Status */}
                <div className="flex items-center gap-3 min-w-fit">
                  <span className="font-mono font-bold text-slate-800">₹{inv.amount}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${inv.status === "Paid"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : inv.status === "Overdue"
                        ? "bg-rose-50 text-rose-600 border-rose-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}
                  >
                    {inv.status}
                  </span>
                </div>

                {/* Right: Edit/Delete */}
                <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setIsEditingPayment(inv)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition-colors"
                    aria-label="Edit Payment"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeletePayment(inv._id)}
                    className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    aria-label="Delete Payment"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ProjectCard>

      {/* Add/Edit Modals */}
      {isAddingPayment && (
        <AddInvoiceModal
          projectId={projectId}
          onClose={() => setIsAddingPayment(false)}
          onSave={handleAddPayment}
        />
      )}
      {isEditingPayment && (
        <AddInvoiceModal
          projectId={projectId}
          payment={isEditingPayment}
          onClose={() => setIsEditingPayment(null)}
          onSave={handleEditPayment}
        />
      )}
    </>
  );
};

export default InvoicesCard;
