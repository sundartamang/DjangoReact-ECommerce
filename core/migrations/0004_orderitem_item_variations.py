# Generated by Django 2.2.4 on 2020-09-29 03:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_auto_20200928_1020'),
    ]

    operations = [
        migrations.AddField(
            model_name='orderitem',
            name='item_variations',
            field=models.ManyToManyField(to='core.ItemVariation'),
        ),
    ]
