from django.db import models
from django.conf import settings


class Bookmark(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookmarks")
    verse_key = models.CharField(max_length=20)
    chapter_id = models.PositiveIntegerField()
    verse_number = models.PositiveIntegerField()
    text_preview = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "verse_key"]
        ordering = ["-created_at"]
