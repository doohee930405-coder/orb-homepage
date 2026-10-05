from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "images" / "clinic"
PHOTO_ROOT = Path(
    "/Users/ran/Downloads/오브 한의원 .준공사진/"
    "3. 보정본/오브한의원 셀렉 수정"
)


SOURCES = {
    "hero-lobby": (PHOTO_ROOT / "RUINO_0008_P1833420.jpg", 2000),
    "reception": (PHOTO_ROOT / "RUINO_0002_P1833403.jpg", 1800),
    "media-wall": (PHOTO_ROOT / "RUINO_0011_P1833438.jpg", 1800),
    "logo-reception": (PHOTO_ROOT / "RUINO_0025_P1833489.jpg", 1200),
    "corridor": (PHOTO_ROOT / "RUINO_0030_P1833507.jpg", 1200),
    "consult-room": (PHOTO_ROOT / "RUINO_0087_P1833706.jpg", 1800),
    "treatment-room": (PHOTO_ROOT / "RUINO_0100_P1833749.jpg", 1800),
    "care-room": (PHOTO_ROOT / "RUINO_0113_P1833790.jpg", 1200),
    "detail-wall": (PHOTO_ROOT / "RUINO_0054_P1833603.jpg", 1200),
    "detail-flower": (PHOTO_ROOT / "RUINO_0065_P1833639.jpg", 1200),
}


def save_resized(source: Path, name: str, width: int, suffix: str) -> None:
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        target_width = min(width, image.width)
        target_height = round(image.height * target_width / image.width)
        resized = image.resize((target_width, target_height), Image.Resampling.LANCZOS)

        resized.save(
            OUTPUT / f"{name}-{suffix}.webp",
            "WEBP",
            quality=82,
            method=6,
        )
        resized.save(
            OUTPUT / f"{name}-{suffix}.avif",
            "AVIF",
            quality=58,
            speed=6,
        )


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)

    for name, (source, wide_width) in SOURCES.items():
        if not source.exists():
            raise FileNotFoundError(f"Missing source image: {source}")

        save_resized(source, name, wide_width, "wide")
        save_resized(source, name, 960, "mobile")


if __name__ == "__main__":
    main()
