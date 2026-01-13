import { forwardRef } from 'react';

const RobloxTilt = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement> & { size?: number | string }>(
  ({ color = "currentColor", size = 24, className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 150 150"
        fill="none"
        className={className}
        {...props}
      >
        <path
          d="M31.6984 0L0 118.302L118.302 150L150 31.6984L31.6984 0ZM87.1031 95.9652L54.0454 87.1031L62.9075 54.0454L95.9784 62.9075L87.1031 95.9652Z"
          fill={color}
        />
      </svg>
    );
  }
);

RobloxTilt.displayName = 'RobloxTilt';

export default RobloxTilt;