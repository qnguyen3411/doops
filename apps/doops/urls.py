from django.conf.urls import url,include
from django.conf.urls.static import static
from django.conf import settings
from . import views
urlpatterns = [
    url(r'^$', views.index),
    url(r'^canvas$', views.canvas_page),
    url(r'^canvas/(?P<node_id>\d+)$', views.canvas_page),
    url(r'dashboard/(?P<sort>((new)|(popular)))?/?(?P<mode>((post)|(watch)|(branch)|(subtree)|(trace))?)/?(?P<id>(\d+)?)/?$', views.dashboard_page),
    url(r'^users/(?P<id>\d+)/settings$', views.settings_page),

    # url(r'^get_nodes$', views.get_nodes),
    url(r'^login_process$', views.login_process),
    url(r'^register_process$', views.register_process),
    url(r'^update_info$', views.update_info),
    url(r'^update_pw$', views.update_pw),
    url(r'^submit_process/(?P<node_id>\d+)$', views.submit_process),
    url(r'^delete_canvas/(?P<node_id>\d+)$', views.delete_canvas),
    url(r'^random_process$', views.random_process),
    url(r'^get_notifications$', views.get_notifications),
    url(r'^clear_notification$', views.clear_notification),
    url(r'^watch/(?P<node_id>\d+)$', views.watch_process),

    url(r'^logout$', views.logout_process),
]