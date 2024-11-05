from django.contrib import admin 
from .models import Product, GateClosed, ShopClosed, Order, OrderItem
from django.utils.html import format_html

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'quantity', 'unit', 'price', 'available')  # Updated list_display
    list_filter = ('available',)  # Filter by availability
    fields = ('name', 'description', 'image', 'quantity', 'unit', 'price', 'available')  # Include fields in the form
    actions = ['make_available', 'make_unavailable']  # Add custom actions

    def make_available(self, request, queryset):
        """Make selected products available."""
        queryset.update(available=True)
        self.message_user(request, "Selected products are now available.")

    def make_unavailable(self, request, queryset):
        """Make selected products unavailable."""
        queryset.update(available=False)
        self.message_user(request, "Selected products are now unavailable.")

    make_available.short_description = "Mark as available"
    make_unavailable.short_description = "Mark as unavailable"

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ('product', 'quantity')
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'name', 'address', 'area', 'order_items_summary', 'price')  # Customize columns
    list_filter = ('area',)
    search_fields = ('name', 'address')
    ordering = ['-created_at']  # Orders by created date, latest on top

    inlines = [OrderItemInline]

    def order_items_summary(self, obj):
        """Generate a summary of order items with quantities and units."""
        items = obj.items.all()
        return ", ".join(f"{item.product.name} ({item.quantity} {item.product.unit})" for item in items)
    
    order_items_summary.short_description = 'Order Items'  # Column header for the admin

admin.site.register(Product, ProductAdmin)
admin.site.register(GateClosed)
admin.site.register(ShopClosed)
admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem)
