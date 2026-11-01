import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback
} from "react";
import type { ProductDetailDto, ProductListItemDto } from "../types/product";
import type { CartItem, GovernorateShipping } from "../types/cart";
import { EGYPT_GOVERNORATES } from "../types/cart";
import type { UserDto } from "../types/auth";
import { authService } from "../services/authService";
import { productService } from "../services/productService";
import { cartService } from "../services/cartService";
import { toast } from "sonner";

interface ShopContextType {
  // Products
  products: ProductListItemDto[];
  isLoadingProducts: boolean;
  refreshProducts: () => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: ProductListItemDto | ProductDetailDto, qty?: number, color?: string) => void;
  updateCartQty: (productId: number, delta: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  syncCartToBackend: () => Promise<boolean>;
  totalCartCount: number;
  cartSubtotal: number;
  isFreeShipping: boolean;
  shippingFee: number;
  cartTotal: number;

  // Wishlist
  wishlist: number[];
  toggleWishlist: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;

  // Compare
  compareList: number[];
  toggleCompare: (productId: number) => void;
  isComparing: (productId: number) => boolean;
  clearCompare: () => void;

  // Modals & Drawers
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  quickProduct: ProductDetailDto | null;
  setQuickProduct: (prod: ProductDetailDto | null) => void;
  openQuickViewById: (productId: number) => Promise<void>;
  openCheckoutWithProduct: (product: ProductListItemDto | ProductDetailDto) => void;

  // Shipping
  selectedGov: GovernorateShipping;
  setSelectedGov: (gov: GovernorateShipping) => void;

  // Auth
  user: UserDto | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;

  // Actions
  sendDirectWhatsApp: (product?: ProductListItemDto | ProductDetailDto | null) => void;
}

const ShopContext = createContext<ShopContextType | null>(null);

const CART_STORAGE_KEY = "techxpress_cart";
const WISHLIST_STORAGE_KEY = "techxpress_wishlist";
const COMPARE_STORAGE_KEY = "techxpress_compare";

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ProductListItemDto[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);

  // Cart & Wishlist & Compare
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [compareList, setCompareList] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(COMPARE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickProduct, setQuickProduct] = useState<ProductDetailDto | null>(null);

  // Shipping
  const [selectedGov, setSelectedGov] = useState<GovernorateShipping>(EGYPT_GOVERNORATES[0]);

  // Auth
  const [user, setUser] = useState<UserDto | null>(() => authService.getStoredUser());

  const refreshUser = useCallback(async () => {
    if (authService.isAuthenticated()) {
      const me = await authService.getMe();
      setUser(me);
      if (me) {
        // Attempt to fetch backend cart
        try {
          const backendCart = await cartService.getCart();
          if (backendCart && backendCart.items && backendCart.items.length > 0) {
            setCart(
              backendCart.items.map((i) => ({
                id: i.id,
                productId: i.productId,
                name: i.name,
                slug: i.slug,
                sku: i.sku,
                imageUrl: i.imageUrl,
                price: i.unitPrice,
                originalPrice: i.originalPrice,
                quantity: i.quantity,
                stockQuantity: i.stockQuantity,
                isAvailable: i.isAvailable
              }))
            );
          }
        } catch {
          // preserve local cart
        }
      }
    } else {
      setUser(null);
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const res = await productService.getProducts({ pageSize: 50 });
      setProducts(res.items);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
    refreshUser();
  }, [refreshProducts, refreshUser]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // storage error
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // storage error
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareList));
    } catch {
      // storage error
    }
  }, [compareList]);

  // Cart calculations
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isFreeShipping = cartSubtotal >= 5000;
  const shippingFee = cart.length === 0 ? 0 : isFreeShipping ? 0 : selectedGov.shipping;
  const cartTotal = cartSubtotal + shippingFee;

  const addToCart = (
    product: ProductListItemDto | ProductDetailDto,
    qty = 1,
    color = ""
  ) => {
    const img =
      product.primaryImageUrl ||
      product.images?.find((i) => i.isPrimary)?.imageUrl ||
      product.images?.[0]?.imageUrl ||
      "";

    const price = product.finalPrice || product.discountPrice || product.price;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.selectedColor === color
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + qty,
        };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          imageUrl: img || undefined,
          price,
          originalPrice: product.price,
          quantity: qty,
          stockQuantity: product.stockQuantity,
          isAvailable: product.inStock,
          selectedColor: color,
        },
      ];
    });

    if (authService.isAuthenticated()) {
      cartService.addItem(product.id, qty).then((res) => {
        if (res && res.items) {
          setCart(
            res.items.map((i) => ({
              id: i.id,
              productId: i.productId,
              name: i.name,
              slug: i.slug,
              sku: i.sku,
              imageUrl: i.imageUrl || img || undefined,
              price: i.unitPrice,
              originalPrice: i.originalPrice,
              quantity: i.quantity,
              stockQuantity: i.stockQuantity,
              isAvailable: i.isAvailable,
              selectedColor: color
            }))
          );
        }
      });
    }

    toast.success(`Added "${product.name.slice(0, 32)}..." to cart`);
    setIsCartOpen(true);
  };

  const updateCartQty = (productId: number, delta: number) => {
    setCart((prev) => {
      const item = prev.find((i) => i.productId === productId);
      if (item && authService.isAuthenticated() && item.id) {
        const nextQty = item.quantity + delta;
        if (nextQty > 0) {
          cartService.updateItem(item.id, nextQty);
        } else {
          cartService.removeItem(item.id);
        }
      }
      return prev
        .map((it) => {
          if (it.productId === productId) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter((it): it is CartItem => it !== null);
    });
  };

  const removeFromCart = (productId: number) => {
    const item = cart.find((i) => i.productId === productId);
    if (item && authService.isAuthenticated() && item.id) {
      cartService.removeItem(item.id);
    }
    setCart((prev) => prev.filter((item) => item.productId !== productId));
    toast.info("Item removed from cart");
  };

  const clearCart = () => {
    if (authService.isAuthenticated()) {
      cartService.clearCart();
    }
    setCart([]);
  };

  const syncCartToBackend = async (): Promise<boolean> => {
    if (!authService.isAuthenticated() || cart.length === 0) return true;
    try {
      const backendCart = await cartService.getCart();
      if (backendCart && backendCart.items.length === 0) {
        for (const item of cart) {
          await cartService.addItem(item.productId, item.quantity);
        }
      }
      return true;
    } catch {
      return false;
    }
  };

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        toast.info("Removed from Wishlist");
        return prev.filter((id) => id !== productId);
      }
      toast.success("Saved to Wishlist ❤️");
      return [...prev, productId];
    });
  };

  const isWishlisted = (productId: number) => wishlist.includes(productId);

  const toggleCompare = (productId: number) => {
    setCompareList((prev) => {
      if (prev.includes(productId)) {
        toast.info("Removed from Compare list");
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 4) {
        toast.error("You can compare up to 4 devices at a time.");
        return prev;
      }
      toast.success("Added to Device Comparison ⚖️");
      return [...prev, productId];
    });
  };

  const isComparing = (productId: number) => compareList.includes(productId);
  const clearCompare = () => setCompareList([]);

  const openQuickViewById = async (productId: number) => {
    try {
      const full = await productService.getProductById(productId);
      setQuickProduct(full);
      // fallback to list item if null
      if (!full) {
        const found = products.find((p) => p.id === productId);
        if (found) {
          setQuickProduct({
            ...found,
            description: "Premium high-grade performance hardware engineered for enthusiasts.",
            images: found.primaryImageUrl ? [{ id: 1, imageUrl: found.primaryImageUrl, isPrimary: true, sortOrder: 0 }] : [],
            specifications: [],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: null
          });
        }
      }
    } catch {
      // error handled
    }
  };

  const openCheckoutWithProduct = (product: ProductListItemDto | ProductDetailDto) => {
    const inCart = cart.some((i) => i.productId === product.id);
    if (!inCart) {
      addToCart(product, 1);
    }
    setIsCheckoutOpen(true);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info("You have logged out.");
  };

  const sendDirectWhatsApp = (product?: ProductListItemDto | ProductDetailDto | null) => {
    const text = product
      ? `Hello TechXpress Support, I would like to inquire about and order *${product.name}* (SKU: ${product.sku}) priced at *${product.finalPrice.toLocaleString()} EGP*. Please confirm availability and delivery.`
      : `Hello TechXpress Support, I would like technical guidance regarding choosing the best electronic devices from your store.`;
    const url = `https://wa.me/201065712366?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const isAuthenticated = Boolean(user) || authService.isAuthenticated();
  const isAdmin = Boolean(user?.roles?.includes("Admin"));

  return (
    <ShopContext.Provider
      value={{
        products,
        isLoadingProducts,
        refreshProducts,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        syncCartToBackend,
        totalCartCount,
        cartSubtotal,
        isFreeShipping,
        shippingFee,
        cartTotal,
        wishlist,
        toggleWishlist,
        isWishlisted,
        compareList,
        toggleCompare,
        isComparing,
        clearCompare,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isSearchOpen,
        setIsSearchOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        quickProduct,
        setQuickProduct,
        openQuickViewById,
        openCheckoutWithProduct,
        selectedGov,
        setSelectedGov,
        user,
        isAuthenticated,
        isAdmin,
        logout,
        refreshUser,
        sendDirectWhatsApp,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
