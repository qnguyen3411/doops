# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2018-08-29 19:12
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('doops', '0010_auto_20180826_2153'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='email',
        ),
    ]