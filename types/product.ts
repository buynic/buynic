export interface Product {
  id: string
  product_id: string
  name: string
  description: string
  actual_price: number
  wholesale_price?: number
  sale_price: number
  image_url: string
  base_rating: number
  base_review_count: number
  return_policy: string
  active: boolean
}
