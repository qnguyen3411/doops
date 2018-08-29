from django.conf.urls import url,include
from django.conf.urls.static import static
from django.conf import settings
from . import views
app_name = 'doops'
urlpatterns = [
    url(r'^$', views.index),
    url(r'^draw/(?P<id>\d+)?$', views.canvas_draw, name="new-canvas"),
    url(r'dashboard/$', views.dashboard_page, name="dashboard"),

    url(r'dashboard/users/(?P<id>\d+)', views.user_page, name="user-canvases"),

    url(r'^dashboard/canvas/(?P<id>\d+)$', views.canvas_show, name="canvas-by-id"),

    url(r'^users/settings$', views.settings_page, name="user-settings"),

    url(r'^login_process$', views.login_process),
    url(r'^register_process$', views.register_process),
    url(r'^update_process$', views.update_process),
    url(r'^update_info$', views.update_info),
    url(r'^update_pw$', views.update_pw),

    url(r'^submit_canvas/(?P<node_id>\d+)$', views.submit_canvas, name="submit-canvas"),
    url(r'^delete_canvas/(?P<node_id>\d+)$', views.delete_canvas),


    url(r'^get_relatives/(?P<node_id>\d+)$', views.get_relatives, name="get-node-relatives"),
    url(r'^random_process$', views.random_process),
    url(r'^get_notifications$', views.get_notifications),
    url(r'^clear_notification$', views.clear_notification),
    url(r'^watch/(?P<node_id>\d+)$', views.watch_process),

    url(r'^logout$', views.logout_process),
]