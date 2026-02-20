"""
API URL configuration
"""
from django.urls import path
from . import views
from .oauth_views import oauth_login, oauth_callback, oauth_exchange, oauth_me, oauth_logout

urlpatterns = [
    path("oauth/login/", oauth_login),
    path("oauth/callback/", oauth_callback),
    path("oauth/exchange/", oauth_exchange),
    path("oauth/me/", oauth_me),
    path("oauth/logout/", oauth_logout),
    path("chapters/", views.chapters),
    path("chapters/<int:chapter_id>/", views.chapter_detail),
    path("chapters/<int:chapter_id>/verses/", views.verses),
    path("juzs/", views.juzs),
    path("juzs/<int:juz_number>/verses/", views.verses_by_juz),
    path("translations/", views.translations),
    path("recitations/", views.recitations),
    path("verses/by_key/<str:verse_key>/", views.verse_by_key),
    path("tafsirs/", views.tafsirs),
    path("tafsirs/<int:tafsir_id>/", views.tafsir_verse),
]
