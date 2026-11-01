import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  Flame,
  Laptop,
  Smartphone,
  Clock
} from "lucide-react";
import { useShop } from "../../context/ShopContext";
import ProductCard from "./ProductCard";
import MarqueeTicker from "../../components/common/MarqueeTicker";
import GuaranteesSection from "../../components/common/GuaranteesSection";
import ReviewsSection from "../../components/common/ReviewsSection";
import TechConciergeSection from "../../components/common/TechConciergeSection";
import { MOCK_CATEGORIES } from "../../services/mockData";

export default function HomePage() {
  const { products, openCheckoutWithProduct } = useShop();

  // Countdown timer for today's deal
  const [timeLeft, setTimeLeft] = useState({ hours: 14, mins: 35, secs: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let s = prev.secs - 1;
        let m = prev.mins;
        let h = prev.hours;
        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) {
          h = 23;
        }
        return { hours: h, mins: m, secs: s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter 4 Best Sellers
  const bestSellers = products
    .filter((p) => p.badge?.includes("Best") || p.soldCount > 100)
    .slice(0, 4);
  const displayBestSellers = bestSellers.length > 0 ? bestSellers : products.slice(0, 4);


  // Filter Laptops & Computers
  const laptops = products
    .filter((p) => p.categoryId === 1 || p.categoryName?.toLowerCase().includes("laptop"))
    .slice(0, 4);

  // Filter Smartphones & Tablets
  const smartphones = products
    .filter((p) => p.categoryId === 2 || p.categoryName?.toLowerCase().includes("smart") || p.categoryName?.toLowerCase().includes("phone"))
    .slice(0, 4);

  // Deal Product
  const dealProduct = products.find((p) => p.id === 1) || products[0];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-14 sm:py-20 lg:py-28" id="hero">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 -right-24 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Copy Column */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Next-Gen Electronics & Computing 2026</span>
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.2] tracking-tight">
                Empower Your Performance,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-400">
                  Engineered with Absolute Precision
                </span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-xl">
                Explore TechXpress for pro workstations, flagship smartphones, studio noise-cancelling audio, and 240Hz OLED gaming panels. Every device comes sealed with verified serials, full inspection before payment, and 2-year authorised warranty.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold h-12 px-7 rounded-full shadow-lg shadow-indigo-600/30 text-sm sm:text-base transition-transform active:scale-95"
                >
                  <span>Explore All Hardware</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#deal"
                  className="inline-flex items-center gap-2 border border-slate-700 bg-white/5 hover:bg-white/10 text-white font-bold h-12 px-6 rounded-full text-sm sm:text-base transition-colors"
                >
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Today's Flash Deals</span>
                </a>
              </div>

              {/* Social Proof */}
              <div className="pt-4 flex items-center gap-3 border-t border-slate-800 text-xs text-slate-300">
                <span className="text-amber-400 font-bold tracking-wider text-sm">★★★★★</span>
                <div>
                  <b className="text-white">4.9 / 5 Verified Score</b> · Trusted by over 18,000 developers, creators & gamers in Egypt
                </div>
              </div>
            </div>

            {/* Visual Showcase Column */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-72 sm:w-80 lg:w-96 aspect-square flex items-center justify-center">
                {/* Backdrop decorative rings */}
                <div className="absolute inset-0 rounded-full border border-indigo-500/20 pointer-events-none" />
                <div className="absolute inset-8 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

                {/* Floating Chip Top */}
                <div className="absolute -top-3 -right-2 z-20 flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-xl text-xs">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-white text-[10px] sm:text-[11px]">2-Year Brand Warranty</div>
                    <div className="text-[8px] sm:text-[9px] text-slate-400">Official Authorised Partner</div>
                  </div>
                </div>

                {/* Hardware Hero Image */}
                <div className="relative z-10 w-full h-full p-4 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=900&auto=format&fit=crop&q=80"
                    alt="Dell XPS 15 Flagship"
                    className="max-h-full max-w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:scale-105 transition-transform duration-500 rounded-2xl"
                  />
                </div>

                {/* Floating Chip Bottom */}
                <div className="absolute -bottom-3 -left-2 z-20 flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-xl text-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-white text-[10px] sm:text-[11px]">24 - 48h Delivery</div>
                    <div className="text-[8px] sm:text-[9px] text-slate-400">Inspect Before Paying</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <MarqueeTicker />

      {/* 1. Category Bento Grid */}
      <section className="py-14 sm:py-20 bg-white" id="categories">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 mb-2">
                Hardware Departments
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Shop by Electronic <span className="text-indigo-600">Category</span>
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 border border-slate-300 hover:border-indigo-600 hover:text-indigo-600 rounded-full h-10 px-5 text-xs font-bold transition-colors self-start sm:self-auto"
            >
              <span>Explore All Departments</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MOCK_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="group relative rounded-3xl overflow-hidden bg-slate-50 p-6 flex flex-col justify-between min-h-[260px] border border-slate-200 hover:border-indigo-500 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative z-10 space-y-1">
                  <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-full border border-indigo-100 inline-block">
                    {cat.productCount}+ Certified Models
                  </span>
                  <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 group-hover:text-indigo-600 transition-colors pt-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs">
                    {cat.description}
                  </p>
                </div>

                <div className="relative mt-4 flex items-center justify-center h-36">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="max-h-full max-w-full object-contain rounded-xl group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Best Sellers Section */}
      <section className="py-14 sm:py-20 bg-slate-50 border-y border-slate-200" id="best-sellers">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 mb-2">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> High-Demand Electronics
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Top Trending & <span className="text-indigo-600">Best Sellers</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg">
                The most sought-after laptops, smartphones, and displays with exceptional customer ratings and guaranteed in-stock availability.
              </p>
            </div>
            <Link
              to="/products?sortBy=popularity"
              className="inline-flex items-center gap-2 border border-slate-300 hover:border-indigo-600 hover:text-indigo-600 rounded-full h-10 px-5 text-xs font-bold transition-colors self-start sm:self-auto"
            >
              <span>View All Best Sellers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayBestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Deal of the Day with Live Countdown */}
      <section className="py-14 sm:py-20 bg-slate-950 text-white relative overflow-hidden" id="deal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <Clock className="w-3.5 h-3.5 text-rose-400" /> Limited 24-Hour Hardware Special
              </span>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                {dealProduct?.name || "Dell XPS 15 9530 Creator Edition"}<br />
                <span className="text-cyan-400">Save 7,000 EGP Today Only</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Elevate your workflow with 14-core Intel Core i9 performance, stunning 3.5K OLED touch display, and NVIDIA RTX 4070 studio graphics. Includes complimentary express nationwide shipping and 2-year Dell ProSupport.
              </p>

              {/* Countdown timer */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/15">
                  <span className="text-xl sm:text-2xl font-black text-cyan-400">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Hours</span>
                </div>
                <span className="text-xl font-bold text-slate-500">:</span>
                <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/15">
                  <span className="text-xl sm:text-2xl font-black text-cyan-400">
                    {String(timeLeft.mins).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Mins</span>
                </div>
                <span className="text-xl font-bold text-slate-500">:</span>
                <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/15">
                  <span className="text-xl sm:text-2xl font-black text-cyan-400">
                    {String(timeLeft.secs).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Secs</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-3 pt-4 flex-wrap">
                <button
                  type="button"
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold h-12 px-7 rounded-full shadow-lg shadow-indigo-600/30 text-sm sm:text-base transition-transform active:scale-95 cursor-pointer"
                  onClick={() => {
                    if (dealProduct) openCheckoutWithProduct(dealProduct);
                  }}
                >
                  Claim Flash Offer ({dealProduct ? dealProduct.finalPrice.toLocaleString() : "84,999"} EGP)
                </button>

                <Link
                  to={`/products/${dealProduct?.id || 1}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold h-12 px-6 rounded-full text-sm transition-colors"
                >
                  View Full Specifications
                </Link>
              </div>
            </div>

            {/* Poster with Stamp */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                {/* Save discount badge */}
                <div className="absolute top-2 left-2 z-20 flex flex-col items-center justify-center w-16 h-16 rounded-full bg-rose-600 text-white font-black text-xs shadow-xl rotate-12">
                  <span>SAVE</span>
                  <span className="text-[10px]">7,000 EGP</span>
                </div>

                <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
                <img
                  src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80"
                  alt="Dell XPS 15 Deal"
                  className="relative z-10 w-full h-full object-contain rounded-2xl drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Dedicated Laptops & Workstations Collection */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 mb-2">
                <Laptop className="w-3.5 h-3.5" /> High-Performance Computing
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Laptops, Ultrabooks & <span className="text-indigo-600">Workstations</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg">
                Engineered for software engineering, 4K rendering, and AAA gaming.
              </p>
            </div>
            <Link
              to="/products?categoryId=1"
              className="inline-flex items-center gap-2 border border-slate-300 hover:border-indigo-600 hover:text-indigo-600 rounded-full h-10 px-5 text-xs font-bold transition-colors self-start sm:self-auto"
            >
              <span>Explore All Laptops</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {laptops.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Interactive Assistant Banner (Find My Device & Compare) */}
      <section className="py-12 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Sparkles className="w-3.5 h-3.5" /> Interactive Matchmaker
              </span>
              <h3 className="text-2xl sm:text-3xl font-black">
                Find the Perfect Hardware in Under 60 Seconds
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Answer 3 quick questions about your budget, primary workload (Coding, 3D Design, Gaming, or Office), and we will narrow down your ideal machine.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
              <Link
                to="/recommendations"
                className="inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black px-6 py-3.5 rounded-full text-xs sm:text-sm shadow-lg transition-transform active:scale-95"
              >
                <span>Launch Device Finder</span>
                <Sparkles className="w-4 h-4" />
              </Link>
              <Link
                to="/compare"
                className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 text-white font-bold px-5 py-3.5 rounded-full text-xs sm:text-sm transition-colors"
              >
                <span>Side-by-Side Compare</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Dedicated Flagship Smartphones Collection */}
      <section className="py-14 sm:py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 mb-2">
                <Smartphone className="w-3.5 h-3.5" /> Mobile Technology
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Flagship Smartphones & <span className="text-indigo-600">Pro Tablets</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg">
                Featuring titanium builds, groundbreaking optical camera arrays, and all-day battery endurance.
              </p>
            </div>
            <Link
              to="/products?categoryId=2"
              className="inline-flex items-center gap-2 border border-slate-300 hover:border-indigo-600 hover:text-indigo-600 rounded-full h-10 px-5 text-xs font-bold transition-colors self-start sm:self-auto"
            >
              <span>Explore All Phones</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {smartphones.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. WhatsApp VIP Tech Concierge */}
      <TechConciergeSection />

      {/* 8. Guarantees 4-Pillars */}
      <GuaranteesSection />

      {/* 9. Real Customer Reviews */}
      <ReviewsSection />
    </div>
  );
}
