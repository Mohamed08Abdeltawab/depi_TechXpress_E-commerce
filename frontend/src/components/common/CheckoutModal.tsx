import { useState, type FormEvent } from "react";
import { X, CheckCircle2, Shield, Phone, MessageSquare } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { EGYPT_GOVERNORATES } from "../../types/cart";
import { orderService } from "../../services/orderService";

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    totalCartCount,
    cartSubtotal,
    isFreeShipping,
    shippingFee,
    cartTotal,
    selectedGov,
    setSelectedGov,
    clearCart,
    cart,
    syncCartToBackend,
    isAuthenticated
  } = useShop();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CashOnDelivery");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{
    orderRef: string;
    whatsappUrl: string;
  } | null>(null);

  if (!isCheckoutOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!customerName.trim()) {
      errors.name = "Please enter your full name.";
    }
    if (!customerPhone.trim() || !/^01[0125][0-9]{8}$/.test(customerPhone.trim())) {
      errors.phone = "Please enter a valid Egyptian mobile number (e.g. 01012345678).";
    }
    if (!customerAddress.trim()) {
      errors.address = "Please enter your complete delivery address.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      let activeRef = `TXP-${Date.now().toString().slice(-6)}`;

      if (isAuthenticated) {
        try {
          await syncCartToBackend();
          const address = await orderService.createAddress({
            recipientName: customerName.trim(),
            phoneNumber: customerPhone.trim(),
            city: selectedGov.name,
            street: customerAddress.trim(),
            isDefault: true
          });

          const created = await orderService.createOrder({
            addressId: address.id,
            paymentMethod: "CashOnDelivery"
          });
          if (created && created.orderNumber) {
            activeRef = created.orderNumber;
          }
        } catch (err) {
          console.warn("Backend order creation error, using fallback reference:", err);
        }
      }

      // WhatsApp tracking message
      const itemsList = cart.map((i) => `• ${i.name} (Qty: ${i.quantity})`).join("\n");
      const msg = `Hello TechXpress,\nI have submitted Order *#${activeRef}*:\nCustomer: ${customerName}\nPhone: ${customerPhone}\nCity: ${selectedGov.name}\nAddress: ${customerAddress}\nPayment: ${paymentMethod === 'CashOnDelivery' ? 'Cash on Delivery (after inspection)' : 'Digital / InstaPay'}\n\n*Items:*\n${itemsList}\n\n*Total Amount:* ${cartTotal.toLocaleString()} EGP`;
      const waUrl = `https://wa.me/201065712366?text=${encodeURIComponent(msg)}`;

      setCompletedOrder({
        orderRef: activeRef,
        whatsappUrl: waUrl
      });
      clearCart();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsCheckoutOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">
              Fast Order Confirmation & Invoice Reservation
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Confirm your delivery info to generate a unique #TXP order tracking reference.
            </p>
          </div>
          <button
            className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 transition-colors text-sm font-bold cursor-pointer"
            type="button"
            onClick={() => setIsCheckoutOpen(false)}
            aria-label="Close checkout modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="font-extrabold text-xl text-slate-900">
              Your Order Has Been Successfully Registered!
            </h3>

            <div className="bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-2xl p-4 my-4 text-indigo-950">
              <span className="text-xs font-semibold text-indigo-700">Your Unique Order Tracking Code:</span>
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 tracking-wider my-1">
                #{completedOrder.orderRef}
              </div>
              <small className="text-[11px] text-indigo-700">
                Keep this code to track your shipment status with customer care
              </small>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              Our fulfillment team has queued your order for packaging. You can also monitor your dispatch live via WhatsApp:
            </p>

            <div className="space-y-2 pt-2">
              <a
                href={completedOrder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold h-12 rounded-xl text-sm shadow-md transition-colors"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Track Order on WhatsApp (#{completedOrder.orderRef})</span>
              </a>

              <button
                type="button"
                className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold h-10 rounded-xl text-xs transition-colors cursor-pointer"
                onClick={() => {
                  setCompletedOrder(null);
                  setIsCheckoutOpen(false);
                }}
              >
                Return to Store
              </button>
            </div>
          </div>
        ) : (
          <form className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Mostafa Ahmed Mohamed"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-sm outline-none transition-colors ${
                  formErrors.name ? "border-rose-500 focus:border-rose-500" : "border-slate-300 focus:border-indigo-600"
                }`}
              />
              {formErrors.name && (
                <span className="text-[11px] font-semibold text-rose-500">{formErrors.name}</span>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Egyptian Mobile Number (WhatsApp) *</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className={`w-full h-11 px-3.5 pr-10 rounded-xl border text-sm outline-none transition-colors ${
                    formErrors.phone ? "border-rose-500 focus:border-rose-500" : "border-slate-300 focus:border-indigo-600"
                  }`}
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {formErrors.phone && (
                <span className="text-[11px] font-semibold text-rose-500">{formErrors.phone}</span>
              )}
            </div>

            {/* Governorate */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Governorate / Delivery Zone *</label>
              <select
                value={selectedGov.id}
                onChange={(e) => {
                  const g = EGYPT_GOVERNORATES.find((gov) => gov.id === e.target.value);
                  if (g) setSelectedGov(g);
                }}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 outline-none focus:border-indigo-600 cursor-pointer"
              >
                {EGYPT_GOVERNORATES.map((gov) => (
                  <option key={gov.id} value={gov.id}>
                    {gov.name} ({gov.nameAr}) — {gov.shipping === 0 ? "Free" : `${gov.shipping} EGP`} ({gov.days})
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Full Street Address & Landmark *</label>
              <input
                type="text"
                placeholder="District, street name, building number, apartment/office"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-sm outline-none transition-colors ${
                  formErrors.address ? "border-rose-500 focus:border-rose-500" : "border-slate-300 focus:border-indigo-600"
                }`}
              />
              {formErrors.address && (
                <span className="text-[11px] font-semibold text-rose-500">{formErrors.address}</span>
              )}
            </div>

            {/* Payment Method */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-800 block mb-2">Payment Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                  paymentMethod === "CashOnDelivery"
                    ? "border-indigo-600 bg-indigo-50/60 text-slate-900 ring-1 ring-indigo-500"
                    : "border-slate-200 text-slate-600"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="CashOnDelivery"
                    checked={paymentMethod === "CashOnDelivery"}
                    onChange={() => setPaymentMethod("CashOnDelivery")}
                    className="accent-indigo-600"
                  />
                  <span>Cash on Delivery (After Test)</span>
                </label>

                <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                  paymentMethod === "InstaPay"
                    ? "border-indigo-600 bg-indigo-50/60 text-slate-900 ring-1 ring-indigo-500"
                    : "border-slate-200 text-slate-600"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="InstaPay"
                    checked={paymentMethod === "InstaPay"}
                    onChange={() => setPaymentMethod("InstaPay")}
                    className="accent-indigo-600"
                  />
                  <span>InstaPay / Smart Wallet</span>
                </label>
              </div>
            </div>

            {/* Order Totals Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal ({totalCartCount}):</span>
                <span className="font-bold text-slate-900">{cartSubtotal.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping ({selectedGov.name}):</span>
                <span className="font-bold text-emerald-600">
                  {isFreeShipping || shippingFee === 0 ? "Free Shipping 🔥" : `${shippingFee.toLocaleString()} EGP`}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm sm:text-base font-extrabold text-slate-900">
                <span>Total Amount to Pay:</span>
                <span className="text-indigo-600 text-base sm:text-lg">{cartTotal.toLocaleString()} EGP</span>
              </div>
            </div>

            {/* Reassurance */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Zero Risk: You can open your parcel, test your electronic device, and verify specs with the courier before paying.
              </span>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={submitting || totalCartCount === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-12 rounded-xl text-sm sm:text-base shadow-lg shadow-indigo-600/20 transition-transform active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Reserving Order Reference..." : `Confirm Order (${cartTotal.toLocaleString()} EGP)`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
