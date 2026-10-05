type ResponsivePictureProps = {
  image: string;
  alt: string;
  className?: string;
  eager?: boolean;
  position?: string;
  fit?: 'cover' | 'contain';
};

export default function ResponsivePicture({
  image,
  alt,
  className,
  eager = false,
  position,
  fit,
}: ResponsivePictureProps) {
  const imgStyle = {
    ...(position ? { objectPosition: position } : {}),
    ...(fit ? { objectFit: fit } : {}),
  };

  if (image.includes('.') || image.startsWith('/')) {
    const src = image.startsWith('/') ? image : `/images/clinic/${image}`;
    return (
      <picture className={className}>
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          decoding="async"
          style={imgStyle}
        />
      </picture>
    );
  }

  const root = `/images/clinic/${image}`;

  return (
    <picture className={className}>
      <source media="(max-width: 767px)" srcSet={`${root}-mobile.avif`} type="image/avif" />
      <source media="(max-width: 767px)" srcSet={`${root}-mobile.webp`} type="image/webp" />
      <source srcSet={`${root}-wide.avif`} type="image/avif" />
      <source srcSet={`${root}-wide.webp`} type="image/webp" />
      <img
        src={`${root}-wide.webp`}
        alt={alt}
        width={2000}
        height={1333}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
        style={imgStyle}
      />
    </picture>
  );
}
