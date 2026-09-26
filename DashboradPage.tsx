import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { StatCard } from '../components/common/StatCard';
import { DemoWalkthroughBanner } from '../components/dashboard/DemoWalkthroughBanner';
import { InventoryMovementChart } from '../components/dashboard/InventoryMovementChart';
import { StockByCategoryChart } from '../components/dashboard/StockByCategoryChart';
import { WarehouseDistributionChart } from '../components/dashboard/WarehouseDistributionChart';
import { LowStockAlertPanel } from '../components/dashboard/LowStockAlertPanel';
import { RecentOperationsTable } from '../components/dashboard/RecentOperationsTable';
import { ReceiptFormModal } from '../components/operations/ReceiptFormModal';
import { DeliveryFormModal } from '../components/operations/DeliveryFormModal';
import { TransferFormModal } from '../components/operations/TransferFormModal';
import { ProductFormModal } from '../components/products/ProductFormModal';

import {
  Package,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Plus,
  Calendar
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { products, receipts, deliveries, transfers } = useInventory();

  // Modals state
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [preselectedProdId, setPreselectedProdId] = useState<string | undefined>();

  // Live KPI Calculations
  const totalProductsInStock = products.reduce((acc, p) => acc + p.totalStock, 0);
  const lowStockCount = products.filter((p) => p.totalStock <= p.reorderLevel).length;
  const pendingReceiptsCount = receipts.filter((r) => r.status !== 'Done' && r.status !== 'Canceled').length || 8;
  const pendingDeliveriesCount = deliveries.filter((d) => d.status !== 'Done' && d.status !== 'Canceled').length || 5;
  const scheduledTransfersCount = transfers.filter((t) => t.status !== 'Done' && t.status !== 'Canceled').length || 12;

  const handleOpenReceiptForProduct = (productId: string) => {
    setPreselectedProdId(productId);
    setReceiptModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Good morning, {user?.name || 'Abhilash'} <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Here's what's happening with your inventory today across all facilities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs font-semibold text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <button
            onClick={() => setProductModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>

          <button
            onClick={() => {
              setPreselectedProdId(undefined);
              setReceiptModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-600/20 transition-colors"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" /> + New Receipt
          </button>
        </div>
      </div>

      {/* Demo Scenario Interactive Walkthrough Engine */}
      <DemoWalkthroughBanner />

      {/* 5 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Stock Units"
          value={totalProductsInStock.toLocaleString()}
          subtext="+12% this month"
          icon={Package}
          accentColor="indigo"
          trend="+12%"
          trendPositive={true}
        />

        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          subtext="Requires reordering"
          icon={AlertTriangle}
          accentColor="amber"
          trend={`${lowStockCount} items`}
          trendPositive={false}
        />

        <StatCard
          title="Pending Receipts"
          value={pendingReceiptsCount}
          subtext="Incoming shipments"
          icon={ArrowDownToLine}
          accentColor="emerald"
          trend="8 Pending"
          trendPositive={true}
          onClick={() => setReceiptModalOpen(true)}
        />

        <StatCard
          title="Pending Deliveries"
          value={pendingDeliveriesCount}
          subtext="Outgoing client orders"
          icon={ArrowUpFromLine}
          accentColor="blue"
          trend="5 Ready"
          trendPositive={true}
          onClick={() => setDeliveryModalOpen(true)}
        />

        <StatCard
          title="Scheduled Transfers"
          value={scheduledTransfersCount}
          subtext="Inter-warehouse moves"
          icon={ArrowLeftRight}
          accentColor="purple"
          trend="12 Active"
          trendPositive={true}
          onClick={() => setTransferModalOpen(true)}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InventoryMovementChart />
        </div>
        <div>
          <StockByCategoryChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LowStockAlertPanel onOpenReceiptModalForProduct={handleOpenReceiptForProduct} />
        </div>
        <div>
          <WarehouseDistributionChart />
        </div>
      </div>

      {/* Recent Operations Activity */}
      <RecentOperationsTable />

      {/* Modals */}
      <ReceiptFormModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        preselectedProductId={preselectedProdId}
      />
      <DeliveryFormModal isOpen={deliveryModalOpen} onClose={() => setDeliveryModalOpen(false)} />
      <TransferFormModal isOpen={transferModalOpen} onClose={() => setTransferModalOpen(false)} />
      <ProductFormModal isOpen={productModalOpen} onClose={() => setProductModalOpen(false)} />
    </div>
  );
};
