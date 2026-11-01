import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  MessageSquare,
  ShoppingBag,
  AlertCircle
} from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { EGYPT_GOVERNORATES } from "../../types/cart";
import { orderService } from "../../services/orderService";
import type { AddressDto } from "../../types/order";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    cartSubtotal,
    isFreeShipping,
    selectedGov,
    setSelectedGov,
    shippingFee,
    cartTotal,
    clearCart,
    syncCartToBackend,
    isAuthenticated,
    user
  } = useShop();

  // Contact form state
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [email, setEmail] = useState(user?.email || "");

  // Address form state
  const [governorate, setGovernorate] = useState(selectedGov.name);
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [notes, setNotes] = useState("");

  // Saved addresses for logged-in users
  const [savedAddresses, setSavedAddresses] = useState<AddressDto[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<"CashOnDelivery" | "InstaPay">("CashOnDelivery");

  // Promo code
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Load saved addresses if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      orderService.getAddresses().then((res) => {
        if (res && res.length > 0) {
          setSavedAddresses(res);
          const defaultAddr = res.find((a) => a.isDefault) || res[0];
          setSelectedAddressId(defaultAddr.id);
          setUseCustomAddress(false);
        } else {
          setUseCustomAddress(true);
        }
      });
    } else {
      setUseCustomAddress(true);
    }
  }, [isAuthenticated]);

  // Update governorate in shop context when changed
  const handleGovChange = (govName: string) => {
    setGovernorate(govName);
    const found = EGYPT_GOVERNORATES.find((g) => g.name === govName);
    if (found) {
      setSelectedGov(found);
    }
  };

  const applyPromo = () => {
    setPromoError("");
    const code = promoCode.trim().toUpperCase();
    if (code === "TECH10" || code === "WELCOME10") {
      setDiscountAmount(Math.round(cartSubtotal * 0.1));
      setPromoApplied(true);
    } else if (code === "EGYPTFREE") {
      setDiscountAmount(shippingFee);
      setPromoApplied(true);
    } else {
      setPromoError("Invalid promo code. Try TECH10 for 10% off hardware.");
    }
  };

  const finalOrderTotal = Math.max(0, cartTotal - discountAmount);

  // Submit checkout
  const handleSubmitOrder = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (cart.length === 0) {
      setFormError("Your shopping cart is empty.");
      return;
    }

    if (!fullName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }

    // Phone validation for Egyptian formats
    const phoneClean = phone.trim();
    const phoneRegex = /^\+?[0-9\s\-]{7,20}$/;
    if (!phoneRegex.test(phoneClean)) {
      setFormError("Please enter a valid phone number for courier delivery coordination.");
      return;
    }

    if (useCustomAddress || !selectedAddressId) {
      if (!street.trim()) {
        setFormError("Please enter your detailed delivery street address.");
        return;
      }
      if (!city.trim()) {
        setFormError("Please enter your city / district.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let resolvedAddressId = selectedAddressId;

      // If user is authenticated and entering a new address, save it first
      if (isAuthenticated && useCustomAddress) {
        try {
          const newAddr = await orderService.createAddress({
            recipientName: fullName,
            phoneNumber: phoneClean,
            city: `${governorate} - ${city}`,
            street: street,
            buildingNumber: building || undefined,
            additionalDetails: notes || undefined,
            isDefault: savedAddresses.length === 0
          });
          resolvedAddressId = newAddr.id;
        } catch {
          // Fallback if backend rejects or is offline
          resolvedAddressId = 1;
        }
      }

      let orderReference = `TXP-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      if (isAuthenticated && resolvedAddressId) {
        try {
          await syncCartToBackend();
          const createdOrder = await orderService.createOrder({
            addressId: resolvedAddressId,
            paymentMethod: paymentMethod === "CashOnDelivery" ? "CashOnDelivery" : "CashOnDelivery"
          });
          if (createdOrder && createdOrder.orderNumber) {
            orderReference = createdOrder.orderNumber;
          }
        } catch (orderErr) {
          console.warn("Backend order creation error, using reference fallback:", orderErr);
        }
      }

      // Store order details in localStorage for confirmation page retrieval
      const completedOrderData = {
        orderNumber: orderReference,
        createdAt: new Date().toISOString(),
        customerName: fullName,
        phone: phoneClean,
        email: email || "customer@techxpress.eg",
        governorate,
        city: city || "Cairo Central",
        street: street || "Main Avenue",
        building: building || "",
        items: cart,
        subtotal: cartSubtotal,
        shippingFee: isFreeShipping ? 0 : shippingFee,
        discountAmount,
        totalAmount: finalOrderTotal,
        paymentMethod: paymentMethod === "CashOnDelivery" ? "Cash on Delivery" : "InstaPay Egypt",
        status: "Pending Inspection"
      };

      localStorage.setItem("techxpress_last_order", JSON.stringify(completedOrderData));

      // Clear the cart
      clearCart();

      // Navigate to confirmation
      navigate(`/order-confirmation/${orderReference}`);
    } catch (err: any) {
      setFormError(err?.message || "Failed to submit order. Please try again or order via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Your Shopping Cart is Empty</h1>
          <p className="text-xs sm:text-sm text-slate-500 mb-8">
            You don't have any hardware items in your cart to checkout.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            <span>Explore Electronics Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-indigo-600 transition-colors">Cart</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Secure Checkout</span>
        </nav>

        {/* Page Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted Hardware Procurement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Checkout & Nationwide Delivery
          </h1>
        </div>

        {formError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Fields */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Contact Information */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                    1
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Contact Information
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Step 1 of 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Eng. Mohamed Ahmed"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Egyptian Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-xs sm:text-sm font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Used by express courier for delivery coordination.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address <span className="text-slate-400 font-normal">(For invoice & tracking)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@example.com"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Destination */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                    2
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Shipping Destination
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Step 2 of 3</span>
              </div>

              {/* Saved Addresses Selector (if logged in and has addresses) */}
              {isAuthenticated && savedAddresses.length > 0 && (
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Saved Delivery Addresses:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    {savedAddresses.map((addr) => {
                      const isSel = !useCustomAddress && selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setUseCustomAddress(false);
                          }}
                          className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                            isSel
                              ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-slate-900">{addr.recipientName}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 line-clamp-2">
                            {addr.city}, {addr.street}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">{addr.phoneNumber}</div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setUseCustomAddress(!useCustomAddress)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    {useCustomAddress ? "← Choose a saved address instead" : "+ Enter a different delivery address"}
                  </button>
                </div>
              )}

              {(useCustomAddress || savedAddresses.length === 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Governorate <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={governorate}
                      onChange={(e) => handleGovChange(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 text-xs sm:text-sm font-semibold"
                    >
                      {EGYPT_GOVERNORATES.map((g) => (
                        <option key={g.name} value={g.name}>
                          {g.name} — {isFreeShipping ? "FREE Shipping" : `${g.shipping} EGP`} ({g.days})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      City / District <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required={useCustomAddress}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. New Cairo, Nasr City, Dokki"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Street Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required={useCustomAddress}
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Street name, landmark, prominent office or store"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Building / Floor / Apartment
                    </label>
                    <input
                      type="text"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      placeholder="e.g. Bldg 14, 3rd Floor, Apt 302"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Delivery Instructions
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Leave with reception, call upon arrival"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-xs sm:text-sm font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Payment Method */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                    3
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Payment Method
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Step 3 of 3</span>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery option */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === "CashOnDelivery"
                      ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "CashOnDelivery"}
                    onChange={() => setPaymentMethod("CashOnDelivery")}
                    className="mt-1 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">
                        Cash on Delivery (COD) — 0% Advance Risk
                      </span>
                      <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Most Popular in Egypt
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Inspect the factory seals, verify the serial numbers, and unbox before handing over payment to our certified tech courier.
                    </p>
                  </div>
                </label>

                {/* InstaPay option */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === "InstaPay"
                      ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "InstaPay"}
                    onChange={() => setPaymentMethod("InstaPay")}
                    className="mt-1 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">
                        InstaPay / Instant Bank Transfer
                      </span>
                      <span className="text-[10px] font-black uppercase text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded">
                        Fast Clearance
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Transfer directly via Central Bank of Egypt InstaPay network to our official corporate account. Order is released immediately.
                    </p>
                  </div>
                </label>
              </div>

              {/* Guarantees Box */}
              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>2-Year Official Agent Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>14-Day Free Replacement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm sticky top-24">
              <h3 className="text-lg font-black text-slate-900 mb-4 pb-4 border-b border-slate-100">
                Order Summary ({cart.length} {cart.length === 1 ? "device" : "devices"})
              </h3>

              {/* Items List */}
              <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200"}
                      alt={item.name}
                      className="w-12 h-12 object-contain rounded-lg bg-slate-50 p-1 border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Qty: {item.quantity} × {item.price.toLocaleString()} EGP
                      </div>
                    </div>
                    <div className="text-xs font-black text-slate-900">
                      {(item.price * item.quantity).toLocaleString()} EGP
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="mb-6 pt-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code (e.g. TECH10)"
                    disabled={promoApplied}
                    className="flex-1 h-10 px-3 rounded-xl border border-slate-200 uppercase text-xs font-bold focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={promoApplied}
                    className="px-4 h-10 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer disabled:bg-slate-300"
                  >
                    {promoApplied ? "Applied" : "Apply"}
                  </button>
                </div>
                {promoApplied && (
                  <div className="text-[11px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Coupon applied successfully!</span>
                  </div>
                )}
                {promoError && (
                  <div className="text-[11px] font-semibold text-rose-500 mt-1.5">
                    {promoError}
                  </div>
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2.5 text-xs text-slate-600 pt-4 border-t border-slate-100 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{cartSubtotal.toLocaleString()} EGP</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping ({governorate})</span>
                  <span className="font-bold text-slate-900">
                    {isFreeShipping ? (
                      <span className="text-emerald-600 font-extrabold">FREE Express Delivery</span>
                    ) : (
                      `${shippingFee} EGP`
                    )}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Discount Code</span>
                    <span>- {discountAmount.toLocaleString()} EGP</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-indigo-600">{finalOrderTotal.toLocaleString()} EGP</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-400"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Securing Order...
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Confirm Order ({finalOrderTotal.toLocaleString()} EGP)</span>
                  </>
                )}
              </button>

              {/* WhatsApp Alternative */}
              <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <a
                  href={`https://wa.me/201000000000?text=Hello%20TechXpress,%20I%20would%20like%20to%20order%20these%20devices:%20${encodeURIComponent(
                    cart.map((i) => `${i.quantity}x ${i.name}`).join(", ")
                  )}.%20Total:%20${finalOrderTotal}%20EGP.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Prefer to finalize via WhatsApp Concierge?</span>
                </a>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
