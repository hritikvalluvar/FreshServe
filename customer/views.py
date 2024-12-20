# Standard library imports
from decimal import Decimal, ROUND_DOWN
from datetime import datetime

# Django imports
from django.utils.timezone import now, timezone
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views import View

# Local application imports
from .models import (
    Product,
    GateClosed,
    ShopClosed,
    Order,
    OrderItem,
    OrderAvailability,
)

# PhonePe SDK imports
from phonepe.sdk.pg.payments.v1.models.request.pg_pay_request import PgPayRequest
from phonepe.sdk.pg.payments.v1.payment_client import PhonePePaymentClient
from phonepe.sdk.pg.env import Env


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

        return render(request, 'customer/confirm_order.html', {
            'selected_products_with_quantities': selected_products_with_quantities,
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

            # Add items to the order
            products = Product.objects.filter(available=True)
            for product in products:
                quantity = Decimal(request.POST.get(f'quantity_{product.id}', 0))
                if quantity > 0:
                    OrderItem.objects.create(order=order, product=product, quantity=quantity)

            # Setup PhonePe payment integration
            merchant_id = settings.PHONEPE_MERCHANT_ID
            salt_key = settings.PHONEPE_SECRET_KEY
            salt_index = settings.PHONEPE_SALT_INDEX
            env = Env.PROD

            phonepe_client = PhonePePaymentClient(
                merchant_id=merchant_id, salt_key=salt_key, salt_index=salt_index, env=env
            )

            unique_transaction_id = f"order_{order.order_id}"
            ui_redirect_url = request.build_absolute_uri(f'/order/success/{order.order_id}/')
            s2s_callback_url = request.build_absolute_uri('/payment/callback/')
            amount_in_paise = int(grand_total * 100)

            pay_page_request = PgPayRequest.pay_page_pay_request_builder(
                merchant_transaction_id=unique_transaction_id,
                amount=amount_in_paise,
                merchant_user_id=merchant_id,
                callback_url=s2s_callback_url,
                redirect_url=ui_redirect_url,
            )
            pay_page_response = phonepe_client.pay(pay_page_request)

            # Redirect URL for payment
            pay_page_url = pay_page_response.data.instrument_response.redirect_info.url
            return redirect(pay_page_url)

        except Exception as e:
            print("Error during payment initiation:", e)
            return JsonResponse({'error': 'An error occurred while processing your order.'}, status=500)


class PaymentSuccess(View):
    def get(self, request, order_id, *args, **kwargs):
        try:
            # Setup PhonePe client
            merchant_id = settings.PHONEPE_MERCHANT_ID
            salt_key = settings.PHONEPE_SECRET_KEY
            salt_index = settings.PHONEPE_SALT_INDEX
            env = Env.PROD

            phonepe_client = PhonePePaymentClient(
                merchant_id=merchant_id, salt_key=salt_key, salt_index=salt_index, env=env
            )

            # Check payment status
            merchant_transaction_id = f"order_{order_id}"
            response = phonepe_client.check_status(merchant_transaction_id)
            print(order_id)
            print(response)
            # Validate response and update order
            if response.success is True:
                order = Order.objects.get(order_id=order_id)
                order.is_paid = True
                order.transaction_id = response.data.transaction_id
                order.save()
                return render(request, 'customer/order_success.html', {'order': order})
            else:
                return JsonResponse({'error': 'Payment failed or invalid status'}, status=400)

        except Order.DoesNotExist:
            return JsonResponse({'error': 'Order not found'}, status=404)
        except Exception as e:
            print("Error during payment success handling:", e)
            return JsonResponse({'error': 'An error occurred while verifying the payment.'}, status=500)


def check_payment_status(selected_date):
    orders = Order.objects.filter(order_date=selected_date, is_paid=False)

    if not orders.exists():
        return

    merchant_id = settings.PHONEPE_MERCHANT_ID
    salt_key = settings.PHONEPE_SECRET_KEY
    salt_index = settings.PHONEPE_SALT_INDEX
    env = Env.PROD

    phonepe_client = PhonePePaymentClient(
        merchant_id=merchant_id, salt_key=salt_key, salt_index=salt_index, env=env
    )

    for order in orders:
        merchant_transaction_id = f"order_{order.order_id}"
        response = phonepe_client.check_status(merchant_transaction_id)

        if not response.success:
            order_items = OrderItem.objects.filter(order=order)
            order_items.delete()
            order.delete()

        elif response.data.state == 'COMPLETED':
            order.is_paid = True
            order.transaction_id = response.data.transaction_id
            order.save()
        
        elif response.data.state == 'FAILED':
            order_items = OrderItem.objects.filter(order=order)
            order_items.delete()
            order.delete()

    return


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
            gate_status.is_collecting_orders = False
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
    
    # Parse selected_date if provided, else use today's date
    if selected_date:
        selected_date = datetime.strptime(selected_date, '%Y-%m-%d').date()
    else:
        selected_date = now().date()

    check_payment_status(selected_date)

    # Retrieve and filter orders in a single step
    orders = Order.objects.filter(
        order_date=selected_date, 
        is_paid=True
    ).order_by('-created_at')

    total = sum(order.price for order in orders)  # Calculate total price of orders

    return render(request, 'kitchen/order_list.html', {
        'orders': orders,
        'sum': total,
        'selected_date': selected_date,  # Pass the selected date to the template
    })


def kitchen_view(request):
    selected_date = request.GET.get('order_date')  # Get the selected date from GET parameters
    
    # Parse selected_date if provided, else use today's date
    if selected_date:
        selected_date = datetime.strptime(selected_date, '%Y-%m-%d').date()
    else:
        selected_date = now().date()

    check_payment_status(selected_date)

    # Initialize variables
    category_totals = {
        'Steamed Idli': {'quantity': 0, 'batter': 0, 'unit': 'pieces'},
        'Ragi Idli': {'quantity': 0, 'batter': 0, 'unit': 'pieces'},
        'Idli/Dosa Batter': {'quantity': 0, 'batter': 0, 'unit': 'kg'},
        'Ragi Batter': {'quantity': 0, 'batter': 0, 'unit': 'kg'},
        'Sambar': {'quantity': 0, 'unit': 'pack'},
        'Onion Chutney': {'quantity': 0, 'unit': 'pack'},
        'Peanut Chutney': {'quantity': 0, 'unit': 'pack'},
        'Sambar Powder': {'quantity': 0, 'unit': 'gm'},
    }

    # Process each order based on the selected order_date
    orders = Order.objects.filter(order_date=selected_date, is_paid=True)

    for order in orders:
        for item in order.items.all():
            product_name = item.product.name
            quantity = item.quantity
            
            # Update quantities and calculate batter for idli items
            if product_name == 'Steamed Idli':
                category_totals['Steamed Idli']['quantity'] += quantity
                category_totals['Steamed Idli']['batter'] += (quantity / Decimal(20)) 
            elif product_name == 'Ragi Idli':
                category_totals['Ragi Idli']['quantity'] += quantity
                category_totals['Ragi Idli']['batter'] += (quantity / Decimal(20))
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

    # Calculate rice needed for each batter type round(total_idli_batter / Decimal('2.8'), 2)
    rice_needed_for_idli_batter = round(total_idli_batter / Decimal('2.8'), 2) if total_idli_batter > 0 else '-'
    rice_needed_for_ragi_batter = round(total_ragi_batter / Decimal('2.8'), 2) if total_ragi_batter > 0 else '-'

    # Replace any zero quantities and batter values with '-'
    for _, data in category_totals.items():
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
        'selected_date': selected_date,  # Add the selected date to context
    }
    return render(request, 'kitchen/kitchen_view.html', context)


def packaging_bay_view(request):
    selected_date = request.GET.get('order_date')  # Get the selected date from GET parameters
    
    # Parse selected_date if provided, else use today's date
    if selected_date:
        selected_date = datetime.strptime(selected_date, '%Y-%m-%d').date()
    else:
        selected_date = now().date()

    check_payment_status(selected_date)

    # Retrieve and filter orders in a single step
    orders = Order.objects.filter(
        order_date=selected_date, 
        is_paid=True
    )
    
    context = {
        'orders': orders,
        'selected_date': selected_date,
    }
    return render(request, 'kitchen/packaging_bay_view.html', context)


def sorting_bay(request):
    # Get the selected date from GET parameters
    selected_date = request.GET.get('order_date')

    # Parse selected_date if provided, else use today's date
    if selected_date:
        selected_date = datetime.strptime(selected_date, '%Y-%m-%d').date()
    else:
        selected_date = now().date()

    check_payment_status(selected_date)

    # Retrieve and filter orders in a single step
    orders = Order.objects.filter(
        order_date=selected_date, 
        is_paid=True
    )

    # Define the desired category order
    desired_order = [
        'Steamed Idli', 'Ragi Idli', 'Idli/Dosa Batter',
        'Ragi Batter', 'Sambar', 'Onion Chutney',
        'Peanut Chutney', 'Sambar Powder'
    ]

    # Generate the category summary
    category_summary = {}
    for order in orders:
        for item in order.items.all():
            category = item.product.name
            quantity = item.quantity
            unit = item.product.unit
            subcategory = f"{quantity} × {unit}"

            if category not in category_summary:
                category_summary[category] = {}
            category_summary[category][subcategory] = category_summary[category].get(subcategory, 0) + 1

    # Sort category_summary based on the desired order
    sorted_category_summary = {
        category: category_summary[category]
        for category in desired_order if category in category_summary
    }

    context = {
        'category_summary': sorted_category_summary,
        'selected_date': selected_date,
    }
    return render(request, 'kitchen/sorting_bay.html', context)


def terms(request):
    return render(request, 'policies/terms_and_conditions.html')


def privacy(request):
    return render(request, 'policies/privacy_policy.html')


def refund(request):
    return render(request, 'policies/refund_policy.html')


def shipping(request):
    return render(request, 'policies/shipping_policy.html')