# Standard library imports
from decimal import Decimal, ROUND_DOWN
import json


from datetime import datetime
from django.shortcuts import render, redirect
from django.utils import timezone


import razorpay
from django.conf import settings
from django.http import JsonResponse
from django.views import View
from django.core.mail import send_mail
from django.contrib import messages


# Local application imports
from .models import Product, GateClosed, ShopClosed, Order, OrderItem, OrderAvailability



class ContactView(View):
    template_name = 'customer/contact.html'

    def get(self, request):
        # Render the contact form on GET request
        return render(request, self.template_name)


def menu(request):
    products = Product.objects.all().order_by('id')  # Fetch all products
    return render(request, 'customer/menu.html', {'products': products})


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
        products = Product.objects.filter(available=True).order_by('id')
        
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
        # if grand_total < 100:
            # return redirect('order')
        
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
            # Collect customer information
            name = request.POST.get('name')
            address = request.POST.get('address')
            area = request.POST.get('area')
            phone_number = request.POST.get('customer_phone')
            order_date = OrderAvailability.objects.last().date

            grand_total = Decimal(request.POST.get('grand_total', 0))
            
            # Create the order and order items
            order = Order.objects.create(
                name=name,
                address=address,
                area=area,
                phone_number=phone_number,
                order_date=order_date,
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
            # Pass the Razorpay order ID to the payment page
            context = {
                'order': order,
                'razorpay_order_id': razorpay_order['id'],
                'razorpay_merchant_key': settings.RAZORPAY_API_KEY,
                'amount': grand_total,
                'currency': 'INR'
            }

            return render(request, 'customer/payment_page.html', context)

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

            # Fetch order based on Razorpay order ID
            order = Order.objects.get(razorpay_order_id=order_id)

            client = razorpay.Client(auth=(settings.RAZORPAY_API_KEY, settings.RAZORPAY_API_SECRET))

            # Signature verification
            params_dict = {
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }
            client.utility.verify_payment_signature(params_dict)


            # Payment was successful, now save the order
            order.is_paid = True
            order.razorpay_payment_id = payment_id
            order.razorpay_signature = signature

            # Create order items now that payment is confirmed
            products = Product.objects.filter(available=True)
            for product in products:
                quantity = Decimal(request.POST.get(f'quantity_{product.id}', 0))
                if quantity > 0:
                    OrderItem.objects.create(
                        order=order,
                        product_id=product.id,
                        quantity=quantity,
                    )

            order.save()

            # Render the order success page with the confirmed order
            return render(request, 'customer/order_success.html', {'order': order})

        except razorpay.errors.SignatureVerificationError as e:
            return JsonResponse({'error': 'Signature verification failed'}, status=400)
        except Exception as e:
            return JsonResponse({'error': 'An error occurred while verifying the payment'}, status=500)

        




def shop_management(request):
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

        return redirect('admin:shop_management')  # Redirect to avoid resubmission on refresh

    # Fetch the OrderAvailability date if the shop is open
    order_availability = OrderAvailability.objects.last()
    order_date = order_availability.date if order_availability else None


    # Context for rendering the template
    context = {
        'shop_open': shop_status.is_shop_open,
        'gate_open': gate_status.is_collecting_orders,
        'order_date': order_date if order_date else None,
    }

    return render(request, 'kitchen/shop_management.html', context)



def order_list(request):
    selected_date = request.GET.get('order_date')  # Get the selected date from GET parameters
    orders = Order.objects.all().order_by('-created_at')  # Retrieve all orders

    # Filter orders by selected date if provided
    if selected_date:
        selected_date = datetime.strptime(selected_date, '%Y-%m-%d').date()  # Convert to date object
    else:
        selected_date = timezone.now().date()  # No date selected

    orders = orders.filter(order_date=selected_date, is_paid=True)  # Filter by order_date

    total = sum(order.price for order in orders)  # Calculate total price of orders

    return render(request, 'kitchen/order_list.html', {
        'orders': orders,
        'sum': total,
        'selected_date': selected_date,  # Pass the selected date to the template
    })




def kitchen_view(request):
    # Get today's date
    today = timezone.now().date()
    
    # Get the order date from the request, default to today
    order_date_str = request.GET.get('order_date', today)
    
    # Check if order_date_str is a string, then convert it to date
    if isinstance(order_date_str, str):
        order_date = timezone.datetime.strptime(order_date_str, '%Y-%m-%d').date()
    else:
        order_date = order_date_str

    # Initialize variables
    category_totals = {
        'Steamed Idli': {'quantity': 0, 'batter': 0, 'unit': 'pieces'},
        'Ragi Idli': {'quantity': 0, 'batter': 0, 'unit': 'pieces'},
        'Idli/Dosa Batter': {'quantity': 0, 'batter': 0, 'unit': 'kg'},
        'Ragi Batter': {'quantity': 0, 'batter': 0, 'unit': 'kg'},
        'Sambhar': {'quantity': 0, 'unit': 'ml'},
        'Onion Chutney': {'quantity': 0, 'unit': 'gm'},
        'Peanut Chutney': {'quantity': 0, 'unit': 'gm'},
        'Sambar Powder': {'quantity': 0, 'unit': 'gm'},
    }

    # Process each order based on the selected order_date
    orders = Order.objects.filter(order_date=order_date, is_paid=True)

    for order in orders:
        for item in order.items.all():
            product_name = item.product.name
            quantity = item.quantity
            
            # Update quantities and calculate batter for idli items
            if product_name == 'Steamed Idli':
                category_totals['Steamed Idli']['quantity'] += quantity
                category_totals['Steamed Idli']['batter'] += (quantity / 10) * 0.5
            elif product_name == 'Ragi Idli':
                category_totals['Ragi Idli']['quantity'] += quantity
                category_totals['Ragi Idli']['batter'] += (quantity / 10) * 0.5
            elif product_name == 'Idli/Dosa Batter':
                category_totals['Idli/Dosa Batter']['quantity'] += quantity
                category_totals['Idli/Dosa Batter']['batter'] += quantity
            elif product_name == 'Ragi Batter':
                category_totals['Ragi Batter']['quantity'] += quantity
                category_totals['Ragi Batter']['batter'] += quantity
            elif product_name in category_totals:
                category_totals[product_name]['quantity'] += quantity

    # Calculate total batter required for each type
    total_idli_batter = category_totals['Steamed Idli']['batter'] + category_totals['Idli/Dosa Batter']['batter']
    total_ragi_batter = category_totals['Ragi Idli']['batter'] + category_totals['Ragi Batter']['batter']

    # Calculate rice needed for each batter type
    rice_needed_for_idli_batter = round(total_idli_batter / 2.8, 2) if total_idli_batter > 0 else '-'
    rice_needed_for_ragi_batter = round(total_ragi_batter / 2.8, 2) if total_ragi_batter > 0 else '-'

    # Replace any zero quantities and batter values with '-'
    for category, data in category_totals.items():
        if data['quantity'] == 0:
            data['quantity'] = '-'
        if 'batter' in data and data['batter'] == 0:
            data['batter'] = '-'

    context = {
        'category_totals': category_totals,
        'total_idli_batter': total_idli_batter if total_idli_batter > 0 else '-',
        'total_ragi_batter': total_ragi_batter if total_ragi_batter > 0 else '-',
        'rice_needed_for_idli_batter': rice_needed_for_idli_batter,
        'rice_needed_for_ragi_batter': rice_needed_for_ragi_batter,
        'selected_date': order_date,  # Add the selected date to context
    }
    return render(request, 'kitchen/kitchen_view.html', context)



def packaging_bay_view(request):
    # Retrieve all orders
    orders = Order.objects.all().order_by('-created_at')
    orders = orders.filter(is_paid=True)
    
    context = {
        'orders': orders,
    }
    return render(request, 'kitchen/packaging_bay_view.html', context)


def terms(request):
    return render(request, 'policies/terms_and_conditions.html')

def privacy(request):
    return render(request, 'policies/privacy_policy.html')

def refund(request):
    return render(request, 'policies/refund_policy.html')

def shipping(request):
    return render(request, 'policies/shipping_policy.html')