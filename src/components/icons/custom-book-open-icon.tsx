// src/components/icons/custom-book-open-icon.tsx
import type { SVGProps } from 'react';

export function CustomBookOpenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em" // Allows scaling with font size or className
      height="1em" // Allows scaling with font size or className
      viewBox="0 0 24 24"
      fill="white" // Pages filled white
      stroke="currentColor" // Outline and spine color (controlled by parent's text color)
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props} // className (e.g., h-7 w-7 text-primary) will be passed here
    >
      {/* Original BookOpen paths for the two pages */}
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      {/* Added line for the spine/middle crease */}
      <path d="M12 7v14" />
    </svg>
  );
}
