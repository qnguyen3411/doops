from random import randint
import base64
import os
from PIL import Image
from django.shortcuts import render, HttpResponse, redirect
from django.conf import settings
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from django.db.models import Count
from django.urls import reverse
from django.http import JsonResponse
import json
import bcrypt
from .models import *

# Create your views here.
def index(request):
    if 'id' in  request.session:
        return redirect('/dashboard')
    return render(request, "doops/index.html")


def dashboard_page(request):

    if 'mode' not in request.GET:
        mode = 'all'
    else:
        mode = request.GET['mode']
    if 'sort' not in request.GET:
        sort = 'new'
    else:
        sort = request.GET['sort']

    if 'id' in request.session:
        print(request.GET)
        canvas_list = CanvasNode.objects.get_canvas_list(mode=mode, sort=sort)
        data = {
            'canvases' : canvas_list,
            'self' : User.objects.get(id=request.session['id']),
            'request': request
        }
        return render(request, "doops/dashboard.html", data)
    return redirect('/')

def canvas_draw(request, id=0):
    data = {
        'isRoot' : True,
        'prev_url': request.META.get('HTTP_REFERER')}
    if id:
        canvas_list = CanvasNode.objects.filter(id=int(id))
        if canvas_list: 
            data['isRoot'] = False
            data['parent'] = canvas_list[0]
        else:
            data['isRoot'] = True;
    if 'id' in request.session:
        data['self'] = User.objects.get(id=request.session['id'])
    return render(request, "doops/draw.html", data)

def user_page(request, id, mode='post'):
    if 'mode' not in request.GET:
        mode = 'post'
    else:
        mode = request.GET['mode']
    if 'sort' not in request.GET:
        sort = 'new'
    else:
        sort = request.GET['sort']
    users = User.objects.filter(id = int(id))
    if users : 
        canvas_list = CanvasNode.objects.get_canvas_list(mode=mode, sort=sort, user_id=int(id))
        data = {
            'user' : users[0],
            'canvases' : canvas_list,
            'request': request
        }
        if 'id' in request.session:
            data['self'] = User.objects.get(id=request.session['id'])
        return render(request,'doops/user.html', data)

    return redirect ('/')

def canvas_show(request, id):
    if 'mode' not in request.GET:
        mode = 'self'
    else:
        mode = request.GET['mode']
    if 'sort' not in request.GET:
        sort = 'new'
    else:
        sort = request.GET['sort']

    nodes = CanvasNode.objects.filter(id = int(id))
    if nodes:
        canvas_list = CanvasNode.objects.get_canvas_list(mode=mode, sort=sort, node_id=int(id))
        data = {
            'node' : nodes[0],
            'canvases' : canvas_list,
            'request': request
        }
        if 'id' in request.session:
            data['self'] = User.objects.get(id=request.session['id'])
        return render(request, 'doops/canvas.html', data)
    return redirect('/')


def settings_page(request):
    if 'id' in request.session:
        this_user = User.objects.get(id=request.session['id'])
    data = {'self': this_user}
    return render(request, "doops/settings.html", data)


def register_process(request):
    if request.method == 'POST':
        result = User.objects.register(request.POST)
        if 'errors' in result:
            for error in result['errors']:
                messages.error(request, error['message'], extra_tags=error['tag'])
        else:
            this_user = result['user']
            request.session['id'] = this_user.id
    return redirect('/')


def login_process(request):
    if request.method == 'POST':
        result = User.objects.login(request.POST)
        if 'errors' in result:
            messages.error(request, "Username/Password invalid", extra_tags='login')
        else:
            this_user = result['user']
            request.session['id'] = this_user.id
    return redirect('/')

def logout_process(request):
    request.session.clear()
    return redirect('/')

def update_info(request):
    if request.method == 'POST' and 'id' in request.session:
        check_unique = True
        postData = User.objects.clean_input(request.POST)
        this_user = User.objects.get(id = request.session['id'])
        if postData['username'] == this_user.username:
            check_unique = False

        errors = User.objects.validate_name(postData, min_length=2, check_unique=check_unique) 
        if len(errors):
            for error in errors:
                messages.error(request, error['message'], extra_tags=error['tag'])
        else:
            this_user.username = postData['username']
            this_user.save()
            return redirect(reverse('doops:user-settings'))
    return redirect('/')

def update_pw(request):
    if request.method == 'POST' and 'id' in request.session:
        this_user = User.objects.get(id = request.session['id'])
        if bcrypt.checkpw(request.POST['password'].encode(), this_user.password_hash.encode()):
            errors = (User.objects.password(request.POST))
            if len(errors):
                for error in errors:
                    messages.error(request,error['message'], extra_tags=error['tag'])
            else:
                pw_hash = bcrypt.hashpw(postData['password'].encode(), bcrypt.gensalt())
                this_user.password_hash = pw_hash
                this_user.save()
            return redirect(reverse('doops:user-settings'))
    return redirect('/')

def update_process(request):
    if request.method == 'POST' and 'id' in request.session:
        this_user = User.objects.get(id = request.session['id'])
    result = this_user.update(request.POST)
    if 'errors' in result:
        messages.error(request, "Username/Password invalid", extra_tags='login')
    return redirect(reverse('doops:user-settings'))
    
def submit_canvas(request, node_id):
    if request.method == 'POST' and 'id' in request.session:
        parent = None

        parent_list = CanvasNode.objects.filter(id=node_id)
        if parent_list:
            parent = parent_list[0]
        
        # String object of a base64 encoding of a PNG
        arr = request.POST['data_url']
        new_canvas = CanvasNode.objects.create(
            poster = User.objects.get(id=request.session['id']),
            parent = parent
        )

        with open('{0}canvas{1}.png'.format(settings.MEDIA_ROOT, new_canvas.id), 'wb+') as f:
            f.write(base64.b64decode(arr.split(',')[1]))
            new_canvas.image = 'canvas{0}.png'.format(new_canvas.id)
            new_canvas.save()
            
            return redirect(reverse('doops:canvas-by-id', args=[new_canvas.id]))
        
    return redirect('/')

def random_process(request):
    canvas_list = CanvasNode.objects.all()
    rand_index = randint(0,len(canvas_list) - 1)
    return redirect(reverse('doops:canvas-by-id', args=[canvas_list[rand_index].id]))


def watch_process(request, node_id):
    if 'id' in request.session:
        canvas_list = CanvasNode.objects.filter(id=int(node_id))
        if canvas_list:
            canvas = canvas_list[0]
            this_user = User.objects.get(id=request.session['id'])
            canvas.watched_users.add(this_user)

            change_list = []
            walker = canvas
            while  walker != None:
                change_list.append({'id': walker.id, 'total_watch_num': walker.total_watches()})
                walker = walker.parent
            response = {
                'target_watch': canvas.watched_users.all().count(),
                'change_list': change_list,
                'user_watch': this_user.watched_canvases.all().count()
            }
            return JsonResponse(response)
    return redirect('/')

def get_relatives(request, node_id):
    canvas_list = CanvasNode.objects.get_canvas_list(
        mode=request.GET['mode'], 
        node_id=int(node_id), 
        sort=request.GET['sort'])
    
    return render(request, 'doops/relatives_list.html', {'relatives_list': canvas_list})
    return redirect('/')

def delete_canvas(request, node_id):
    if 'id' in request.session:
        canvas_list = CanvasNode.objects.filter(id=int(node_id))
        if canvas_list and canvas_list[0].poster.id == request.session['id']:
            children_list = canvas_list[0].children.all()
            for child in children_list:
                child.parent = canvas_list[0].parent
                child.save()
            canvas_list[0].delete()
    return redirect('/')

def get_notifications(request):
    if 'id' in request.session:
        noti_list = Notification.objects.filter(notified_user__id = request.session['id']).order_by('-id')
        return JsonResponse({'noti_list': list(noti_list.values())})
    return redirect('/')

@csrf_exempt
def clear_notification(request):
    user_id = int(request.POST['user_id'])
    noti_id = int(request.POST['noti_id'])
    if user_id == request.session['id']:
        noti_list = Notification.objects.filter(id=noti_id)
        if noti_list and noti_list[0].notified_user.id == user_id:
            noti_list[0].delete()
    return HttpResponse("")

