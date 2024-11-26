# Generated by Django 5.1.2 on 2024-11-04 13:47

import django.core.validators
import django.db.models.deletion
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GateClosed',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_collecting_orders', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Order',
            fields=[
                ('order_id', models.CharField(editable=False, max_length=4, primary_key=True, serialize=False, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('address', models.CharField(max_length=20)),
                ('area', models.CharField(choices=[('NT', 'New Township'), ('OT', 'Old Township'), ('KK', 'Khora Kheri')], max_length=2)),
                ('order_price', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=10)),
                ('phone_number', models.CharField(help_text='Enter a 10-digit phone number.', max_length=10, validators=[django.core.validators.RegexValidator(message='Enter a 10-digit phone number.', regex='^\\d{10}$')])),
                ('is_paid', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('image', models.ImageField(upload_to='menu_images/')),
                ('price', models.DecimalField(decimal_places=2, max_digits=7)),
                ('quantity', models.IntegerField(default=0)),
                ('unit', models.CharField(default='pcs', max_length=20)),
                ('available', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='ShopClosed',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_shop_open', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='OrderItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.IntegerField()),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='customer.order')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='customer.product')),
            ],
        ),
    ]