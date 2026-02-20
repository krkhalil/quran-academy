from rest_framework import serializers
from .models import Bookmark


class BookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmark
        fields = ["id", "verse_key", "chapter_id", "verse_number", "text_preview", "created_at"]
        read_only_fields = ["created_at"]
