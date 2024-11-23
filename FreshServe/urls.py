from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from customer.views import Index, About, Orders, ConfirmOrder, PaymentSuccess,  ContactView, menu, terms, privacy, refund, shipping
from customer.admin import site



admin.site.site_header = "Tanuja's BatterHouse"
admin.site.site_title = "Tanuja's BatterHouse"
admin.site.index_title = "Ledger"

urlpatterns = [
    # path('admin/order_list/', order_list, name='order_list'),
    path('admin/', site.urls),    
    
    path('', Index.as_view(), name='index'),
    path('about/', About.as_view(), name='about'),
    path('menu/', menu, name='menu'),
    path('contact/', ContactView.as_view(), name='contact'),
    path('order/', Orders.as_view(), name='order'),
    path('order/confirm/', ConfirmOrder.as_view(), name='order_confirm'),
    path('order/success/', PaymentSuccess.as_view(), name='order_success'),

    path('terms-and-conditions/', terms, name='terms'),
    path('privacy-policy/', privacy, name='privacy'),
    path('refund-policy/', refund, name='refund'),
    path('shipping-policy/', shipping, name='shipping'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)