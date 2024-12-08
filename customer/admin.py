from django.contrib import admin 
from django.urls import path
from .models import Product, GateClosed, ShopClosed, Order, OrderItem, OrderAvailability
from django.utils.html import format_html
from .views import shop_management, order_list, packaging_bay_view, kitchen_view, sorting_bay
from django.contrib.admin import AdminSite
from phonepe.sdk.pg.payments.v1.payment_client import PhonePePaymentClient
from phonepe.sdk.pg.env import Env

# Custom Admin Site
class CustomAdminSite(AdminSite):
    site_header = "FreshServe Admin"
    site_title = "FreshServe Admin Portal"
    index_title = "Welcome to FreshServe Admin"

    def get_urls(self):
        custom_urls = [
            path('shop_management/', self.admin_view(shop_management), name="shop_management"),
            path('order_list/', self.admin_view(order_list), name="order_list"),
            path('packaging_bay/', self.admin_view(packaging_bay_view), name="packaging_bay"),
            path('kitchen_view/', self.admin_view(kitchen_view), name="kitchen_view"),
            path('sorting_bay/', self.admin_view(sorting_bay), name="sorting_bay"),
        ]
        admin_urls = super().get_urls()
        return  custom_urls + admin_urls 

# Create an instance of CustomAdminSite
site = CustomAdminSite(name="admin")

# Custom admin models
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'quantity', 'unit', 'price', 'available')
    list_filter = ('available',)
    fields = ('name', 'description', 'image', 'quantity', 'unit', 'price', 'available')
    actions = ['make_available', 'make_unavailable']

    def make_available(self, request, queryset):
        queryset.update(available=True)
        self.message_user(request, "Selected products are now available.")

    def make_unavailable(self, request, queryset):
        queryset.update(available=False)
        self.message_user(request, "Selected products are now unavailable.")

    make_available.short_description = "Mark as available"
    make_unavailable.short_description = "Mark as unavailable"

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ('product', 'quantity')
    extra = 0

def refresh_payment_status(modeladmin, request, queryset):
    merchant_id = "M22PLAPR1OA42"
    salt_key = "d652d8ec-15b5-4fec-89de-0c8d43183fad"
    salt_index = 1 # insert your salt index
    env = Env.PROD
    should_publish_events = True
    phonepe_client = PhonePePaymentClient(merchant_id, salt_key, salt_index, env, should_publish_events)
    for order in queryset:
        if not order.is_paid:  # Only check unpaid orders
            merchant_transaction_id = f"order_{order.order_id}"
            response = phonepe_client.check_status(merchant_transaction_id)
            if response.data.state == 'SUCCESS':
                order.is_paid = True
                order.transaction_id = response.json().get('transaction_id')
                order.save()
            elif response.data.state == 'FAILED':
                # Delete order items and the order itself
                order_items = OrderItem.objects.filter(order=order)
                order_items.delete()
                order.delete()

class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'name', 'is_paid', 'address', 'area', 'order_items_summary', 'price')
    list_filter = ('area', 'is_paid')
    search_fields = ('name', 'address')
    ordering = ['-created_at']
    inlines = [OrderItemInline]
    actions = [refresh_payment_status]

    def order_items_summary(self, obj):
        items = obj.items.all()
        return ", ".join(f"{item.product.name} ({item.quantity} {item.product.unit})" for item in items)
    
    order_items_summary.short_description = 'Order Items'

# Register models with the custom admin site
site.register(Product, ProductAdmin)
site.register(GateClosed)
site.register(ShopClosed)
site.register(Order, OrderAdmin)
site.register(OrderItem)
