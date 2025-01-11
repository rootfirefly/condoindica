import React from 'react'

interface VerifiedBadgeProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ title, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {title && <title>{title}</title>}
    <path d="M12 2L3 7v9c0 5 9 6 9 6s9-1 9-6V7l-9-5z" />
    <path d="M8 11l3 3 5-5" />
  </svg>
)

