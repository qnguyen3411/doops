# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2018-08-21 19:02
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('doops', '0004_canvasnode'),
    ]

    operations = [
        migrations.RenameField(
            model_name='canvasnode',
            old_name='watching_user',
            new_name='watched_user',
        ),
    ]
