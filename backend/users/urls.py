from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path("token/", TokenObtainPairView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view()),
    path("bookmarks/", views.bookmark_list),
    path("bookmarks/create/", views.bookmark_create),
    path("bookmarks/<str:verse_key>/", views.bookmark_delete),
]
