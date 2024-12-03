from django.db import models
from decimal import Decimal
import random, string
from django.core.validators import RegexValidator


class OrderAvailability(models.Model):
    date = models.DateField(unique=True)

    def __str__(self):
        return f"Orders available for {self.date.strftime('%Y-%m-%d')}"
        
class GateClosed(models.Model):
    is_collecting_orders = models.BooleanField(default=True)  

    def __str__(self):
        return f"Collecting Orders: {self.is_collecting_orders}"
    
    def save(self, *args, **kwargs):
        # Check if is_collecting_orders is set to False, then clear OrderAvailability
        if not self.is_collecting_orders:
            OrderAvailability.objects.all().delete()
        super().save(*args, **kwargs)


class ShopClosed(models.Model):
    is_shop_open = models.BooleanField(default=True)

    def __str__(self):
        return f"Is shop open: {self.is_shop_open}"
    
    def save(self, *args, **kwargs):
        # Check if is_shop_open is set to False, then clear OrderAvailability
        if not self.is_shop_open:
            OrderAvailability.objects.all().delete()
            gate, _ = GateClosed.objects.get_or_create(id=1)
            gate.is_collecting_orders = False
            gate.save()
        super().save(*args, **kwargs)
    
    
class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    image_url = models.CharField(max_length=255, null=True, blank=True)
    price = models.DecimalField(max_digits=7, decimal_places=2)
    quantity = models.IntegerField(default=0)
    unit = models.CharField(max_length=20, default="pcs")
    available = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    
class Order(models.Model):
    ORDER_AREAS = [
        ('NT', 'New Township'),
        ('OT', 'Old Township'),
        ('KK', 'Khora Kheri'),
    ]

    order_id = models.CharField(max_length=4, unique=True, editable=False, primary_key=True) 
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=20)
    area = models.CharField(max_length=2, choices=ORDER_AREAS)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(
        max_length=10,
        validators=[
            RegexValidator(
                regex=r'^\d{10}$',
                message="Enter a 10-digit phone number."
            )
        ],
        help_text="Enter a 10-digit phone number.",
    )
    is_paid = models.BooleanField(default=False)

    order_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)  

    def __str__(self):
        return f"Order {self.order_id} by {self.name}"

    def save(self, *args, **kwargs):
        latest_availability = OrderAvailability.objects.last()
        if latest_availability:
            self.order_date = latest_availability.date
            
        # Generate a unique 4-digit alphanumeric order ID if it doesn't already exist
        if not self.order_id:
            self.order_id = self.generate_order_id()
        
        # Save the order initially to ensure it has a primary key
        super().save(*args, **kwargs)
        
        # Now that the Order instance has a primary key, we can calculate the total price
        self.price = self.calculate_total_price()
        
        # Save again to update the order price
        super().save(update_fields=['price'])

    def generate_order_id(self):
        """Generate a unique 4-digit alphanumeric order ID."""
        order_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        # Check if the generated order_id already exists
        while Order.objects.filter(order_id=order_id).exists():
            order_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        return order_id
    
    def calculate_total_price(self):
        total = Decimal('0.00')
        for item in self.items.all():
            total += (item.quantity * item.product.price) / item.product.quantity

        return round(total, 2)
    
    def get_area_display(self):
        """Return the human-readable name for the area."""
        return dict(self.ORDER_AREAS).get(self.area, self.area)
    
    def order_items_summary(self):
        """Generate a summary of order items with quantities and units."""
        items = self.items.all()  # Fetch all related order items
        return ", ".join(f"{item.product.name} ({item.quantity} {item.product.unit})" for item in items)



class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE, to_field='order_id')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=5, decimal_places=1)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.order.price = self.order.calculate_total_price()
        self.order.save()

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"