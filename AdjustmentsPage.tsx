import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { AdjustmentFormModal } from '../components/operations/AdjustmentFormModal';
import { SlidersHorizontal, Plus, Search, CheckCircle2 } from 'lucide-react';

export const AdjustmentsPage: React.FC = () => {
  const { adjustments, validateAdjustment } = useInventory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAdjustments = adjustments.filter(
    (a) =>
      a.adjustmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Inventory Adjustments</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Reconcile physical stock counts with system records and log damage/loss variances
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> + New Adjustment
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by adjustment #, product, SKU, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
          />
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/70">
                <th className="py-3.5 px-4">Adjustment Ref</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Warehouse & Location</th>
                <th className="py-3.5 px-4 text-center">System Qty</th>
                <th className="py-3.5 px-4 text-center">Physical Qty</th>
                <th className="py-3.5 px-4 text-center">Variance Diff</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Created By</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAdjustments.map((adj) => (
                <tr key={adj.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{adj.adjustmentNumber}</td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{adj.productName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{adj.sku}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    <div className="font-medium">{adj.warehouseName}</div>
                    <div className="text-[10px] text-slate-400">Bin: {adj.locationName}</div>
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    {adj.systemQuantity} {adj.unit}
                  </td>

                  <td className="py-3.5 px-4 text-center font-extrabold text-slate-900">
                    {adj.physicalQuantity} {adj.unit}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`font-black text-xs px-2 py-0.5 rounded-full ${
                        adj.difference > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : adj.difference < 0
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {adj.difference > 0 ? `+${adj.difference}` : adj.difference} {adj.unit}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-amber-700">{adj.reason}</td>

                  <td className="py-3.5 px-4 text-slate-600">{adj.createdBy}</td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={adj.status} />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {adj.status !== 'Done' && (
                      <button
                        onClick={() => validateAdjustment(adj.id)}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1 ml-auto"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdjustmentFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
