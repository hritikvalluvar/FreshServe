# Standard library imports
from decimal import Decimal, ROUND_DOWN
import json

# Third-party imports
import razorpay
from django.conf import settings
from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import render
from django.views import View
from django.contrib.auth.decorators import login_required

# Local application imports
from .models import Product, GateClosed, ShopClosed, Order, OrderItem, OrderAvailability



class Index(View):
    def get(self, request, *args, **kwargs):
        gate = GateClosed.objects.first()  
        shop = ShopClosed.objects.first()  
        order_date = OrderAvailability.objects.last().date if OrderAvailability.objects.last() else None

        context = {
            'gate': gate,
            'shop': shop,
            'order_date': order_date
        }

        return render(request, 'customer/index.html', context)

    
class About(View):
    def get(self, request, *args, **kwargs):
        
        return render(request, 'customer/about.html')
    

class Orders(View):
    def get(self, request, *args, **kwargs):
        shop = ShopClosed.objects.first()  
        if shop and not shop.is_shop_open:
            return render(request, 'customer/page_closed.html') 
        
        # Fetch available products
        products = Product.objects.filter(available=True)
        
        return render(request, 'customer/order.html', {
            'products': products,
        })

    def post(self, request, *args, **kwargs):
        products = Product.objects.filter(available=True)
        quantities = {
            product.id: Decimal(request.POST.get(f'quantity-{product.id}', 0)).quantize(Decimal('0.01'), rounding=ROUND_DOWN)
            for product in products
        }

        selected_products_with_quantities = []
        grand_total = Decimal(0)
        # print(quantities)
        for product in products:
            quantity = quantities[product.id]
            if quantity > 0:
                item_total = (product.price * quantity / product.quantity).quantize(Decimal('0.01'), rounding=ROUND_DOWN)
                grand_total += item_total
                selected_products_with_quantities.append({
                    'product_id': product.id,  # Store the product ID
                    'product_name': product.name,  # Store the product name
                    'quantity': quantity,
                    'unit' : product.unit,
                    'price': product.price,
                    'item_total': item_total
                })

        grand_total = grand_total.quantize(Decimal('0.01'), rounding=ROUND_DOWN)
        if grand_total < 100:
            return render(request, 'customer/order.html', {
                'products': products,
            })
        
        delivery_fee = Decimal('10.00')

        grand_total += delivery_fee
        
        # Calculate convenience fee as 2% of grand total
        convenience_fee = grand_total / 49

        grand_total += convenience_fee

        return render(request, 'customer/confirm_order.html', {
            'selected_products_with_quantities': selected_products_with_quantities,
            'delivery_fee': delivery_fee,
            'convenience_fee': convenience_fee,
            'grand_total': grand_total
        })
    

class ConfirmOrder(View):
    def post(self, request, *args, **kwargs):
        try:
            # print("POST data:", request.POST)

            name = request.POST.get('name')
            address = request.POST.get('address')
            area = request.POST.get('area')
            phone_number = request.POST.get('customer_phone')

            # Create the order and order items
            order = Order.objects.create(
                name=name,
                address=address,
                area=area,
                phone_number=phone_number
            )

            quantities = {}
            products = Product.objects.filter(available=True)
            for product in products:
                quantities[product.id] = Decimal(request.POST.get(f'quantity_{product.id}', 0))
                if quantities[product.id] > 0:
                    OrderItem.objects.create(
                    order=order,
                    product_id=product.id,
                    quantity=quantities[product.id],
                )
                    

            # Setup Razorpay client
            client = razorpay.Client(auth=(settings.RAZORPAY_API_KEY, settings.RAZORPAY_API_SECRET))
            
            # Create Razorpay order
            razorpay_order = client.order.create({
                'amount': int(order.price * 100),  # Convert to paisa
                'currency': 'INR',
                'payment_capture': '1'
            })
            
            # Save Razorpay order ID in the order
            order.razorpay_order_id = razorpay_order['id']
            order.save()

            # Render payment page with Razorpay order details
            context = {
                'order': order,
                'razorpay_order_id': razorpay_order['id'],
                'razorpay_merchant_key': settings.RAZORPAY_API_KEY,
                'amount': order.price,
                'currency': 'INR'
            }

            print(context)
            return render(request, 'customer/payment_page.html', context)

        except json.JSONDecodeError as e:
            print("JSON Decode Error:", e)
            return JsonResponse({'error': 'Invalid product data'}, status=400)
        except Exception as e:
            print("Error:", e)
            return JsonResponse({'error': 'An error occurred while processing your order'}, status=500)
class PaymentSuccess(View):
    def post(self, request, *args, **kwargs):
        # Retrieve payment details and verify signature
        try:
            order_id = request.POST.get('razorpay_order_id')
            payment_id = request.POST.get('razorpay_payment_id')
            signature = request.POST.get('razorpay_signature')

            # Fetch order and verify the payment signature
            order = Order.objects.get(razorpay_order_id=order_id)
            client = razorpay.Client(auth=(settings.RAZORPAY_API_KEY, settings.RAZORPAY_API_SECRET))

            # Signature verification
            params_dict = {
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }
            client.utility.verify_payment_signature(params_dict)

            # Save payment details
            order.is_paid = True
            order.razorpay_payment_id = payment_id
            order.razorpay_signature = signature
            order.save()

            return render(request, 'customer/order_success.html', {'order': order})

        except razorpay.errors.SignatureVerificationError as e:
            return JsonResponse({'error': 'Signature verification failed'}, status=400)
        except Exception as e:
            return JsonResponse({'error': 'An error occurred while verifying the payment'}, status=500)
        

from django.shortcuts import render, redirect
from django.contrib.admin.views.decorators import staff_member_required
from .models import ShopClosed, GateClosed, OrderAvailability
from django.utils import timezone
from datetime import datetime


def shop_management_view(request):
    # Retrieve or initialize ShopClosed and GateClosed models
    shop_status, _ = ShopClosed.objects.get_or_create(pk=1)
    gate_status, _ = GateClosed.objects.get_or_create(pk=1)
    selected_date = None  

    if request.method == 'POST':
        selected_date = request.POST.get("order_date")
        if isinstance(selected_date, str):
            selected_date = datetime.strptime(selected_date, '%Y-%m-%d').date()

        if 'open_shop' in request.POST and selected_date:
            shop_status.is_shop_open = True
            gate_status.is_collecting_orders = True
            
            OrderAvailability.objects.all().delete()  # Delete old records
            OrderAvailability.objects.create(date=selected_date)

            shop_status.save()
            gate_status.save()
        elif 'close_shop' in request.POST:
            shop_status.is_shop_open = False
            shop_status.save()
        elif 'close_gate' in request.POST:
            gate_status.is_collecting_orders = False
            gate_status.save()

        return redirect('shop_management')  # Redirect to avoid resubmission on refresh

    # Fetch the OrderAvailability date if the shop is open
    order_availability = OrderAvailability.objects.last()
    order_date = order_availability.date if order_availability else None


    # Context for rendering the template
    context = {
        'shop_open': shop_status.is_shop_open,
        'gate_open': gate_status.is_collecting_orders,
        'order_date': order_date if order_date else None,
    }

    return render(request, 'admin/shop_management.html', context)