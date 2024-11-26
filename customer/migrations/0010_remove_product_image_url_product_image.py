# Generated by Django 5.1.2 on 2024-11-26 19:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0009_remove_product_image_product_image_url'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='image_url',
        ),
        migrations.AddField(
            model_name='product',
            name='image',
            field=models.ImageField(default=None, upload_to='menu_images/'),
        ),
    ]