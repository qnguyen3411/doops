from django.conf.urls import url,include
from django.conf.urls.static import static
from django.conf import settings
from . import views
app_name = 'doops'
urlpatterns = [
    url(r'^admin$', views.admin_page, name="admin"),
    url(r'^$', views.index),
    url(r'dashboard/$', views.dashboard_page, name="dashboard"),

    url(r'dashboard/users/(?P<id>\d+)', views.user_page, name="user-canvases"),


    url(r'^users/settings$', views.settings_page, name="user-settings"),

    url(r'^login_process$', views.user_login_process, name="login-user"),
    url(r'^register_process$', views.user_register_process, name="register-user"),
    url(r'^update_process/(?P<id>\d+)$', views.user_update_process, name="update-user"),
    url(r'^delete_process/(?P<id>\d+)$', views.user_delete_process, name="delete-user"),


    url(r'^draw/(?P<id>\d+)?$', views.draw_page, name="new-canvas"),
    url(r'^dashboard/canvas/(?P<id>\d+)$', views.canvas_page, name="view-canvas"),
    url(r'^submit_canvas/(?P<node_id>\d+)$', views.submit_canvas, name="submit-canvas"),
    url(r'^delete_canvas/(?P<node_id>\d+)$', views.delete_canvas, name="delete-canvas"),
    url(r'^report_process/(?P<node_id>\d+)$', views.report_process, name="report-canvas"),



    url(r'^random_process$', views.random_process),
    url(r'^get_notifications$', views.get_notifications),
    url(r'^clear_notification(?P<noti_id>\d+)$', views.clear_notification, name="clear-notification"),
    url(r'^watch/(?P<node_id>\d+)$', views.watch_process),

    url(r'^logout$', views.user_logout_process, name="logout"),
]