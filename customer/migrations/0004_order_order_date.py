# Generated by Django 5.1.2 on 2024-11-05 13:18

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0003_rename_order_price_order_price'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='order_date',
            field=models.DateField(default=django.utils.timezone.now),
        ),
    ]