import { apiSlice } from './apiSlice';

export const productsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query({
            query: (params) => ({
                url: '/products',
                params,
            }),
            providesTags: ['Product'],
        }),
        getProductById: builder.query({
            query: (id) => `/products/${id}`,
            providesTags: (result, error, id) => [{ type: 'Product', id }],
        }),
        getFeaturedProducts: builder.query({
            query: (limit) => `/products/featured${limit ? `?limit=${limit}` : ''}`,
            providesTags: ['Product'],
        }),
        getBestSellingProducts: builder.query({
            query: (limit) => `/products/bestsellers${limit ? `?limit=${limit}` : ''}`,
            providesTags: ['Product'],
        }),
        getRelatedProducts: builder.query({
            query: (id) => `/products/${id}/related`,
            providesTags: ['Product'],
        }),
        getCategories: builder.query({
            query: () => '/products/categories',
            providesTags: ['Category'],
        }),
        getProductsByCategory: builder.query({
            query: ({ slug, page, limit }) =>
                `/products/category/${slug}?page=${page || 1}&limit=${limit || 12}`,
            providesTags: ['Product'],
        }),

        createReview: builder.mutation({
            query: ({ productId, ...data }) => ({
                url: `/products/${productId}/reviews`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, { productId }) => [
                { type: 'Product', id: productId },
            ],
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductByIdQuery,
    useGetFeaturedProductsQuery,
    useGetBestSellingProductsQuery,
    useGetRelatedProductsQuery,
    useGetCategoriesQuery,
    useGetProductsByCategoryQuery,

    useCreateReviewMutation,
} = productsApi;
