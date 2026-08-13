type IconProps = { className?: string };

export function ArrowIcon({ className }: IconProps) {
  return (
    <span className={className} aria-hidden="true">
      ←
    </span>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <span className={className} aria-hidden="true">
      ✓
    </span>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <span className={className} aria-hidden="true">
      ◷
    </span>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <span className={className} aria-hidden="true">
      ✦
    </span>
  );
}
