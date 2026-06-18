import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, leftIcon, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900',
              leftIcon && 'pl-10',
              'placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'transition-all duration-200',
              error && 'border-red-300 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, id, leftIcon, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-3 flex items-center">
              {leftIcon}
            </div>
          )}
          <textarea
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 resize-none',
              leftIcon && 'pl-10',
              'placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'transition-all duration-200',
              error && 'border-red-300 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  leftIcon?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, leftIcon, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900',
              leftIcon && 'pl-10',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'transition-all duration-200',
              error && 'border-red-300 focus:ring-red-500',
              className
            )}
            {...props}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
