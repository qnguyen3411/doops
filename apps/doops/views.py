from django.shortcuts import render, HttpResponse, redirect
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from django.db.models import Count
from django.db.models.functions import Length

from django.core import serializers
from django.http import JsonResponse
from django.db.models import F
import json
import bcrypt
from .models import *
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
            print("ISNOTROOT!")
        else:
            data['isRoot'] = True;
    
    return render(request, "doops/canvas.html", data)

def dashboard_page(request):
    data = {
        'canvases' : CanvasNode.objects.order_by('-id'),
        'self' : User.objects.get(id=request.session['id'])
    }
    return render(request, "doops/dashboard.html", data)

def settings_page(request,id):
    return render(request, "doops/settings.html")





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
    
        CanvasNode.objects.create(
            data_url = request.POST['data_url'],
            poster = User.objects.get(id=request.session['id']),
            parent = parent
        )
    return redirect('/')

def watch_process(request, node_id):
    if 'id' in request.session:
        
        canvas_list = CanvasNode.objects.filter(id=int(node_id))
        if canvas_list:
            canvas = canvas_list[0]
        this_user = User.objects.get(id=request.session['id'])
        canvas.watched_users.add(this_user)
        print(canvas.watched_users.all())
    return redirect('/')

@csrf_exempt
def get_nodes(request):
    output = ""
    canvas_list =[]
    for key,value in request.POST.items():
        output += key
        output += " "
        output += value
        output += "\n"
    if request.POST['sort'] == 'new':
        sort = '-id'
        sort2 = '-num_watchers'
    else:
        sort = '-num_watchers'
        sort2 = '-id'
    canvas_list = CanvasNode.objects.annotate(poster_posted_canvas_count = Length('poster__posted_canvases'))
    canvas_list = canvas_list.annotate(poster_watched_canvas_count = Length('poster__watched_canvases'))
    canvas_list = canvas_list.annotate(num_watchers = Length('watched_users'))
    canvas_list = canvas_list.annotate(children_count = Length('children'))
    canvas_list = canvas_list.order_by(sort, sort2)
    if request.POST['mode'] == 'all':
        pass
    elif request.POST['mode'] == 'post':
        canvas_list = canvas_list.filter(poster__id = int(request.POST['user_id']))
    elif request.POST['mode'] == 'watch':
        canvas_list = canvas_list.filter(watched_users__id = int(request.POST['user_id']))
    else:
        canvas_list = canvas_list.filter(parent__id = int(request.POST['node_id']))

    canvas_list = canvas_list.annotate(poster_name = F('poster__username'))
    # canv_list = canvas_list.values()
    # return HttpResponse(output)
    return JsonResponse({'canvas_list': list(canvas_list.values()) })



def logout_process(request):
    request.session.clear()
    return redirect('/')