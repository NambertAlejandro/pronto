import Image from 'next/image';
import logo from '@/public/brand/tempus-logo-horizontal.webp';

/** Original Tempus symbol and lettering, arranged for compact app headers. */
export function Logo() {
  return (
    <span className="brand">
      <Image
        src={logo}
        alt="Tempus"
        className="brand-image"
        sizes="(max-width: 650px) 185px, 238px"
        priority
      />
    </span>
  );
}
