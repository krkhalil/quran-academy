from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Bookmark
from .serializers import BookmarkSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def bookmark_list(request):
    bookmarks = Bookmark.objects.filter(user=request.user)
    serializer = BookmarkSerializer(bookmarks, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def bookmark_create(request):
    verse_key = request.data.get("verse_key")
    chapter_id = request.data.get("chapter_id")
    verse_number = request.data.get("verse_number")
    text_preview = request.data.get("text_preview", "")[:200]

    if not all([verse_key, chapter_id, verse_number]):
        return Response({"error": "verse_key, chapter_id, verse_number required"}, status=status.HTTP_400_BAD_REQUEST)

    bookmark, created = Bookmark.objects.get_or_create(
        user=request.user,
        verse_key=verse_key,
        defaults={
            "chapter_id": chapter_id,
            "verse_number": verse_number,
            "text_preview": text_preview,
        },
    )
    if not created:
        return Response(BookmarkSerializer(bookmark).data, status=status.HTTP_200_OK)
    return Response(BookmarkSerializer(bookmark).data, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def bookmark_delete(request, verse_key):
    deleted, _ = Bookmark.objects.filter(user=request.user, verse_key=verse_key).delete()
    if deleted:
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
