import { apiSlice } from './apiSlice';

export const ordersApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (data) => ({
                url: '/orders',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Order', 'Cart'],
        }),
        getMyOrders: builder.query({
            query: () => '/orders',
            providesTags: ['Order'],
        }),
        createRazorpayOrder: builder.mutation({
            query: (id) => ({
                url: `/orders/${id}/razorpay`,
                method: 'POST',
            }),
        }),
        verifyRazorpayPayment: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/orders/${id}/verify-payment`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
        }),
        getOrderById: builder.query({
            query: (id) => `/orders/${id}`,
            providesTags: (result, error, id) => [{ type: 'Order', id }],
        }),
        cancelOrder: builder.mutation({
            query: (id) => ({
                url: `/orders/${id}/cancel`,
                method: 'PUT',
            }),
            invalidatesTags: ['Order'],
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useGetMyOrdersQuery,
    useGetOrderByIdQuery,
    useCancelOrderMutation,
    useCreateRazorpayOrderMutation,
    useVerifyRazorpayPaymentMutation,
} = ordersApi;
