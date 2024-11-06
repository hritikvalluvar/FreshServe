from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from customer.views import Index, About, Orders, ConfirmOrder, PaymentSuccess, shop_management_view
from django.contrib.auth import views as auth_views


admin.site.site_header = "Tanuja's BatterHouse"
admin.site.site_title = "Tanuja's BatterHouse"
admin.site.index_title = "Ledger"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('shop-management/', shop_management_view, name='shop_management'),
    path('kitchen/', include('kitchen.urls')),
    path('accounts/login/', auth_views.LoginView.as_view(), name='login'),  # Add this line
    path('accounts/logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('', Index.as_view(), name='index'),
    path('about/', About.as_view(), name='about'),
    path('order/', Orders.as_view(), name='order'),
    path('order/confirm/', ConfirmOrder.as_view(), name='order_confirm'),
    path('order/success/', PaymentSuccess.as_view(), name='order_success'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
