import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { productService } from "../../services/productService";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS } from "../../services/mockData";
import type { ProductListItemDto, CategoryDto, BrandDto } from "../../types/product";
import { Link } from "react-router-dom";
import { useShop } from "../../context/ShopContext";

export default function AdminProductsPage() {
  const { isAdmin } = useShop();
  const [products, setProducts] = useState<ProductListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductListItemDto | null>(null);

  // Add product form
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [categoryId, setCategoryId] = useState("1");
  const [brandId, setBrandId] = useState("1");
  const [imageUrl, setImageUrl] = useState("");
  const [formError, setFormError] = useState("");

  // Edit product form
  const [editName, setEditName] = useState("");
  const [editSku, setEditSku] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDiscountPrice, setEditDiscountPrice] = useState("");
  const [editStock, setEditStock] = useState("10");
  const [editCategoryId, setEditCategoryId] = useState("1");
  const [editBrandId, setEditBrandId] = useState("1");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editFormError, setEditFormError] = useState("");
  const [editUserEditedSku, setEditUserEditedSku] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const loadProducts = () => {
    setIsLoading(true);
    const fallbackProducts: ProductListItemDto[] = MOCK_PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      price: p.price,
      discountPrice: p.discountPrice,
      finalPrice: p.finalPrice,
      stockQuantity: p.stockQuantity,
      inStock: p.inStock,
      brandId: p.brandId,
      brandName: p.brandName,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      primaryImageUrl: p.images?.find((i) => i.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || null,
      soldCount: p.soldCount ?? 0,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      badge: p.badge
    }));

    productService
      .getProducts({ pageSize: 50 })
      .then((res) => {
        if (res.items && res.items.length > 0) {
          setProducts(res.items);
        } else {
          setProducts(fallbackProducts);
        }
      })
      .catch(() => {
        setProducts(fallbackProducts);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      p.sku.toLowerCase().includes(search.trim().toLowerCase());

    const matchesCategory =
      categoryFilter === "All" ||
      p.categoryName.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const [categories, setCategories] = useState<CategoryDto[]>(MOCK_CATEGORIES);
  const [brands, setBrands] = useState<BrandDto[]>(MOCK_BRANDS);

  useEffect(() => {
    productService.getCategories(true).then((res) => {
      if (res && res.length > 0) {
        setCategories(res);
        setCategoryId(String(res[0].id));
      }
    });
    productService.getBrands(true).then((res) => {
      if (res && res.length > 0) {
        setBrands(res);
        setBrandId(String(res[0].id));
      }
    });
  }, []);

  const [userEditedSku, setUserEditedSku] = useState(false);

  const generateSku = (prodName: string, selectedBrandId: string) => {
    const brandObj = brands.find((b) => b.id === Number(selectedBrandId));
    const brandPrefix = (brandObj?.name || "TXP").replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase() || "TXP";
    const nameClean = prodName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase() || "PROD";
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `${brandPrefix}-${nameClean}-${randomSuffix}`;
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !price) {
      setFormError("Please fill out product name and price.");
      return;
    }

    const finalSku = (sku.trim() || generateSku(name, brandId)).toUpperCase();

    try {
      await productService.createProduct({
        name: name.trim(),
        sku: finalSku,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stockQuantity: parseInt(stock) || 10,
        categoryId: Number(categoryId),
        brandId: Number(brandId),
        isActive: true,
        images: imageUrl.trim()
          ? [{ imageUrl: imageUrl.trim(), isPrimary: true, sortOrder: 0 }]
          : undefined
      });

      loadProducts();
      setShowAddModal(false);
      setName("");
      setSku("");
      setUserEditedSku(false);
      setPrice("");
      setDiscountPrice("");
      setImageUrl("");
    } catch (err: any) {
      if (!err.response) {
        setFormError("تعذر الاتصال بالخادم (Backend is unreachable). يرجى التأكد من تشغيل السيرفر على المنفذ 5132.");
        return;
      }
      if (err.response.status === 401) {
        setFormError("انتهت الجلسة أو لم يتم تسجيل الدخول. يرجى تسجيل الدخول بحساب المسؤول (admin@techxpress.com).");
        return;
      }
      if (err.response.status === 403) {
        setFormError("هذا الحساب لا يملك صلاحية مسؤول (Admin). يرجى تسجيل الدخول بحساب admin@techxpress.com.");
        return;
      }

      const resData = err.response?.data;
      if (resData?.errors && typeof resData.errors === "object") {
        const errorList: string[] = [];
        for (const key of Object.keys(resData.errors)) {
          const val = resData.errors[key];
          if (Array.isArray(val)) errorList.push(...val);
          else if (typeof val === "string") errorList.push(val);
        }
        if (errorList.length > 0) {
          setFormError(errorList.join(" | "));
          return;
        }
      }

      setFormError(
        resData?.message ||
        resData?.title ||
        resData?.detail ||
        "فشل في إنشاء المنتج. يرجى التأكد من صحة البيانات المدخلة."
      );
    }
  };

  const handleOpenEdit = async (product: ProductListItemDto) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditSku(product.sku);
    setEditUserEditedSku(false);
    setEditPrice(String(product.price));
    setEditDiscountPrice(product.discountPrice ? String(product.discountPrice) : "");
    setEditStock(String(product.stockQuantity));
    setEditCategoryId(String(product.categoryId));
    setEditBrandId(String(product.brandId));
    setEditImageUrl(product.primaryImageUrl || "");
    setEditIsActive(product.inStock);
    setEditFormError("");
    setShowEditModal(true);

    try {
      const detail = await productService.getProductById(product.id);
      if (detail) {
        if (detail.images && detail.images.length > 0) {
          const primary = detail.images.find((i) => i.isPrimary) || detail.images[0];
          setEditImageUrl(primary.imageUrl);
        }
        setEditIsActive(detail.isActive);
      }
    } catch {
      // ignore
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditFormError("");

    if (!editName.trim() || !editPrice) {
      setEditFormError("Please fill out product name and price.");
      return;
    }

    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setEditFormError("Please enter a valid price greater than 0.");
      return;
    }

    const discountNum = editDiscountPrice.trim() ? parseFloat(editDiscountPrice) : null;
    if (discountNum !== null && (discountNum <= 0 || discountNum >= priceNum)) {
      setEditFormError("Discount price must be greater than 0 and less than official price.");
      return;
    }

    const finalSku = (editSku.trim() || generateSku(editName, editBrandId)).toUpperCase();

    setIsSubmittingEdit(true);
    try {
      await productService.updateProduct(editingProduct.id, {
        name: editName.trim(),
        sku: finalSku,
        price: priceNum,
        discountPrice: discountNum,
        stockQuantity: parseInt(editStock) || 0,
        categoryId: Number(editCategoryId),
        brandId: Number(editBrandId),
        isActive: editIsActive,
        images: editImageUrl.trim()
          ? [{ imageUrl: editImageUrl.trim(), isPrimary: true, sortOrder: 0 }]
          : undefined
      });

      loadProducts();
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (err: any) {
      if (!err.response) {
        setEditFormError("تعذر الاتصال بالخادم (Backend is unreachable). يرجى التأكد من تشغيل السيرفر على المنفذ 5132.");
        return;
      }
      if (err.response.status === 401) {
        setEditFormError("انتهت الجلسة أو لم يتم تسجيل الدخول. يرجى تسجيل الدخول بحساب المسؤول (admin@techxpress.com).");
        return;
      }
      if (err.response.status === 403) {
        setEditFormError("هذا الحساب لا يملك صلاحية مسؤول (Admin). يرجى تسجيل الدخول بحساب admin@techxpress.com.");
        return;
      }

      const resData = err.response?.data;
      if (resData?.errors && typeof resData.errors === "object") {
        const errorList: string[] = [];
        for (const key of Object.keys(resData.errors)) {
          const val = resData.errors[key];
          if (Array.isArray(val)) errorList.push(...val);
          else if (typeof val === "string") errorList.push(val);
        }
        if (errorList.length > 0) {
          setEditFormError(errorList.join(" | "));
          return;
        }
      }

      setEditFormError(
        resData?.message ||
        resData?.title ||
        resData?.detail ||
        "فشل في تعديل المنتج. يرجى التأكد من صحة البيانات المدخلة."
      );
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this hardware SKU?")) return;
    try {
      await productService.deleteProduct(id);
      loadProducts();
    } catch (err) {
      console.warn("Failed to delete via API, removing locally", err);
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Hardware Catalog & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage device specifications, pricing tiers, and stock allocations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU, or brand..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:outline-none focus:border-indigo-600"
        >
          <option value="All">All Categories ({products.length})</option>
          {MOCK_CATEGORIES.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-extrabold uppercase">
              <th className="py-3 px-4">Device Details</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Brand</th>
              <th className="py-3 px-4">Price (EGP)</th>
              <th className="py-3 px-4">Stock Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Loading catalog inventory...
                </td>
              </tr>
            ) : filteredProducts.map((p) => {
              const img =
                p.primaryImageUrl ||
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200";

              return (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={img}
                        alt={p.name}
                        className="w-10 h-10 object-contain rounded-lg bg-slate-50 p-1 border border-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/products/${p.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 truncate block max-w-xs transition-colors"
                        >
                          {p.name}
                        </Link>
                        <span className="font-mono text-[10px] text-slate-400">
                          {p.sku}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {p.categoryName}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-bold">
                    {p.brandName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-black text-slate-900">
                      {p.finalPrice.toLocaleString()} EGP
                    </span>
                    {p.discountPrice && (
                      <span className="block text-[10px] text-rose-500 line-through">
                        {p.price.toLocaleString()} EGP
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {p.inStock ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {p.stockQuantity} units
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Out of stock
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <span>Add Hardware Product</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {!isAdmin && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between gap-2">
                <span>تنبيه: يجب تسجيل الدخول بحساب المسؤول (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded">admin@techxpress.com</code>) لإضافة وحفظ المنتجات.</span>
                <Link to="/login" className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px] whitespace-nowrap hover:bg-amber-700 transition-colors">
                  دخول كمسؤول
                </Link>
              </div>
            )}

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setName(newName);
                    if (!userEditedSku) {
                      setSku(generateSku(newName, brandId));
                    }
                  }}
                  placeholder="e.g. Apple MacBook Pro 16 M3 Max"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      SKU Code
                    </label>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      تلقائي
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => {
                        setSku(e.target.value);
                        setUserEditedSku(true);
                      }}
                      placeholder={generateSku(name || "Item", brandId)}
                      className="w-full h-10 px-3 pr-8 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-slate-50 text-slate-800 focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      title="إعادة توليد كود SKU تلقائي"
                      onClick={() => {
                        setSku(generateSku(name, brandId));
                        setUserEditedSku(false);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-indigo-600"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brand *
                  </label>
                  <select
                    value={brandId}
                    onChange={(e) => {
                      const newBrandId = e.target.value;
                      setBrandId(newBrandId);
                      if (!userEditedSku) {
                        setSku(generateSku(name, newBrandId));
                      }
                    }}
                    className="w-full h-10 px-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-indigo-600"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Price (EGP) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="99999"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Price (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="89999"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Product Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  Add SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <span>Edit Hardware Product</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {!isAdmin && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between gap-2">
                <span>تنبيه: يجب تسجيل الدخول بحساب المسؤول (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded">admin@techxpress.com</code>) لتعديل المنتجات.</span>
                <Link to="/login" className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px] whitespace-nowrap hover:bg-amber-700 transition-colors">
                  دخول كمسؤول
                </Link>
              </div>
            )}

            {editFormError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold">
                {editFormError}
              </div>
            )}

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setEditName(newName);
                    if (!editUserEditedSku) {
                      setEditSku(generateSku(newName, editBrandId));
                    }
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      SKU Code
                    </label>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      تلقائي
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={editSku}
                      onChange={(e) => {
                        setEditSku(e.target.value);
                        setEditUserEditedSku(true);
                      }}
                      className="w-full h-10 px-3 pr-8 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-slate-50 text-slate-800 focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      title="إعادة توليد كود SKU تلقائي"
                      onClick={() => {
                        setEditSku(generateSku(editName, editBrandId));
                        setEditUserEditedSku(false);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-indigo-600"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brand *
                  </label>
                  <select
                    value={editBrandId}
                    onChange={(e) => {
                      const newBrandId = e.target.value;
                      setEditBrandId(newBrandId);
                      if (!editUserEditedSku) {
                        setEditSku(generateSku(editName, newBrandId));
                      }
                    }}
                    className="w-full h-10 px-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-indigo-600"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Price (EGP) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Price (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editDiscountPrice}
                    onChange={(e) => setEditDiscountPrice(e.target.value)}
                    placeholder="Leave empty if no discount"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Product Image URL
                </label>
                <input
                  type="url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="editIsActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Active in Store Catalog (متاح للعرض والشراء)
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm cursor-pointer transition-colors"
                >
                  {isSubmittingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
