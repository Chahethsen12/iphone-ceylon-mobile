import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      
      // Calculate total items in cart 
      totalItems: () => get().cart.reduce((total, item) => total + item.quantity, 0),
      
      // Calculate total price of cart
      totalPrice: () => get().cart.reduce((total, item) => total + (item.price * item.quantity), 0),

      addToCart: (product, variant) => {
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (item) => item._id === product._id && item.variant?.color === variant?.color
          );

          if (existingIndex !== -1) {
            // Item exists with same variant, increment quantity
            const newCart = [...state.cart];
            newCart[existingIndex].quantity += 1;
            return { cart: newCart };
          }
          
          // New item or variant
          return { cart: [...state.cart, { ...product, variant, quantity: 1 }] };
        });
      },

      removeFromCart: (productId, variantColor) => {
        set((state) => ({
          cart: state.cart.filter(
            (item) => !(item._id === productId && item.variant?.color === variantColor)
          ),
        }));
      },

      clearCart: () => set({ cart: [] })
    }),
    {
      name: 'apple-clone-cart-storage', // name of the item in the storage (must be unique)
    }
  )
);
