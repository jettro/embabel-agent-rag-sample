import re
from urllib.parse import urlparse
import trafilatura


def slug_to_filename(url: str) -> str:
    """
    Converts the last part of the URL path into a filename.
    Strips Medium-style trailing hex id: '-a2b5ab830120'
    """
    path = urlparse(url).path.rstrip("/")
    slug = path.split("/")[-1]

    # Remove trailing Medium id: -<hex> (usually 10-12 chars, but we allow 6-20 to be safe)
    slug = re.sub(r"-[0-9a-f]{6,20}$", "", slug, flags=re.IGNORECASE)

    return f"{slug}.md"


url = "https://jettro.dev/building-agents-with-embabel-a-hands-on-introduction-4f96d2edeac0?source=friends_link&sk=1885a9d125f7ee6f37c64973241e082e"

downloaded = trafilatura.fetch_url(url)
if not downloaded:
    raise RuntimeError("Failed to download the page.")

md = trafilatura.extract(
    downloaded,
    output_format="markdown",
    include_links=True,
    include_images=True,
    include_formatting=True,
    with_metadata=True
)

if not md:
    raise RuntimeError("Extraction returned empty content.")

output_file = slug_to_filename(url)

with open(output_file, "w", encoding="utf-8") as f:
    f.write(md)

print(f"Wrote {output_file}")