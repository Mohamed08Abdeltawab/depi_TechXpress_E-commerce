import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Package,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Plus,
  Clock
} from "lucide-react";
import { api } from "../../lib/axios";
import { MOCK_PRODUCTS } from "../../services/mockData";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 2845000,
    ordersCount: 48,
    activeProducts: MOCK_PRODUCTS.length,
    lowStockCount: 2
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([
    {
      id: 101,
      orderNumber: "TXP-2026-948120",
      customer: "Eng. Mohamed Ahmed",
      date: "Today, 11:30 AM",
      total: 84999,
      status: "Processing"
    },
    {
      id: 102,
      orderNumber: "TXP-2026-947811",
      customer: "Dr. Sara Mahmoud",
      date: "Today, 09:15 AM",
      total: 139999,
      status: "Pending"
    },
    {
      id: 103,
      orderNumber: "TXP-2026-946502",
      customer: "Tarek Mostafa",
      date: "Yesterday",
      total: 62999,
      status: "Shipped"
    }
  ]);

  useEffect(() => {
    // Attempt backend stats call
    api
      .get("/admin/dashboard/stats")
      .then((res) => {
        if (res.data) {
          setStats((prev) => ({
            ...prev,
            totalRevenue: res.data.totalRevenue ?? prev.totalRevenue,
            ordersCount: res.data.ordersCount ?? prev.ordersCount,
            lowStockCount: res.data.lowStockCount ?? prev.lowStockCount
          }));
        }
      })
      .catch(() => {
        // Fallback to rich mock stats
      });

    // Attempt backend recent orders call
    api
      .get("/admin/orders", { params: { pageSize: 5 } })
      .then((res) => {
        if (res.data && res.data.items && res.data.items.length > 0) {
          setRecentOrders(
            res.data.items.map((o: any) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              customer: o.customerName || "Customer",
              date: new Date(o.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              }),
              total: o.totalAmount,
              status: o.status
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Electronics Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time operations, inventory throughput, and revenue analytics for Egypt.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Hardware</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Revenue */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.totalRevenue.toLocaleString()} EGP
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% from last month</span>
          </div>
        </div>

        {/* Orders */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Fulfilled Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.ordersCount} Orders
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 mt-2">
            <Clock className="w-3.5 h-3.5" />
            <span>4 pending courier dispatch</span>
          </div>
        </div>

        {/* Catalog */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Hardware SKUs
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.activeProducts} Devices
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Across 5 core categories
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Low Stock Warnings
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.lowStockCount} Units
          </div>
          <Link
            to="/admin/inventory"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 mt-2"
          >
            <span>Review inventory alert →</span>
          </Link>
        </div>
      </div>

      {/* 2-Column: Recent Orders & Top Selling Hardware */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Orders */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900">
              Recent Procurement Orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase">
                  <th className="pb-3">Order</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Total (EGP)</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-mono font-bold text-slate-900">
                      #{o.orderNumber}
                    </td>
                    <td className="py-3 text-slate-700 font-medium">{o.customer}</td>
                    <td className="py-3 text-slate-400">{o.date}</td>
                    <td className="py-3 font-black text-slate-900">
                      {o.total.toLocaleString()} EGP
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          o.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.status === "Processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Sellers Preview */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900">
              Top Selling Silicon
            </h3>
            <span className="text-[11px] font-bold text-slate-400">By units sold</span>
          </div>

          <div className="space-y-4">
            {MOCK_PRODUCTS.slice(0, 4).map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-6 text-center font-black text-xs text-slate-400">
                  #{idx + 1}
                </span>
                <img
                  src={p.primaryImageUrl || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200"}
                  alt={p.name}
                  className="w-10 h-10 object-contain rounded-lg bg-slate-50 p-1 border border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {p.finalPrice.toLocaleString()} EGP • {p.soldCount} sold
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
