import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Button component supporting multiple variants and sizes.
 * Utilises the existing utility classes defined in `index.css`.
 */
export default function Button({ variant = 'primary', size = 'md', children, className, ...props }) {
  const baseClasses = 'btn focus-visible:outline-none';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  }[variant];
  const sizeClasses = {
    sm: 'text-xs py-2 px-3.5',
    md: 'text-sm py-2.5 px-4',
    lg: 'text-base py-3 px-5',
  }[size];

  return (
    <button
      className={classNames(baseClasses, variantClasses, sizeClasses, className)}
      {...props}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
