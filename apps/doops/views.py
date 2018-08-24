from random import randint
from django.shortcuts import render, HttpResponse, redirect
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from django.db.models import Count, F
from django.db.models.functions import Length
from django.http import JsonResponse
import json
import bcrypt
from .models import *

POSTER = 'P'
WATCHER = 'W'
# Create your views here.
def index(request):
    if 'id' in  request.session:
        return redirect('/dashboard')
    return render(request, "doops/index.html")

def canvas_page(request, node_id=0):
    data = {'isRoot' : True}
    if node_id:
        canv_list = CanvasNode.objects.filter(id=node_id)
        if canv_list: 
            data['isRoot'] = False
            data['parent'] = canv_list[0]
        else:
            data['isRoot'] = True;
    if 'id' in request.session:
        data['self'] = User.objects.get(id=request.session['id'])
    return render(request, "doops/canvas.html", data)

""" Performs filters based on specifications
Sort : new/popular (to implement - by branch num, by generation, by descendant num)
mode : posts by user id, watches by user id, branches of node id, descendants of node id, or all roots
id : can be user id or node id
"""
def dashboard_page(request, sort, mode, id ):
    if 'id' in request.session:
        target = None;
        if sort == "popular":
            primary_sort = "-num_watchers"
            secondary_sort = "-id"
        else:
            sort = "new"
            primary_sort = "-id"
            secondary_sort = "-num_watchers"

        if id != "":
            if mode == "post":
                canvas_list = CanvasNode.objects.filter(poster__id = int(id))
                target = User.objects.get(id = id)
            elif mode == "watch":
                canvas_list = CanvasNode.objects.filter(watched_users__id = int(id))
                target = User.objects.get(id = id)
            else:
                target = CanvasNode.objects.get(id = id)
                if mode == "branch":
                    canvas_list = target.children.all()
                elif mode == "subtree":
                    canvas_list = target.get_descendants().all()
        # Get all root nodes
        else:
            canvas_list = CanvasNode.objects.filter(parent=None)
        canvas_list = canvas_list.annotate(num_watchers = Count('watched_users'))
        canvas_list = canvas_list.order_by(""+primary_sort).distinct()
        data = {
            'canvases' : canvas_list,
            'browse_settings': {'mode': ("/"+ mode), 'id': ("/" + id), 'sort': ("/" + sort)},
            'target' : target,
            'self' : User.objects.get(id=request.session['id'])
        }
        return render(request, "doops/dashboard.html", data)
    return redirect('/')

def settings_page(request,id):
    if 'id' in request.session:
        this_user = User.objects.get(id=id)
    data = {'self': this_user}
    return render(request, "doops/settings.html", data)



def register_process(request):
    if request.method == 'POST':
        postData = User.objects.clean_input(request.POST, form_register=True)

        errors = (User.objects.validate_name(postData, min_length=2) 
                + User.objects.validate_email(postData) 
                + User.objects.validate_password(postData, min_length=8)
                )

        if len(errors):
            for error in errors:
                messages.error(request,error['message'], extra_tags=error['tag'])
        else:
            pw_hash = bcrypt.hashpw(postData['password'].encode(), bcrypt.gensalt())

            user = User.objects.create(
                username = postData['username'],
                email = postData['email'],
                password_hash = pw_hash
            )
            request.session['id'] = user.id
    return redirect('/')


def login_process(request):
    if request.method == 'POST':
        postData = User.objects.clean_input(request.POST, form_login=True)

        errors = (User.objects.validate_email(postData, check_unique=False) 
        + User.objects.validate_password(postData, min_length=8, check_confirm=False))

        if len(errors):
            messages.error(request, "Email/Password invalid", extra_tags='login' )
        else:
            user_list = User.objects.filter(email=postData['email'])
            if user_list:
                if bcrypt.checkpw(postData['password'].encode(), user_list[0].password_hash.encode()):
                    request.session['id'] = user_list[0].id
                    return redirect('/')
            
            messages.error(request, "Email/Password invalid", extra_tags='login')
    
    return redirect('/')

def submit_process(request, node_id):
    if request.method == 'POST' and 'id' in request.session:
        parent = None

        if node_id != 0:
            parent_list = CanvasNode.objects.filter(id=node_id)
            if parent_list:
                parent = parent_list[0]
    
        new_canvas = CanvasNode.objects.create(
            data_url = request.POST['data_url'],
            poster = User.objects.get(id=request.session['id']),
            parent = parent
        )

        if parent:
            Notification.objects.create(
                notified_user = parent.poster,
                new_canvas = new_canvas
            )
            for watcher in parent.watched_users.all():
                Notification.objects.create(
                notified_user = watcher,
                new_canvas = new_canvas,
                user_status = WATCHER
                )
            return redirect('/dashboard/new/branch/' + str(parent.id))

    return redirect('/')


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

def random_process(request):
    canvas_list = CanvasNode.objects.all()
    rand_index = randint(0,len(canvas_list))
    return redirect('/dashboard/new/branch/'+ str(canvas_list[rand_index].id))

# def get_notifications(request):
#     if 'id' in request.session:
@csrf_exempt
def clear_notification(request):
    user_id = int(request.POST['user_id'])
    noti_id = int(request.POST['noti_id'])
    if user_id == request.session['id']:
        noti_list = Notification.objects.filter(id=noti_id)
        if noti_list and noti_list[0].notified_user.id == user_id:
            noti_list[0].delete()
    return HttpResponse("EYYYO")

def logout_process(request):
    request.session.clear()
    return redirect('/')