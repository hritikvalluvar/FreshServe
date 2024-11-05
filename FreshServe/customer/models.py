from django.db import models
from decimal import Decimal
import random, string
from django.core.validators import RegexValidator

    
class GateClosed(models.Model):
    is_collecting_orders = models.BooleanField(default=True)  


class ShopClosed(models.Model):
    is_shop_open = models.BooleanField(default=True)  
    
    
class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='menu_images/')
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

    order_id = models.CharField(max_length=4, unique=True, editable=False, primary_key=True)  # Add order_id field
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=20)
    area = models.CharField(max_length=2, choices=ORDER_AREAS)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=100, blank=True, null=True)
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

    created_at = models.DateTimeField(auto_now_add=True)  # Field to store order date

    def __str__(self):
        return f"Order {self.order_id} by {self.name}"

    def save(self, *args, **kwargs):
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

        if total > 0:
            delivery_fee = 10
            total += delivery_fee
            convenience_fee = (total ) / 49
            total += convenience_fee

        return round(total, 2)



class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE, to_field='order_id')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.order.price = self.order.calculate_total_price()
        self.order.save()

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"