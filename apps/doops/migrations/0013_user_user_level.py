# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2018-08-30 18:47
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('doops', '0012_auto_20180829_2109'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='user_level',
            field=models.IntegerField(default=1),
        ),
    ]