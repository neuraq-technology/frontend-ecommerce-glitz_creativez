import { createSlice } from '@reduxjs/toolkit';

const getLocalCart = () => {
    try {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    } catch {
        return [];
    }
};

const initialState = {
    items: getLocalCart(),
    isOpen: false,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addItem: (state, action) => {
            const newItem = action.payload;
            const sizeString = newItem.product.size ? `-${newItem.product.size}` : '';
            const cartItemId = newItem.cartItemId || `${newItem.product._id}${sizeString}`;

            const existingItem = state.items.find(
                (item) => item.cartItemId === cartItemId || (item.product._id === newItem.product._id && item.product.size === newItem.product.size)
            );

            if (existingItem) {
                existingItem.quantity += newItem.quantity || 1;
            } else {
                state.items.push({
                    ...newItem,
                    cartItemId,
                    quantity: newItem.quantity || 1,
                });
            }

            localStorage.setItem('cart', JSON.stringify(state.items));
        },
        removeItem: (state, action) => {
            const targetId = action.payload;
            state.items = state.items.filter(
                (item) => item.cartItemId !== targetId && item.product._id !== targetId
            );
            localStorage.setItem('cart', JSON.stringify(state.items));
        },
        updateQuantity: (state, action) => {
            const { cartItemId, quantity } = action.payload;
            const item = state.items.find((item) => item.cartItemId === cartItemId || item.product._id === cartItemId);

            if (item) {
                if (quantity <= 0) {
                    state.items = state.items.filter(
                        (i) => i.cartItemId !== cartItemId && i.product._id !== cartItemId
                    );
                } else {
                    item.quantity = quantity;
                }
            }

            localStorage.setItem('cart', JSON.stringify(state.items));
        },
        clearCart: (state) => {
            state.items = [];
            localStorage.removeItem('cart');
        },
        setCartItems: (state, action) => {
            state.items = action.payload;
            localStorage.setItem('cart', JSON.stringify(state.items));
        },
        toggleCart: (state) => {
            state.isOpen = !state.isOpen;
        },
        openCart: (state) => {
            state.isOpen = true;
        },
        closeCart: (state) => {
            state.isOpen = false;
        },
    },
});

export const {
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setCartItems,
    toggleCart,
    openCart,
    closeCart,
} = cartSlice.actions;

export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartIsOpen = (state) => state.cart.isOpen;
export const selectCartItemsCount = (state) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotal = (state) =>
    state.cart.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
    );
