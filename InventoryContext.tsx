import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  Warehouse,
  Receipt,
  DeliveryOrder,
  InternalTransfer,
  InventoryAdjustment,
  StockMovementLedger,
  NotificationItem,
  SystemSettings,
  ReorderRule,
  OperationStatus,
  AdjustmentReason
} from '../types/inventory';

import {
  initialProducts,
  initialCategories,
  initialWarehouses,
  initialReceipts,
  initialDeliveries,
  initialTransfers,
  initialAdjustments,
  initialLedger,
  initialNotifications,
  initialSettings
} from '../data/initialData';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface InventoryContextType {
  products: Product[];
  categories: Category[];
  warehouses: Warehouse[];
  receipts: Receipt[];
  deliveries: DeliveryOrder[];
  transfers: InternalTransfer[];
  adjustments: InventoryAdjustment[];
  ledger: StockMovementLedger[];
  notifications: NotificationItem[];
  settings: SystemSettings;
  toasts: ToastMessage[];

  // Toast controls
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Product management
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'totalStock' | 'locationStocks'>, initialStock?: number, locationName?: string) => Product;
  updateProduct: (id: string, updatedData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Category management
  addCategory: (name: string, description: string) => void;

  // Warehouse management
  addWarehouse: (name: string, code: string, address: string, manager: string) => void;

  // Business Operations
  createReceipt: (receipt: Omit<Receipt, 'id' | 'receiptNumber' | 'createdAt' | 'totalQuantity'>) => Receipt;
  validateReceipt: (receiptId: string) => void;

  createDelivery: (delivery: Omit<DeliveryOrder, 'id' | 'deliveryNumber' | 'createdAt' | 'totalQuantity'>) => DeliveryOrder | { error: string };
  validateDelivery: (deliveryId: string) => { success: boolean; error?: string };

  createTransfer: (transfer: Omit<InternalTransfer, 'id' | 'transferNumber' | 'createdAt'>) => InternalTransfer | { error: string };
  validateTransfer: (transferId: string) => { success: boolean; error?: string };

  createAdjustment: (adjustment: Omit<InventoryAdjustment, 'id' | 'adjustmentNumber' | 'createdAt' | 'difference'>) => InventoryAdjustment;
  validateAdjustment: (adjustmentId: string) => void;

  // Settings & Notifications
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Demo helpers
  resetDataToInitial: () => void;
  runDemoScenarioStep: (stepNumber: 1 | 2 | 3 | 4) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('stocksense_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('stocksense_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem('stocksense_warehouses');
    return saved ? JSON.parse(saved) : initialWarehouses;
  });

  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    const saved = localStorage.getItem('stocksense_receipts');
    return saved ? JSON.parse(saved) : initialReceipts;
  });

  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(() => {
    const saved = localStorage.getItem('stocksense_deliveries');
    return saved ? JSON.parse(saved) : initialDeliveries;
  });

  const [transfers, setTransfers] = useState<InternalTransfer[]>(() => {
    const saved = localStorage.getItem('stocksense_transfers');
    return saved ? JSON.parse(saved) : initialTransfers;
  });

  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>(() => {
    const saved = localStorage.getItem('stocksense_adjustments');
    return saved ? JSON.parse(saved) : initialAdjustments;
  });

  const [ledger, setLedger] = useState<StockMovementLedger[]>(() => {
    const saved = localStorage.getItem('stocksense_ledger');
    return saved ? JSON.parse(saved) : initialLedger;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('stocksense_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('stocksense_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to local storage
  useEffect(() => { localStorage.setItem('stocksense_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('stocksense_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('stocksense_warehouses', JSON.stringify(warehouses)); }, [warehouses]);
  useEffect(() => { localStorage.setItem('stocksense_receipts', JSON.stringify(receipts)); }, [receipts]);
  useEffect(() => { localStorage.setItem('stocksense_deliveries', JSON.stringify(deliveries)); }, [deliveries]);
  useEffect(() => { localStorage.setItem('stocksense_transfers', JSON.stringify(transfers)); }, [transfers]);
  useEffect(() => { localStorage.setItem('stocksense_adjustments', JSON.stringify(adjustments)); }, [adjustments]);
  useEffect(() => { localStorage.setItem('stocksense_ledger', JSON.stringify(ledger)); }, [ledger]);
  useEffect(() => { localStorage.setItem('stocksense_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('stocksense_settings', JSON.stringify(settings)); }, [settings]);

  // Toast management
  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to re-evaluate stock status
  const calculateStockStatus = (totalStock: number, reorderLevel: number) => {
    if (totalStock === 0) return 'Out of Stock';
    if (totalStock <= reorderLevel) return 'Low Stock';
    return 'In Stock';
  };

  // 1. ADD PRODUCT
  const addProduct = (
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'totalStock' | 'locationStocks'>,
    initialStock = 0,
    locationName = 'Rack A'
  ): Product => {
    const existingSku = products.find((p) => p.sku.toLowerCase() === productData.sku.toLowerCase());
    if (existingSku) {
      addToast(`SKU ${productData.sku} already exists! Please use a unique SKU.`, 'error');
      throw new Error(`SKU ${productData.sku} already exists`);
    }

    const defaultWh = warehouses.find((w) => w.id === productData.defaultWarehouseId) || warehouses[0];
    const initialLocationStocks = initialStock > 0 ? [{ warehouseId: defaultWh.id, locationName, quantity: initialStock }] : [];
    const status = calculateStockStatus(initialStock, productData.reorderLevel);

    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
      defaultWarehouseName: defaultWh.name,
      totalStock: initialStock,
      locationStocks: initialLocationStocks,
      status,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Add ledger entry if initial stock > 0
    if (initialStock > 0) {
      const newLedger: StockMovementLedger = {
        id: 'trx-' + Date.now(),
        transactionId: 'TRX-INIT-' + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        reference: 'INIT-STOCK',
        operationType: 'Receipt',
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        quantity: initialStock,
        previousStock: 0,
        newStock: initialStock,
        fromLocation: 'Initial Catalog Setup',
        toLocation: `${defaultWh.name} - ${locationName}`,
        user: 'Abhilash',
        status: 'Done',
        reason: 'Initial Product Stock'
      };
      setLedger((prev) => [newLedger, ...prev]);
    }

    addToast(`Product "${newProduct.name}" created successfully.`, 'success');
    return newProduct;
  };

  const updateProduct = (id: string, updatedData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updatedData, updatedAt: new Date().toISOString().split('T')[0] };
          updated.status = calculateStockStatus(updated.totalStock, updated.reorderLevel);
          return updated;
        }
        return p;
      })
    );
    addToast('Product updated successfully.', 'success');
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast(`Product "${prod?.name || 'Item'}" deleted.`, 'info');
  };

  const addCategory = (name: string, description: string) => {
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name,
      description,
      productCount: 0,
      totalStock: 0,
      iconName: 'Package',
      color: '#2563EB'
    };
    setCategories((prev) => [...prev, newCat]);
    addToast(`Category "${name}" created.`, 'success');
  };

  const addWarehouse = (name: string, code: string, address: string, manager: string) => {
    const newWh: Warehouse = {
      id: 'wh-' + Date.now(),
      name,
      code,
      address,
      manager,
      totalItems: 0,
      locationCount: 3,
      isDefault: false,
      locations: [
        { id: 'loc-1', name: 'Rack A', description: 'Primary Bay' },
        { id: 'loc-2', name: 'Rack B', description: 'Secondary Bay' },
        { id: 'loc-3', name: 'Storage Area', description: 'General Storage' }
      ]
    };
    setWarehouses((prev) => [...prev, newWh]);
    addToast(`Warehouse "${name}" added successfully.`, 'success');
  };

  // ==========================================
  // RECEIPT (INCOMING GOODS)
  // ==========================================
  const createReceipt = (receiptData: Omit<Receipt, 'id' | 'receiptNumber' | 'createdAt' | 'totalQuantity'>): Receipt => {
    const count = receipts.length + 1;
    const receiptNumber = `REC-${String(count).padStart(3, '0')}`;
    const totalQuantity = receiptData.items.reduce((acc, item) => acc + Number(item.quantity), 0);

    const newReceipt: Receipt = {
      ...receiptData,
      id: 'rec-' + Date.now(),
      receiptNumber,
      totalQuantity,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setReceipts((prev) => [newReceipt, ...prev]);

    if (newReceipt.status === 'Done') {
      executeReceiptStockIncrease(newReceipt);
    } else {
      addToast(`Receipt ${receiptNumber} created in ${newReceipt.status} status.`, 'info');
    }

    return newReceipt;
  };

  const executeReceiptStockIncrease = (receiptObj: Receipt) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    receiptObj.items.forEach((item) => {
      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          if (p.id === item.productId || p.sku === item.sku) {
            const previousStock = p.totalStock;
            const newTotalStock = previousStock + Number(item.quantity);

            // Update location stock
            const existingLocIndex = p.locationStocks.findIndex(
              (l) => l.warehouseId === receiptObj.destinationWarehouseId && l.locationName === item.locationName
            );

            let updatedLocations = [...p.locationStocks];
            if (existingLocIndex >= 0) {
              updatedLocations[existingLocIndex] = {
                ...updatedLocations[existingLocIndex],
                quantity: updatedLocations[existingLocIndex].quantity + Number(item.quantity)
              };
            } else {
              updatedLocations.push({
                warehouseId: receiptObj.destinationWarehouseId,
                locationName: item.locationName,
                quantity: Number(item.quantity)
              });
            }

            const newStatus = calculateStockStatus(newTotalStock, p.reorderLevel);

            // Add ledger entry
            const ledgerEntry: StockMovementLedger = {
              id: 'trx-' + Date.now() + Math.random().toString(36).substring(2, 5),
              transactionId: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
              date: timestamp,
              reference: receiptObj.receiptNumber,
              operationType: 'Receipt',
              productId: p.id,
              productName: p.name,
              sku: p.sku,
              quantity: Number(item.quantity),
              previousStock,
              newStock: newTotalStock,
              fromLocation: `${receiptObj.supplier} (Supplier)`,
              toLocation: `${receiptObj.destinationWarehouseName} - ${item.locationName}`,
              user: receiptObj.createdBy,
              status: 'Done',
              reason: 'Supplier Goods Arrival'
            };

            setLedger((prevLedger) => [ledgerEntry, ...prevLedger]);

            return {
              ...p,
              totalStock: newTotalStock,
              locationStocks: updatedLocations,
              status: newStatus,
              updatedAt: new Date().toISOString().split('T')[0]
            };
          }
          return p;
        })
      );
    });

    addToast(`Receipt ${receiptObj.receiptNumber} validated! Stock increased automatically.`, 'success');

    // Add notification
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      type: 'success',
      title: `Receipt ${receiptObj.receiptNumber} Validated`,
      message: `Received ${receiptObj.totalQuantity} items into ${receiptObj.destinationWarehouseName}.`,
      timestamp: 'Just now',
      read: false,
      link: '/operations/receipts'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const validateReceipt = (receiptId: string) => {
    const target = receipts.find((r) => r.id === receiptId);
    if (!target) return;
    if (target.status === 'Done') {
      addToast(`Receipt ${target.receiptNumber} is already validated.`, 'warning');
      return;
    }

    const updated = { ...target, status: 'Done' as OperationStatus };
    setReceipts((prev) => prev.map((r) => (r.id === receiptId ? updated : r)));
    executeReceiptStockIncrease(updated);
  };

  // ==========================================
  // DELIVERY (OUTGOING GOODS)
  // ==========================================
  const createDelivery = (
    deliveryData: Omit<DeliveryOrder, 'id' | 'deliveryNumber' | 'createdAt' | 'totalQuantity'>
  ): DeliveryOrder | { error: string } => {
    // Check stock availability
    for (const item of deliveryData.items) {
      const prod = products.find((p) => p.id === item.productId || p.sku === item.sku);
      if (!prod) return { error: `Product ${item.productName} not found` };

      if (!settings.allowNegativeStock && prod.totalStock < Number(item.quantity)) {
        const errorMsg = `Insufficient stock available for ${prod.name}. Requested: ${item.quantity} ${prod.unit}, Available: ${prod.totalStock} ${prod.unit}.`;
        addToast(errorMsg, 'error');
        return { error: errorMsg };
      }
    }

    const count = deliveries.length + 1;
    const deliveryNumber = `DEL-${String(count).padStart(3, '0')}`;
    const totalQuantity = deliveryData.items.reduce((acc, item) => acc + Number(item.quantity), 0);

    const newDelivery: DeliveryOrder = {
      ...deliveryData,
      id: 'del-' + Date.now(),
      deliveryNumber,
      totalQuantity,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setDeliveries((prev) => [newDelivery, ...prev]);

    if (newDelivery.status === 'Done') {
      const result = executeDeliveryStockDecrease(newDelivery);
      if (result.error) return { error: result.error };
    } else {
      addToast(`Delivery Order ${deliveryNumber} created in ${newDelivery.status} status.`, 'info');
    }

    return newDelivery;
  };

  const executeDeliveryStockDecrease = (deliveryObj: DeliveryOrder): { success: boolean; error?: string } => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Re-verify availability
    for (const item of deliveryObj.items) {
      const prod = products.find((p) => p.id === item.productId || p.sku === item.sku);
      if (!prod) return { success: false, error: `Product not found` };
      if (!settings.allowNegativeStock && prod.totalStock < Number(item.quantity)) {
        const errStr = `Insufficient stock available for ${prod.name}. Required: ${item.quantity}, Available: ${prod.totalStock}`;
        addToast(errStr, 'error');
        return { success: false, error: errStr };
      }
    }

    deliveryObj.items.forEach((item) => {
      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          if (p.id === item.productId || p.sku === item.sku) {
            const previousStock = p.totalStock;
            const newTotalStock = Math.max(0, previousStock - Number(item.quantity));

            // Deduct location stock
            let updatedLocations = p.locationStocks.map((l) => {
              if (l.warehouseId === deliveryObj.sourceWarehouseId && l.locationName === item.locationName) {
                return { ...l, quantity: Math.max(0, l.quantity - Number(item.quantity)) };
              }
              return l;
            });

            const newStatus = calculateStockStatus(newTotalStock, p.reorderLevel);

            // Add ledger entry
            const ledgerEntry: StockMovementLedger = {
              id: 'trx-' + Date.now() + Math.random().toString(36).substring(2, 5),
              transactionId: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
              date: timestamp,
              reference: deliveryObj.deliveryNumber,
              operationType: 'Delivery',
              productId: p.id,
              productName: p.name,
              sku: p.sku,
              quantity: -Number(item.quantity),
              previousStock,
              newStock: newTotalStock,
              fromLocation: `${deliveryObj.sourceWarehouseName} - ${item.locationName}`,
              toLocation: `${deliveryObj.customer} (Customer)`,
              user: deliveryObj.createdBy,
              status: 'Done',
              reason: 'Customer Delivery'
            };

            setLedger((prevLedger) => [ledgerEntry, ...prevLedger]);

            // Low stock trigger notification
            if (newTotalStock <= p.reorderLevel) {
              const lowNotif: NotificationItem = {
                id: 'notif-low-' + Date.now(),
                type: 'warning',
                title: `Low Stock Alert: ${p.name}`,
                message: `${p.name} stock dropped to ${newTotalStock} ${p.unit} (Minimum threshold: ${p.reorderLevel} ${p.unit}).`,
                timestamp: 'Just now',
                read: false,
                link: '/products/reordering'
              };
              setNotifications((prev) => [lowNotif, ...prev]);
            }

            return {
              ...p,
              totalStock: newTotalStock,
              locationStocks: updatedLocations,
              status: newStatus,
              updatedAt: new Date().toISOString().split('T')[0]
            };
          }
          return p;
        })
      );
    });

    addToast(`Delivery Order ${deliveryObj.deliveryNumber} validated! Stock decreased.`, 'success');
    return { success: true };
  };

  const validateDelivery = (deliveryId: string): { success: boolean; error?: string } => {
    const target = deliveries.find((d) => d.id === deliveryId);
    if (!target) return { success: false, error: 'Delivery not found' };
    if (target.status === 'Done') {
      addToast(`Delivery Order ${target.deliveryNumber} is already completed.`, 'warning');
      return { success: true };
    }

    const result = executeDeliveryStockDecrease({ ...target, status: 'Done' });
    if (result.success) {
      setDeliveries((prev) => prev.map((d) => (d.id === deliveryId ? { ...d, status: 'Done' } : d)));
    }
    return result;
  };

  // ==========================================
  // INTERNAL TRANSFERS
  // ==========================================
  const createTransfer = (
    transferData: Omit<InternalTransfer, 'id' | 'transferNumber' | 'createdAt'>
  ): InternalTransfer | { error: string } => {
    const prod = products.find((p) => p.id === transferData.productId || p.sku === transferData.sku);
    if (!prod) return { error: 'Product not found' };

    // Check source location stock
    const sourceLoc = prod.locationStocks.find((l) => l.warehouseId === transferData.sourceWarehouseId);
    const availableAtSource = sourceLoc ? sourceLoc.quantity : 0;

    if (!settings.allowNegativeStock && availableAtSource < Number(transferData.quantity)) {
      const errorMsg = `Insufficient stock in ${transferData.sourceWarehouseName}. Requested transfer: ${transferData.quantity} ${transferData.unit}, Available: ${availableAtSource} ${transferData.unit}.`;
      addToast(errorMsg, 'error');
      return { error: errorMsg };
    }

    const count = transfers.length + 1;
    const transferNumber = `TRF-${String(count).padStart(3, '0')}`;

    const newTransfer: InternalTransfer = {
      ...transferData,
      id: 'trf-' + Date.now(),
      transferNumber,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setTransfers((prev) => [newTransfer, ...prev]);

    if (newTransfer.status === 'Done') {
      const res = executeTransferLocations(newTransfer);
      if (res.error) return { error: res.error };
    } else {
      addToast(`Internal Transfer ${transferNumber} scheduled.`, 'info');
    }

    return newTransfer;
  };

  const executeTransferLocations = (transferObj: InternalTransfer): { success: boolean; error?: string } => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === transferObj.productId || p.sku === transferObj.sku) {
          const previousTotalStock = p.totalStock;

          let updatedLocations = [...p.locationStocks];

          // 1. Decrease source location
          const sourceIdx = updatedLocations.findIndex((l) => l.warehouseId === transferObj.sourceWarehouseId);
          if (sourceIdx >= 0) {
            updatedLocations[sourceIdx] = {
              ...updatedLocations[sourceIdx],
              quantity: Math.max(0, updatedLocations[sourceIdx].quantity - Number(transferObj.quantity))
            };
          }

          // 2. Increase destination location
          const destIdx = updatedLocations.findIndex((l) => l.warehouseId === transferObj.destinationWarehouseId);
          if (destIdx >= 0) {
            updatedLocations[destIdx] = {
              ...updatedLocations[destIdx],
              quantity: updatedLocations[destIdx].quantity + Number(transferObj.quantity)
            };
          } else {
            updatedLocations.push({
              warehouseId: transferObj.destinationWarehouseId,
              locationName: transferObj.destinationLocation.split(' - ')[1] || 'Storage Area',
              quantity: Number(transferObj.quantity)
            });
          }

          // Note: Total company stock stays identical!
          const newTotalStock = previousTotalStock;

          // Ledger Entry
          const ledgerEntry: StockMovementLedger = {
            id: 'trx-' + Date.now() + Math.random().toString(36).substring(2, 5),
            transactionId: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
            date: timestamp,
            reference: transferObj.transferNumber,
            operationType: 'Transfer',
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            quantity: Number(transferObj.quantity),
            previousStock: previousTotalStock,
            newStock: newTotalStock,
            fromLocation: transferObj.sourceLocation,
            toLocation: transferObj.destinationLocation,
            user: transferObj.createdBy,
            status: 'Done',
            reason: transferObj.reason || 'Internal Stock Transfer'
          };

          setLedger((prevLedger) => [ledgerEntry, ...prevLedger]);

          return {
            ...p,
            locationStocks: updatedLocations,
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return p;
      })
    );

    addToast(`Transfer ${transferObj.transferNumber} validated! Locations updated (Total stock unchanged).`, 'success');
    return { success: true };
  };

  const validateTransfer = (transferId: string): { success: boolean; error?: string } => {
    const target = transfers.find((t) => t.id === transferId);
    if (!target) return { success: false, error: 'Transfer not found' };
    if (target.status === 'Done') {
      addToast(`Transfer ${target.transferNumber} is already completed.`, 'warning');
      return { success: true };
    }

    const res = executeTransferLocations({ ...target, status: 'Done' });
    if (res.success) {
      setTransfers((prev) => prev.map((t) => (t.id === transferId ? { ...t, status: 'Done' } : t)));
    }
    return res;
  };

  // ==========================================
  // INVENTORY ADJUSTMENTS
  // ==========================================
  const createAdjustment = (
    adjData: Omit<InventoryAdjustment, 'id' | 'adjustmentNumber' | 'createdAt' | 'difference'>
  ): InventoryAdjustment => {
    const difference = Number(adjData.physicalQuantity) - Number(adjData.systemQuantity);
    const count = adjustments.length + 1;
    const adjustmentNumber = `ADJ-${String(count).padStart(3, '0')}`;

    const newAdj: InventoryAdjustment = {
      ...adjData,
      id: 'adj-' + Date.now(),
      adjustmentNumber,
      difference,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setAdjustments((prev) => [newAdj, ...prev]);

    if (newAdj.status === 'Done') {
      executeAdjustmentStock(newAdj);
    } else {
      addToast(`Inventory Adjustment ${adjustmentNumber} created.`, 'info');
    }

    return newAdj;
  };

  const executeAdjustmentStock = (adjObj: InventoryAdjustment) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === adjObj.productId || p.sku === adjObj.sku) {
          const previousTotalStock = p.totalStock;
          const newTotalStock = Math.max(0, previousTotalStock + adjObj.difference);

          let updatedLocations = p.locationStocks.map((l) => {
            if (l.warehouseId === adjObj.warehouseId && l.locationName === adjObj.locationName) {
              return { ...l, quantity: Math.max(0, l.quantity + adjObj.difference) };
            }
            return l;
          });

          const newStatus = calculateStockStatus(newTotalStock, p.reorderLevel);

          const ledgerEntry: StockMovementLedger = {
            id: 'trx-' + Date.now() + Math.random().toString(36).substring(2, 5),
            transactionId: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
            date: timestamp,
            reference: adjObj.adjustmentNumber,
            operationType: 'Adjustment',
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            quantity: adjObj.difference,
            previousStock: previousTotalStock,
            newStock: newTotalStock,
            fromLocation: `${adjObj.warehouseName} - ${adjObj.locationName}`,
            toLocation: `Inventory Adjustment (${adjObj.reason})`,
            user: adjObj.createdBy,
            status: 'Done',
            reason: adjObj.reason
          };

          setLedger((prevLedger) => [ledgerEntry, ...prevLedger]);

          return {
            ...p,
            totalStock: newTotalStock,
            locationStocks: updatedLocations,
            status: newStatus,
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return p;
      })
    );

    addToast(`Adjustment ${adjObj.adjustmentNumber} confirmed. System stock updated to ${adjObj.physicalQuantity}.`, 'success');
  };

  const validateAdjustment = (adjustmentId: string) => {
    const target = adjustments.find((a) => a.id === adjustmentId);
    if (!target) return;
    if (target.status === 'Done') {
      addToast(`Adjustment ${target.adjustmentNumber} is already confirmed.`, 'warning');
      return;
    }

    const updated = { ...target, status: 'Done' as OperationStatus };
    setAdjustments((prev) => prev.map((a) => (a.id === adjustmentId ? updated : a)));
    executeAdjustmentStock(updated);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('System settings saved.', 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    addToast('Notifications cleared.', 'info');
  };

  const resetDataToInitial = () => {
    setProducts(initialProducts);
    setCategories(initialCategories);
    setWarehouses(initialWarehouses);
    setReceipts(initialReceipts);
    setDeliveries(initialDeliveries);
    setTransfers(initialTransfers);
    setAdjustments(initialAdjustments);
    setLedger(initialLedger);
    setNotifications(initialNotifications);
    setSettings(initialSettings);
    localStorage.clear();
    addToast('System reset to clean initial demo baseline.', 'info');
  };

  // ==========================================
  // EXACT DEMO SCENARIO INTERACTIVE STEPS
  // ==========================================
  const runDemoScenarioStep = (stepNumber: 1 | 2 | 3 | 4) => {
    if (stepNumber === 1) {
      // Step 1: Receive Steel Rod 100 kg into Main Warehouse
      createReceipt({
        supplier: 'Apex Metal Corp',
        receiptDate: new Date().toISOString().split('T')[0],
        destinationWarehouseId: 'wh-main',
        destinationWarehouseName: 'Main Warehouse',
        status: 'Done',
        createdBy: 'Abhilash',
        notes: 'Demo Step 1: Incoming goods receipt of 100 kg Steel Rod',
        items: [
          {
            productId: 'prod-steel-rod',
            productName: 'Steel Rod',
            sku: 'STR-001',
            quantity: 100,
            unit: 'KG',
            locationName: 'Rack A'
          }
        ]
      });
      addToast('Demo Step 1 Completed: Received 100 kg Steel Rod (Stock: +100 kg)', 'success');
    } else if (stepNumber === 2) {
      // Step 2: Transfer 20 kg Main Warehouse -> Production Rack
      createTransfer({
        productId: 'prod-steel-rod',
        productName: 'Steel Rod',
        sku: 'STR-001',
        quantity: 20,
        unit: 'KG',
        sourceWarehouseId: 'wh-main',
        sourceWarehouseName: 'Main Warehouse',
        sourceLocation: 'Main Warehouse - Rack A',
        destinationWarehouseId: 'wh-prod',
        destinationWarehouseName: 'Production Floor',
        destinationLocation: 'Production Floor - Production Rack',
        transferDate: new Date().toISOString().split('T')[0],
        reason: 'Demo Step 2: Internal Transfer to Production Floor',
        status: 'Done',
        createdBy: 'Ravi Kumar'
      });
      addToast('Demo Step 2 Completed: Transferred 20 kg (Main Wh: 80 kg, Prod Rack: 20 kg, Total: 100 kg)', 'success');
    } else if (stepNumber === 3) {
      // Step 3: Deliver 20 kg Steel Rod
      createDelivery({
        customer: 'Metro Construction Co.',
        deliveryDate: new Date().toISOString().split('T')[0],
        sourceWarehouseId: 'wh-main',
        sourceWarehouseName: 'Main Warehouse',
        status: 'Done',
        createdBy: 'Abhilash',
        notes: 'Demo Step 3: Outgoing Delivery Order of 20 kg Steel Rod',
        items: [
          {
            productId: 'prod-steel-rod',
            productName: 'Steel Rod',
            sku: 'STR-001',
            quantity: 20,
            unit: 'KG',
            locationName: 'Rack A'
          }
        ]
      });
      addToast('Demo Step 3 Completed: Delivered 20 kg (Total Stock: 100 → 80 kg)', 'success');
    } else if (stepNumber === 4) {
      // Step 4: Adjust damaged stock -3 kg
      createAdjustment({
        productId: 'prod-steel-rod',
        productName: 'Steel Rod',
        sku: 'STR-001',
        warehouseId: 'wh-main',
        warehouseName: 'Main Warehouse',
        locationName: 'Rack A',
        systemQuantity: 60,
        physicalQuantity: 57,
        unit: 'KG',
        reason: 'Damaged',
        notes: 'Demo Step 4: Physical count inspection - 3 kg damaged',
        status: 'Done',
        createdBy: 'Ravi Kumar'
      });
      addToast('Demo Step 4 Completed: Adjusted damaged stock -3 kg (Total Stock: 80 → 77 kg)', 'success');
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        categories,
        warehouses,
        receipts,
        deliveries,
        transfers,
        adjustments,
        ledger,
        notifications,
        settings,
        toasts,
        addToast,
        removeToast,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        addWarehouse,
        createReceipt,
        validateReceipt,
        createDelivery,
        validateDelivery,
        createTransfer,
        validateTransfer,
        createAdjustment,
        validateAdjustment,
        updateSettings,
        markNotificationAsRead,
        clearAllNotifications,
        resetDataToInitial,
        runDemoScenarioStep
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
