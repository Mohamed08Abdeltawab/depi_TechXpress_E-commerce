import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useShop } from "../../context/ShopContext";

export default function WishlistDrawer() {
  const {
    products,
    wishlist,
    toggleWishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    addToCart,
    setIsCartOpen,
    sendDirectWhatsApp
  } = useShop();

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isWishlistOpen) {
      setMounted(true);
      const timer = setTimeout(() => {
        setVisible(true);
      }, 25);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        setMounted(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isWishlistOpen]);

  if (!mounted) return null;

  const favoriteProducts = products.filter((p) => wishlist.includes(p.id));

  const addAllToCart = () => {
    favoriteProducts.forEach((p) => addToCart(p, 1));
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setIsWishlistOpen(false)}
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-500 ease-out transform ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2 font-extrabold text-base sm:text-lg text-slate-900">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>Saved Wishlist ({favoriteProducts.length})</span>
          </div>
          <button
            className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 transition-colors text-sm font-bold cursor-pointer"
            type="button"
            onClick={() => setIsWishlistOpen(false)}
            aria-label="Close wishlist drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {favoriteProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">Your wishlist is empty</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs mb-5 leading-relaxed">
                Click the heart icon on any product card to bookmark hardware specs for later comparison.
              </p>
              <Link
                to="/products"
                onClick={() => setIsWishlistOpen(false)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-colors"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            favoriteProducts.map((p) => {
              const discount = p.discountPrice && p.price > p.discountPrice
                ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
                : 0;

              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-sm"
                >
                  <Link
                    to={`/products/${p.id}`}
                    onClick={() => setIsWishlistOpen(false)}
                    className="shrink-0"
                  >
                    <img
                      className="w-16 h-16 rounded-xl object-contain bg-slate-50 p-1 border border-slate-100"
                      src={p.primaryImageUrl || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80"}
                      alt={p.name}
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${p.id}`}
                      onClick={() => setIsWishlistOpen(false)}
                      className="block font-bold text-xs sm:text-sm text-slate-900 hover:text-indigo-600 truncate mb-1"
                    >
                      {p.name}
                    </Link>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-xs font-black text-indigo-600">
                        {p.finalPrice.toLocaleString()} EGP
                      </span>
                      {Boolean(p.discountPrice && p.price > p.discountPrice) && (
                        <s className="text-[10px] text-slate-400 line-through">
                          {p.price.toLocaleString()} EGP
                        </s>
                      )}
                      {discount > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-8 px-3 rounded-lg shadow-sm transition-colors cursor-pointer"
                        onClick={() => addToCart(p, 1)}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        type="button"
                        className="inline-flex items-center gap-1 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold h-8 px-2.5 rounded-lg transition-colors cursor-pointer"
                        onClick={() => sendDirectWhatsApp(p)}
                        title="Inquire via WhatsApp"
                      >
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        className="text-xs font-semibold text-rose-500 hover:text-rose-700 p-1 ml-auto flex items-center gap-1 cursor-pointer"
                        onClick={() => toggleWishlist(p.id)}
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {favoriteProducts.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-2">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-11 rounded-xl shadow-md transition-colors cursor-pointer text-sm"
              onClick={addAllToCart}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add All Items to Cart</span>
            </button>
            <Link
              to="/wishlist"
              onClick={() => setIsWishlistOpen(false)}
              className="w-full flex items-center justify-center border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold h-10 rounded-xl transition-colors text-xs"
            >
              Open Full Wishlist Page
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
