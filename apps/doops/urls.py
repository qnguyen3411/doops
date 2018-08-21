from django.conf.urls import url,include
from . import views
urlpatterns = [
    url(r'^$', views.index),
    url(r'^canvas$', views.canvas_page),
    url(r'^dashboard$', views.dashboard_page),
    url(r'^users/(?P<id>\d+)/settings$', views.settings_page),

    url(r'^login_process$', views.login_process),
    url(r'^register_process$', views.register_process),
    url(r'^logout$', views.logout_process),
]