import Link from "next/link";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="ছন্দ হোম">
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>ছন্দ</span>
    </Link>
  );
}
