# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2018-08-22 00:17
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('doops', '0005_auto_20180821_1902'),
    ]

    operations = [
        migrations.RenameField(
            model_name='canvasnode',
            old_name='watched_user',
            new_name='watched_users',
        ),
    ]
