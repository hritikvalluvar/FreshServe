from django.urls import path
from .views import order_list, order_detail, kitchen_view, packaging_bay_view

app_name = 'kitchen'

urlpatterns = [
    path('kitchen/', kitchen_view, name='kitchen_view'),
    path('packaging/', packaging_bay_view, name='packaging_bay_view'),    
    path('orders/', order_list, name='order_list'),
    path('orders/<str:order_id>/', order_detail, name='order_detail'),
]
