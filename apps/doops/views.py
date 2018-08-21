from django.shortcuts import render, HttpResponse, redirect
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
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
        'canvases' : CanvasNode.objects.order_by('-id')
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

def get_nodes():
    return HttpResponse("HEYBOI")

def logout_process(request):
    request.session.clear()
    return redirect('/')