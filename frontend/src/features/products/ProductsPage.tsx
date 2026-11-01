import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Filter, RotateCcw, Cpu } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import ProductCard from "./ProductCard";
import { productService } from "../../services/productService";
import { MOCK_CATEGORIES, MOCK_BRANDS } from "../../services/mockData";
import type { CategoryDto, BrandDto } from "../../types/product";

export default function ProductsPage() {
  const { products, isLoadingProducts } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query params
  const categoryParam = searchParams.get("categoryId");
  const brandParam = searchParams.get("brandId");
  const searchParam = searchParams.get("search");
  const sortParam = searchParams.get("sortBy");

  // State
  const [activeCategory, setActiveCategory] = useState<number | null>(
    categoryParam ? Number(categoryParam) : null
  );
  const [activeBrand, setActiveBrand] = useState<number | null>(
    brandParam ? Number(brandParam) : null
  );
  const [searchQuery, setSearchQuery] = useState(searchParam || "");
  const [activeSort, setActiveSort] = useState(sortParam || "featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [categories, setCategories] = useState<CategoryDto[]>(MOCK_CATEGORIES);
  const [brands, setBrands] = useState<BrandDto[]>(MOCK_BRANDS);

  useEffect(() => {
    productService.getCategories().then((res) => {
      if (res && res.length > 0) setCategories(res);
    });
    productService.getBrands().then((res) => {
      if (res && res.length > 0) setBrands(res);
    });
  }, []);

  // Sync with searchParams when URL changes
  useEffect(() => {
    if (categoryParam) setActiveCategory(Number(categoryParam));
    else setActiveCategory(null);

    if (brandParam) setActiveBrand(Number(brandParam));
    else setActiveBrand(null);

    if (searchParam) setSearchQuery(searchParam);
    if (sortParam) setActiveSort(sortParam);
  }, [categoryParam, brandParam, searchParam, sortParam]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category
    if (activeCategory) {
      result = result.filter((p) => p.categoryId === activeCategory);
    }

    // Brand
    if (activeBrand) {
      result = result.filter((p) => p.brandId === activeBrand);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brandName.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    // In stock
    if (inStockOnly) {
      result = result.filter((p) => p.stockQuantity > 0);
    }

    // Price range
    if (minPrice !== "" && !isNaN(Number(minPrice))) {
      result = result.filter((p) => p.finalPrice >= Number(minPrice));
    }
    if (maxPrice !== "" && !isNaN(Number(maxPrice))) {
      result = result.filter((p) => p.finalPrice <= Number(maxPrice));
    }

    // Sort
    if (activeSort === "price-low") {
      result.sort((a, b) => a.finalPrice - b.finalPrice);
    } else if (activeSort === "price-high") {
      result.sort((a, b) => b.finalPrice - a.finalPrice);
    } else if (activeSort === "popularity" || activeSort === "bestseller") {
      result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    } else if (activeSort === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (activeSort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [
    products,
    activeCategory,
    activeBrand,
    searchQuery,
    inStockOnly,
    minPrice,
    maxPrice,
    activeSort,
  ]);

  const resetAllFilters = () => {
    setActiveCategory(null);
    setActiveBrand(null);
    setSearchQuery("");
    setActiveSort("featured");
    setInStockOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setSearchParams({});
  };

  const hasActiveFilters =
    activeCategory !== null ||
    activeBrand !== null ||
    searchQuery.trim() !== "" ||
    inStockOnly ||
    minPrice !== "" ||
    maxPrice !== "" ||
    activeSort !== "featured";

  return (
    <div className="pb-16 bg-slate-50 min-h-screen">
      {/* Catalog Hero Banner */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-10 sm:py-14 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 font-semibold" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Electronics Catalog</span>
            {activeCategory && (
              <>
                <span>/</span>
                <span className="text-cyan-400">
                  {categories.find((c) => c.id === activeCategory)?.name || "Category"}
                </span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
                Hardware Inventory 2026
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                TechXpress <span className="text-cyan-400">Electronics Catalog</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Browse factory-sealed computing workstations, flagship mobile phones, ANC headsets, and pro gaming displays with guaranteed inspection on delivery.
              </p>
            </div>

            {/* In-page Search Bar */}
            <div className="w-full md:w-80 relative">
              <input
                type="search"
                placeholder="Filter by name, model, specs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 px-4 pl-10 rounded-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar (Sticky on sm+) */}
      <section className="sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2.5">
          {/* Categories Horizontal Scroll Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-bold text-slate-400 shrink-0 mr-1">Categories:</span>
            <button
              type="button"
              onClick={() => {
                setActiveCategory(null);
                setSearchParams({});
              }}
              className={`px-3.5 py-2 min-h-[36px] rounded-full text-xs font-bold shrink-0 transition-all flex items-center justify-center cursor-pointer ${
                activeCategory === null
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Electronics
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearchParams({ categoryId: String(cat.id) });
                }}
                className={`px-3.5 py-2 min-h-[36px] rounded-full text-xs font-bold shrink-0 transition-all flex items-center justify-center cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sub Row: Brands, Sort, Stock toggle, Filter reset */}
          <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-slate-100 text-xs">
            {/* Brands Pills */}
            <div className="hidden lg:flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-400">Brand:</span>
              <button
                type="button"
                onClick={() => setActiveBrand(null)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeBrand === null
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                All
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setActiveBrand(b.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeBrand === b.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>

            {/* Mobile Filter Trigger */}
            <button
              type="button"
              onClick={() => setShowMobileFilters((v) => !v)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-slate-700 bg-white"
            >
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span>Filters</span>
            </button>

            {/* In-Stock Toggle */}
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>

            {/* Sort & Reset */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="font-bold text-slate-400">Sort:</span>
              <select
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="featured">Featured & Recommended</option>
                <option value="popularity">Best Sellers & Popular</option>
                <option value="rating">Top Rated (Stars)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Product Name (A-Z)</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline px-2 py-1 cursor-pointer"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filter Tray */}
          {showMobileFilters && (
            <div className="lg:hidden pt-3 border-t border-slate-200 space-y-3 animate-in slide-in-from-top-2">
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Filter by Brand:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  <button
                    type="button"
                    onClick={() => setActiveBrand(null)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      activeBrand === null ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    All Brands
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setActiveBrand(b.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 ${
                        activeBrand === b.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Price (EGP):</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded border border-slate-300 text-xs outline-none"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-24 px-2 py-1 rounded border border-slate-300 text-xs outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Product Results */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500 font-semibold">
          <span>
            Showing <b className="text-slate-900">{filteredProducts.length}</b> of{" "}
            <b className="text-slate-900">{products.length}</b> electronic devices
          </span>
        </div>

        {isLoadingProducts ? (
          <div className="py-24 text-center space-y-3">
            <Cpu className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">Loading hardware catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl mb-3">
              🔍
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-1">No Matching Hardware Found</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              We couldn't find any products matching your active filters. Try clearing some filters or searching for another keyword.
            </p>
            <button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-3 rounded-full shadow-md transition-colors cursor-pointer"
              onClick={resetAllFilters}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
