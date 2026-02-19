import { track } from '@vercel/analytics'

export const analytics = {
    trackProductView: (productId: string, name: string) => {
        track('Product Viewed', { productId, name })
    },
    trackAddToCart: (productId: string, name: string, price: number) => {
        track('Add to Cart', { productId, name, price })
    },
    trackOrderPlaced: (orderId: string, total: number) => {
        track('Order Placed', { orderId, total })
    }
}
