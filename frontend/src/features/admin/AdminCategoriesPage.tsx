import { useState, useEffect } from "react";
import {
  Tags,
  Plus,
  Trash2,
  CheckCircle2,
  Award
} from "lucide-react";
import { api } from "../../lib/axios";
import { MOCK_CATEGORIES, MOCK_BRANDS } from "../../services/mockData";
import type { CategoryDto, BrandDto } from "../../types/product";

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "brands">("categories");
  const [categories, setCategories] = useState<CategoryDto[]>(MOCK_CATEGORIES);
  const [brands, setBrands] = useState<BrandDto[]>(MOCK_BRANDS);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Category Modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");

  // Brand Modal
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [brandName, setBrandName] = useState("");

  const loadData = () => {
    setIsLoading(true);
    api
      .get<CategoryDto[]>("/categories", { params: { includeInactive: true } })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCategories(res.data);
        }
      })
      .catch(() => {});

    api
      .get<BrandDto[]>("/brands", { params: { includeInactive: true } })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setBrands(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setErrorMsg("");

    try {
      await api.post("/categories", {
        name: catName.trim(),
        slug: (catSlug || catName).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        isActive: true
      });
      loadData();
      setShowCatModal(false);
      setCatName("");
      setCatSlug("");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to create category on backend.");
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    setErrorMsg("");

    try {
      await api.post("/brands", {
        name: brandName.trim(),
        isActive: true
      });
      loadData();
      setShowBrandModal(false);
      setBrandName("");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to create brand on backend.");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Cannot delete category that contains active products.");
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) return;
    try {
      await api.delete(`/brands/${id}`);
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Cannot delete brand that contains active products.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Categories & Hardware Brands
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Organize TechXpress hardware catalog taxonomies, device segments, and manufacturer partnerships.
            </p>
          </div>
          {isLoading && (
            <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorMsg("");
            if (activeTab === "categories") setShowCatModal(true);
            else setShowBrandModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === "categories" ? "Add New Category" : "Add New Brand"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
            activeTab === "categories"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Tags className="w-4 h-4" />
          <span>Product Categories ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("brands")}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
            activeTab === "brands"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Official Brands & OEMs ({brands.length})</span>
        </button>
      </div>

      {/* Categories View */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900">{cat.name}</h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Slug: /{cat.slug}
                </div>
                <p className="text-xs text-slate-600">
                  {cat.description || "Consumer & professional electronic computing hardware category."}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {cat.productCount ?? 0} SKUs listed
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Brands View */}
      {activeTab === "brands" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {brands.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div className="py-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-2 font-black text-sm">
                  {b.name.slice(0, 2).toUpperCase()}
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 truncate">
                  {b.name}
                </h4>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {b.productCount ?? 0} Products
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-center">
                <button
                  type="button"
                  onClick={() => handleDeleteBrand(b.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                  title="Remove Brand"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowCatModal(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h3 className="font-black text-lg text-slate-900 mb-1">
              Add Hardware Category
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Create a new category for products in the TechXpress catalog.
            </p>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!catSlug) {
                      setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                  placeholder="e.g. Smart Wearables"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Slug (Optional)
                </label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="e.g. smart-wearables"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Brand Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowBrandModal(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h3 className="font-black text-lg text-slate-900 mb-1">
              Add Partner Brand / OEM
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a verified hardware manufacturer brand to the store.
            </p>

            <form onSubmit={handleAddBrand} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brand / Manufacturer Name *
                </label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. NVIDIA, Corsair, Microsoft"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBrandModal(false)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
