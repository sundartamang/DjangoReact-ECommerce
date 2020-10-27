const localhost = 'http://127.0.0.1:8000';

const api_url = '/api';

export const endpoint = `${localhost}`;

export const productListURL = `${endpoint}/products/`;
export const productDetailURL = id => `${endpoint}/products/${id}/`;
export const orderSummaryURL = `${endpoint}/order-summary/`;
export const checkoutURL = `${endpoint}/checkout/`;
export const addCouponURL = `${endpoint}/add-coupon/`;
export const addressListURL = addressType => `${endpoint}/addresses/?address_type=${addressType}`;
export const addressCreateURL = `${endpoint}/addresses/create/`;
export const addressUpdateURL = id => `${endpoint}/addresses/${id}/update/`;
export const addressDeleteURL = id => `${endpoint}/addresses/${id}/delete/`;
export const countryListURL = `${endpoint}/countries/`;
export const userIDURL = `${endpoint}/user-id/`;
export const addToCartURL = `${endpoint}/add-to-cart/`;
export const oderItemDeleteURL = id => `${endpoint}/order-items/${id}/delete/`;
export const oderItemUpdateQuantityURL = `${endpoint}/order-item/update-quantity/`;
export const paymentListURL = `${endpoint}/payments/`;





