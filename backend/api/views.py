"""
API proxy views - forward requests to Quran.com API
"""
from django.core.cache import cache
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .services.quran_client import (
    get_chapters,
    get_chapter,
    get_verses,
    get_verses_by_juz,
    get_verses_by_page,
    get_translations,
    get_recitations,
    get_juzs,
    get_verse_by_key,
    get_tafsirs,
    get_tafsir_by_verse,
    search_verses,
)


@api_view(["GET"])
def chapters(request):
    """List all 114 chapters (cached 24h)."""
    language = request.GET.get("language", "en")
    cache_key = f"chapters_{language}"
    data = cache.get(cache_key)
    if data is None:
        data = get_chapters(language=language)
        cache.set(cache_key, data, timeout=60 * 60 * 24)  # 24 hours
    return Response(data)


@api_view(["GET"])
def chapter_detail(request, chapter_id):
    """Get single chapter metadata."""
    language = request.GET.get("language", "en")
    data = get_chapter(chapter_id, language=language)
    return Response(data)


@api_view(["GET"])
def verses(request, chapter_id):
    """Get verses for a chapter."""
    tafsirs = request.GET.get("tafsirs")
    data = get_verses(
        chapter_id,
        translations=request.GET.get("translations", "131"),
        audio=int(request.GET.get("audio", 1)),
        words=request.GET.get("words", "false").lower() == "true",
        tafsirs=tafsirs if tafsirs else None,
        page=int(request.GET.get("page", 1)),
        per_page=int(request.GET.get("per_page", 20)),
        tajweed=request.GET.get("tajweed", "false").lower() == "true",
    )
    return Response(data)


@api_view(["GET"])
def verses_by_juz(request, juz_number):
    """Get verses by Juz number."""
    data = get_verses_by_juz(
        juz_number,
        translations=request.GET.get("translations", "131"),
        page=int(request.GET.get("page", 1)),
        per_page=int(request.GET.get("per_page", 20)),
        tajweed=request.GET.get("tajweed", "false").lower() == "true",
    )
    return Response(data)


@api_view(["GET"])
def translations(request):
    """List available translations."""
    language = request.GET.get("language", "en")
    data = get_translations(language=language)
    return Response(data)


@api_view(["GET"])
def recitations(request):
    """List available reciters."""
    data = get_recitations()
    return Response(data)


@api_view(["GET"])
def juzs(request):
    """List 30 Juz."""
    data = get_juzs()
    return Response(data)


@api_view(["GET"])
def verse_by_key(request, verse_key):
    """Get single verse by key (e.g. 1:1)."""
    data = get_verse_by_key(
        verse_key,
        translations=request.GET.get("translations", "131"),
    )
    return Response(data)


@api_view(["GET"])
def verses_by_page(request, page_number):
    """Get verses by Mushaf page (1-604)."""
    data = get_verses_by_page(
        page_number,
        translations=request.GET.get("translations", "131"),
        per_page=int(request.GET.get("per_page", 20)),
        audio=int(request.GET.get("audio", 1)),
        words=request.GET.get("words", "false").lower() == "true",
    )
    return Response(data)


@api_view(["GET"])
def search(request):
    """Full-text search across the Quran."""
    q = request.GET.get("q", "").strip()
    if not q:
        return Response({"search": {"query": "", "results": [], "total_results": 0}})
    data = search_verses(
        query=q,
        page=int(request.GET.get("page", 1)),
        size=int(request.GET.get("size", 20)),
        language=request.GET.get("language", "en"),
    )
    return Response(data)


@api_view(["GET"])
def tafsirs(request):
    """List available tafsirs."""
    data = get_tafsirs()
    return Response(data)


@api_view(["GET"])
def tafsir_verse(request, tafsir_id):
    """Get tafsir for verse(s)."""
    verse_key = request.GET.get("verse_key")
    chapter_number = request.GET.get("chapter_number")
    if not verse_key and not chapter_number:
        return Response({"error": "verse_key or chapter_number required"}, status=400)
    data = get_tafsir_by_verse(
        tafsir_id,
        verse_key=verse_key,
        chapter_number=int(chapter_number) if chapter_number else None,
    )
    return Response(data)
