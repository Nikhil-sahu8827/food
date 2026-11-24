import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  const addToCart = (foodItem, quantity = 1) => {
    if (!foodItem.available) {
      toast.error(`${foodItem.name} is currently sold out!`);
      return;
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.foodItem.id === foodItem.id);
      if (existing) {
        toast.success(`Updated ${foodItem.name} quantity to ${existing.quantity + quantity}`);
        return prev.map((i) =>
          i.foodItem.id === foodItem.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        toast.success(`Added ${foodItem.name} to cart`);
        return [...prev, { foodItem, quantity }];
      }
    });
  };

  const updateQuantity = (foodItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(foodItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.foodItem.id === foodItemId ? { ...i, quantity: newQty } : i
      )
    );
  };

  const removeFromCart = (foodItemId) => {
    setItems((prev) => prev.filter((i) => i.foodItem.id !== foodItemId));
    toast('Item removed from cart', { icon: '🗑️' });
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart_items');
  };

  const cartCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce(
    (acc, curr) => acc + Number(curr.foodItem.price) * curr.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
