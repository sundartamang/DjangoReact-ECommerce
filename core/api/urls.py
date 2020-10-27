from django.urls import path
from .views import (
    ListItemView,
    AddToCartView,
    OrderDetailView,
    PaymentView,
    AddCouponView,
    ItemDetailView,
    AddressListView,
    AddressCreateView,
    countryListView,
    UserIDView,
    AddressUpdateView,
    AddressDeleteView,
    orderItemDeleteView,
    OrderQuantityUpdateView,
    PaymentAPIView
)

urlpatterns = [
    path('addresses/', AddressListView.as_view(), name='address-list'),
    path('addresses/create/', AddressCreateView.as_view(), name='address-create'),
    path('addresses/<pk>/update/', AddressUpdateView.as_view(), name='address-update'),
    path('addresses/<pk>/delete/', AddressDeleteView.as_view(), name='address-delete'),
    path('products/', ListItemView.as_view(), name='products'),
    path('products/<pk>/', ItemDetailView.as_view(), name='product-detail'),
    path('add-to-cart/', AddToCartView.as_view(), name='add-to-cart'),
    path('order-summary/', OrderDetailView.as_view(), name='order-summary'),
    path('add-coupon/', AddCouponView.as_view(), name='add-coupon'),
    path('checkout/', PaymentView.as_view(), name='checkout'),
    path('countries/', countryListView.as_view(), name='country-list'),
    path('user-id/', UserIDView.as_view(), name='user-id'),
    path('order-items/<pk>/delete/', orderItemDeleteView.as_view(), name='oder-item-delete'),
    path('order-item/update-quantity/', OrderQuantityUpdateView.as_view(), name='oder-item-update-quantity'),
    path('payments/', PaymentAPIView.as_view(), name='payment-list'),
]
