'use client';

import React from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export default function SafeImage({
  src,
  alt,
  fallbackSrc,
  className,
  loading = 'lazy',
  ...props
}: SafeImageProps) {
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt || ''}
      loading={loading}
      referrerPolicy="no-referrer"
      className={className}
      onError={(e) => {
        // 절대 더미 한의원 내부 인테리어 사진 등으로 대체하지 않고 순수 렌더링 유지 (에러 시 숨김)
        e.currentTarget.style.display = 'none';
      }}
      {...props}
    />
  );
}
