from django.contrib import admin 
from django.urls import path
from .models import Product, GateClosed, ShopClosed, Order, OrderItem, OrderAvailability
from django.utils.html import format_html
from .views import shop_management, order_list, packaging_bay_view, kitchen_view
from django.contrib.admin import AdminSite

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

class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'name', 'address', 'area', 'order_items_summary', 'price')
    list_filter = ('area', 'is_paid')
    search_fields = ('name', 'address')
    ordering = ['-created_at']
    inlines = [OrderItemInline]

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
site.register(OrderAvailability)
