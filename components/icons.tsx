import type { SVGProps } from "react";
import type { SubscriptionCategory } from "@/lib/types";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, className, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true as const,
    ...props,
  };
}

export function IconMobile(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </svg>
  );
}

export function IconInternet(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 3 3.8 6 3.8 9s-1.3 6-3.8 9c-2.5-3-3.8-6-3.8-9s1.3-6 3.8-9z" />
    </svg>
  );
}

export function IconStreaming(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M10 9.5l5 2.5-5 2.5v-5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconEnergy(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13 2L5.5 13.5h5L9.5 22 18.5 10H13L13 2z" />
    </svg>
  );
}

export function IconDashboard(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

export function IconSubscriptions(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h10" />
      <circle cx="18.5" cy="17" r="2.5" />
    </svg>
  );
}

export function IconRecommendations(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l1.8 5.5H19.5l-4.4 3.3 1.7 5.4L12 14.8 7.2 17.2l1.7-5.4L4.5 8.5h5.7L12 3z" />
    </svg>
  );
}

export function IconProfile(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19.5c1.6-3.2 4-4.8 7-4.8s5.4 1.6 7 4.8" />
    </svg>
  );
}

export function IconWarning(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5L21 19.5H3L12 3.5z" />
      <path d="M12 10v4" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconSpark(props: IconProps) {
  return (
    <svg {...base({ ...props, strokeWidth: props.strokeWidth ?? 1.5 })}>
      <path d="M12 2.5v3.5M12 18v3.5M2.5 12H6M18 12h3.5" />
      <path d="M5.5 5.5l2.4 2.4M16.1 16.1l2.4 2.4M18.5 5.5l-2.4 2.4M7.9 16.1l-2.4 2.4" />
      <circle cx="12" cy="12" r="2.25" />
    </svg>
  );
}

const CATEGORY_ICON_MAP = {
  mobile: IconMobile,
  internet: IconInternet,
  streaming: IconStreaming,
  energy: IconEnergy,
} as const;

export function CategoryIcon({
  category,
  size = 18,
  className,
}: {
  category: SubscriptionCategory;
  size?: number;
  className?: string;
}) {
  const Icon = CATEGORY_ICON_MAP[category];
  return <Icon size={size} className={className} />;
}

export function CategoryIconBadge({
  category,
  size = 18,
  className = "",
}: {
  category: SubscriptionCategory;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center text-accent ${className}`}
    >
      <CategoryIcon category={category} size={size} />
    </span>
  );
}
