from random import randint
import base64
import os
from PIL import Image
from django.shortcuts import render, HttpResponse, redirect
from django.conf import settings
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from django.urls import reverse
from django.http import JsonResponse
import json
import bcrypt
from .models import *


CANVAS_MODE_DEFAULT = 'self'
USER_MODE_DEFAULT = 'post'
GENERAL_MODE_DEFAULT = 'all'
SORT_DEFAULT = 'new'
# Create your views here.
def index(request):
    if 'id' in  request.session:
        logged_user = get_logged_user(request)
        if not logged_user:
            request.session.clear()
        else:
            return redirect('/dashboard')
    return render(request, "doops/index.html")


def dashboard_page(request):

    mode = request.GET.get('mode', GENERAL_MODE_DEFAULT)
    sort = request.GET.get('sort', SORT_DEFAULT)

    canvas_list = CanvasNode.objects.get_canvas_list(
        mode=mode, sort=sort
    )
    data = {
        'canvases' : canvas_list,
    }
    logged_user = get_logged_user(request)
    if logged_user:
        data['self'] = logged_user
    return render(request, "doops/dashboard.html", data)


def user_page(request, id):

    mode = request.GET.get('mode', USER_MODE_DEFAULT)
    sort = request.GET.get('sort', SORT_DEFAULT)

    users = User.objects.filter(id = int(id))
    if users : 
        canvas_list = CanvasNode.objects.get_canvas_list(
            user_id = id, mode=mode, sort=sort
            )
        data = {
            'user' : users[0],
            'canvases' : canvas_list,
            'request': request
        }
        logged_user = get_logged_user(request)
        if logged_user:
            data['self'] = logged_user
        return render(request,'doops/user.html', data)

    return redirect ('/')

def canvas_page(request, id):

    mode = request.GET.get('mode', CANVAS_MODE_DEFAULT)
    sort = request.GET.get('sort', SORT_DEFAULT)

    nodes = CanvasNode.objects.filter(id = int(id))
    if nodes:
        canvas_list = CanvasNode.objects.get_canvas_list(
            node_id = id, mode=mode, sort=sort
        )

        data = {'canvases': canvas_list}

        if request.is_ajax():
            return render(
                request, 'doops/relatives_list.html', data)
        
        
        data['node'] = nodes[0]
        logged_user = get_logged_user(request)
        if logged_user:
            data['self'] = logged_user
        return render(request, 'doops/canvas.html', data)
    return redirect('/')

def draw_page(request, id=None):
    
    data = {
        'isRoot' : True,
        'prev_url': request.META.get('HTTP_REFERER')
        }
    if id:
        canvas_list = CanvasNode.objects.filter(id=int(id))
        if canvas_list: 
            data['isRoot'] = False
            data['parent'] = canvas_list[0]
        else:
            data['isRoot'] = True;
    logged_user = get_logged_user(request)
    if logged_user:        
        data['self'] = logged_user
    return render(request, "doops/draw.html", data)

# Require logged in
def settings_page(request):
    logged_user = get_logged_user(request)
    if logged_user:
        data = {'self': logged_user}
        return render(request, "doops/settings.html", data)
    return redirect('/')

# Require logged in and admin
def admin_page(request):
    logged_user = get_logged_user(request)
    if logged_user and logged_user.is_admin():
            data = {
                'users': User.objects.all(),
                'reports': Report.objects.all(),
            }
            return render(request, 'doops/admin.html', data)
    return redirect('/')


def user_register_process(request):
    if request.method == 'POST':
        result = User.objects.register(request.POST)
        if 'errors' in result:
            for error in result['errors']:
                messages.error(request, error['message'], extra_tags=error['tag'])
        else:
            this_user = result['user']
            request.session['id'] = this_user.id
    return redirect(request.META.get('HTTP_REFERER'))


def user_login_process(request):
    if request.method == 'POST':
        result = User.objects.login(request.POST)
        if 'errors' in result:
            for error in result['errors']:
                messages.error(request, error['message'], extra_tags=error['tag'])
        else:
            this_user = result['user']
            request.session['id'] = this_user.id
    return redirect(request.META.get('HTTP_REFERER'))

def user_logout_process(request):
    request.session.clear()
    return redirect(request.META.get('HTTP_REFERER'))

# Require logged in
def user_update_process(request, id):
    updater = get_logged_user(request)
    targets = User.objects.filter(id = id)
    if request.method == 'POST' and targets:
        if updater.is_admin() or updater.id == targets[0].id:
            result = targets[0].update(request.POST)
        if 'errors' in result:
            for error in result['errors']:
                messages.error(request, error['message'], extra_tags=error['tag'])
    return redirect(reverse('doops:user-settings'))

# Require logged in
def user_delete_process(request, id):
    if 'id' in request.session:
        deleter = get_logged_user(request)
        targets = User.objects.filter(id = int(id))

        # If deleter and target is found
        if deleter and targets:
            if deleter.is_admin():
                as_admin = True
            else:
                as_admin = False
                
            result = User.objects.delete_user(
                this_user = targets[0],
                as_admin = as_admin,
                pw_validation = request.POST,
            )
            if 'errors' in result:
                for error in result['errors']:
                    messages.error(request, error['message'], extra_tags=error['tag'])

            elif not as_admin:
                request.session.clear()
            return redirect(request.META.get('HTTP_REFERER'))
    return redirect('/')



def submit_canvas(request, node_id):
    if request.method == 'POST':
        logged_user = get_logged_user(request)
        if logged_user:
            poster = logged_user
        else:
            poster = None
        parent = None

        parent_list = CanvasNode.objects.filter(id=node_id)
        if parent_list:
            parent = parent_list[0]
        
        # String object of a base64 encoding of a PNG
        arr = request.POST['data_url']
        new_canvas = CanvasNode.objects.create(
            poster = poster,
            parent = parent
        )

        filename = '{0}canvas{1}.png'.format(settings.MEDIA_ROOT, new_canvas.id)
        with open(filename, 'wb+') as f:
            f.write(base64.b64decode(arr.split(',')[1]))
            new_canvas.image = 'canvas{0}.png'.format(new_canvas.id)
            new_canvas.save()
        
        Notification.objects.send_noti_for_new_canvas(new_canvas)
        
        return redirect(
            reverse(
                'doops:view-canvas',
                args=[new_canvas.id]
            )
        )
        
    return redirect('/')

def random_process(request):
    canvas_list = CanvasNode.objects.all()
    rand_index = randint(0,len(canvas_list) - 1)
    return redirect(
        reverse(
            'doops:view-canvas',
            args=[canvas_list[rand_index].id]
        )
    )

# Require logged in
def watch_process(request, node_id):
    logged_user = get_logged_user(request)
    if logged_user:
        canvas_list = CanvasNode.objects.filter(id=int(node_id))
        if canvas_list:
            canvas = canvas_list[0]
            canvas.watched_users.add(logged_user)

            change_list = []
            walker = canvas
            while  walker != None:
                change_list.append({
                    'id': walker.id,
                    'total_watch_num': walker.total_watches()
                    })
                walker = walker.parent
            response = {
                'target_watch': canvas.watched_users.all().count(),
                'change_list': change_list,
                'user_watch': logged_user.watched_canvases.all().count()
            }
            return JsonResponse(response)
    return redirect('/')

def report_process(request, node_id=0):
    if node_id:
        duplicates = Report.objects.filter(reported_canvas__id=int(node_id))
        if not duplicates:
            canvas_list = CanvasNode.objects.filter(id = node_id)
            if canvas_list:
                Report.objects.create(reported_canvas=canvas_list[0])
                return HttpResponse("success")
    return HttpResponse("fail")

def clear_report(request, report_id):
    logged_user = get_logged_user(request)
    if logged_user and logged_user.is_admin():
        reports = Report.objects.filter(id = int(report_id))
        if reports:
            reports[0].delete()
    return redirect(request.META.get('HTTP_REFERER'))


# Require logged in
def delete_canvas(request, node_id):
    deleter = get_logged_user(request)
    if deleter:
        canvas_list = CanvasNode.objects.filter(id=int(node_id))
        if canvas_list:
            this_canvas = canvas_list[0]
            regular_user_authorized = (
                this_canvas.poster != None 
                and this.poster.id == deleter.id
                )

            if regular_user_authorized or deleter.is_admin():
                children_list = this_canvas.children.all()
                for child in children_list:
                    child.parent = this_canvas.parent
                    child.save()

                this_canvas.delete()
    return redirect('/')

def get_notifications(request):
    logged_user = get_logged_user(request)
    if not logged_user:
        return JsonResponse({'success': False, "error": 'User not logged in'})
    
    noti_list = (Notification.objects
        .filter(
        notified_user__id = logged_user.id
        )
        .order_by('-id'))
    return render(request, 'doops/notification_list.html', {'noti_list': noti_list})

def clear_notification(request, noti_id):
    logged_user = get_logged_user(request)
    if not logged_user:
        return JsonResponse({'success': False, "error": 'User not logged in'})

    noti_list = Notification.objects.filter(id=int(noti_id))
    if noti_list and noti_list[0].notified_user.id == logged_user.id:
        noti_list[0].delete()
    return JsonResponse({
        'success': True,
        'new_noti_count': (noti_list.count() - 1)
        })
    


# Utility function
def get_logged_user(request):
    """
    check if there is an ID in session, and if the user
    with that ID still exists. If true, return the user
    """
    if 'id' in request.session:
        user_list = User.objects.filter(id=request.session['id'])
        if user_list:
            return user_list[0]
    return False

    
