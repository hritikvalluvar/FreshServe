from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from customer.views import Index, About, Orders, ConfirmOrder, PaymentSuccess

admin.site.site_header = "Tanuja's BatterHouse"
admin.site.site_title = "Tanuja's BatterHouse"
admin.site.index_title = "Ledger"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', Index.as_view(), name='index'),
    path('about/', About.as_view(), name='about'),
    path('order/', Orders.as_view(), name='order'),
    path('order/confirm/', ConfirmOrder.as_view(), name='order_confirm'),
    path('order/success/', PaymentSuccess.as_view(), name='order_success'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
