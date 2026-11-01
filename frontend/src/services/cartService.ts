import { api } from "../lib/axios";

export interface BackendCartItemDto {
  id: number;
  productId: number;
  name: string;
  slug: string;
  sku: string;
  imageUrl?: string;
  originalPrice: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stockQuantity: number;
  isAvailable: boolean;
  issue?: string | null;
}

export interface BackendCartDto {
  items: BackendCartItemDto[];
  itemCount: number;
  subtotal: number;
  hasIssues: boolean;
}

export const cartService = {
  async getCart(): Promise<BackendCartDto | null> {
    try {
      const res = await api.get<BackendCartDto>("/cart");
      return res.data;
    } catch {
      return null;
    }
  },

  async addItem(productId: number, quantity = 1): Promise<BackendCartDto | null> {
    try {
      const res = await api.post<BackendCartDto>("/cart/items", {
        productId,
        quantity
      });
      return res.data;
    } catch (err) {
      console.warn("Failed to sync item to backend cart", err);
      return null;
    }
  },

  async updateItem(cartItemId: number, quantity: number): Promise<BackendCartDto | null> {
    try {
      const res = await api.put<BackendCartDto>(`/cart/items/${cartItemId}`, {
        quantity
      });
      return res.data;
    } catch (err) {
      console.warn("Failed to update backend cart item", err);
      return null;
    }
  },

  async removeItem(cartItemId: number): Promise<BackendCartDto | null> {
    try {
      const res = await api.delete<BackendCartDto>(`/cart/items/${cartItemId}`);
      return res.data;
    } catch (err) {
      console.warn("Failed to remove backend cart item", err);
      return null;
    }
  },

  async clearCart(): Promise<void> {
    try {
      await api.delete("/cart");
    } catch (err) {
      console.warn("Failed to clear backend cart", err);
    }
  }
};
