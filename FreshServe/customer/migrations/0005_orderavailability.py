# Generated by Django 5.1.2 on 2024-11-05 19:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0004_order_order_date'),
    ]

    operations = [
        migrations.CreateModel(
            name='OrderAvailability',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(unique=True)),
            ],
        ),
    ]
