from django.shortcuts import render
from customer.models import Order
from django.utils import timezone
from datetime import datetime

def order_list(request):
    selected_date = request.GET.get('order_date')  # Get the selected date from GET parameters
    orders = Order.objects.all().order_by('-created_at')  # Retrieve all orders

    # Filter orders by selected date if provided
    if selected_date:
        selected_date = datetime.strptime(selected_date, '%Y-%m-%d').date()  # Convert to date object
        print(selected_date, timezone.now().date())
    else:
        selected_date = timezone.now().date()  # No date selected

    orders = orders.filter(created_at__date=selected_date)  # Filter by date

    total = sum(order.price for order in orders)  # Calculate total price of orders

    return render(request, 'kitchen/order_list.html', {
        'orders': orders,
        'sum': total,
        'selected_date': selected_date,  # Pass the selected date to the template
    })

def order_detail(request, order_id):
    order = Order.objects.get(order_id=order_id)
    return render(request, 'kitchen/order_detail.html', {'order': order})



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
    orders = Order.objects.filter(order_date=order_date)

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
    
    context = {
        'orders': orders,
    }
    return render(request, 'kitchen/packaging_bay_view.html', context)