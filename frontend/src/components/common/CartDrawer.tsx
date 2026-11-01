import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ShoppingBag, Trash2, ArrowRight, Truck } from "lucide-react";
import { useShop } from "../../context/ShopContext";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    totalCartCount,
    cartSubtotal,
    isFreeShipping,
    updateCartQty,
    removeFromCart,
    setIsCheckoutOpen
  } = useShop();

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isCartOpen) {
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
  }, [isCartOpen]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-500 ease-out transform ${
          visible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5 font-extrabold text-base sm:text-lg text-slate-900">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <span>Shopping Cart ({totalCartCount})</span>
          </div>
          <button
            className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 transition-colors text-sm font-bold cursor-pointer"
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="p-3.5 bg-indigo-50/60 border-b border-indigo-100">
          <div className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            {isFreeShipping ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Congratulations! Your order qualifies for Free Nationwide Delivery!</span>
              </span>
            ) : (
              <span>
                Add <b className="text-indigo-600 font-bold">{(5000 - cartSubtotal).toLocaleString()} EGP</b> more for Free Delivery
              </span>
            )}
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (cartSubtotal / 5000) * 100)}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">Your cart is currently empty</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs mb-5 leading-relaxed">
                Explore our catalog of laptops, flagship smartphones, monitors, and gaming gear.
              </p>
              <Link
                to="/products"
                onClick={() => setIsCartOpen(false)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-colors"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.productId}-${item.selectedColor || ''}`}
                className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors shadow-sm"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 p-1 border border-slate-100 shrink-0 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      className="w-full h-full object-contain"
                      src={item.imageUrl}
                      alt={item.name}
                    />
                  ) : (
                    <div className="text-xs text-slate-400 font-bold">Tech</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate mb-1" title={item.name}>
                    {item.name}
                  </h4>
                  <div className="text-xs font-black text-indigo-600 mb-2">
                    {item.price.toLocaleString()} EGP
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold text-sm cursor-pointer"
                        onClick={() => updateCartQty(item.productId, -1)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold text-sm cursor-pointer"
                        onClick={() => updateCartQty(item.productId, 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer p-1"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between text-sm sm:text-base font-bold text-slate-800">
              <span>Subtotal:</span>
              <span className="font-black text-lg text-indigo-600">
                {cartSubtotal.toLocaleString()} EGP
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/cart"
                onClick={() => setIsCartOpen(false)}
                className="flex items-center justify-center border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm h-11 rounded-xl transition-colors"
              >
                View Full Cart
              </Link>
              <button
                type="button"
                className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm h-11 rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
              >
                Fast Checkout
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
