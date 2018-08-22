from django.conf.urls import url,include
from . import views
urlpatterns = [
    url(r'^$', views.index),
    url(r'^canvas$', views.canvas_page),
    url(r'^canvas/(?P<node_id>\d+)$', views.canvas_page),
    url(r'dashboard/(?P<sort>((new)|(popular)))?/?(?P<mode>((post)|(watch)|(node))?)/?(?P<id>(\d+)?)/?$', views.dashboard_page),
    url(r'^users/(?P<id>\d+)/settings$', views.settings_page),

    # url(r'^get_nodes$', views.get_nodes),
    url(r'^login_process$', views.login_process),
    url(r'^register_process$', views.register_process),
    url(r'^submit_process/(?P<node_id>\d+)$', views.submit_process),
    url(r'^watch/(?P<node_id>\d+)$', views.watch_process),

    url(r'^logout$', views.logout_process),
]