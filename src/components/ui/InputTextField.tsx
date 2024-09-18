'use client';

import { ChangeEventHandler, KeyboardEventHandler, useState } from 'react';

import clsx from 'clsx';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CopyIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

type Props = {
   name?: string;
   label?: string;
   hint?: string;
   value?: string;
   type?: string;
   hintText?: string;
   onChange?: ChangeEventHandler<HTMLInputElement>;
   showLabel?: boolean;
   onKeyDownCapture?: KeyboardEventHandler<HTMLInputElement>;
   onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
   readOnly?: boolean;
   disabled?: boolean;
   maxLength?: number;
   minLength?: number;
   isCopyContent?: boolean;
   isMonotype?: boolean;
   hiddenValue?: string;
   isError?: boolean;
   errorMessage?: string;
   id?: string;
   className?: string;
   copyFeedbackMessage?: string;
   startAdornment?: string;
};

export default function InputTextField({
   label = '',
   hint = '',
   value = '',
   type = 'text',
   hintText = '',
   onChange = () => {},
   showLabel = true,
   onKeyDownCapture,
   readOnly,
   disabled,
   maxLength,
   minLength,
   isCopyContent = false,
   isMonotype = false,
   hiddenValue = '',
   name,
   isError = false,
   errorMessage = '',
   className,
   copyFeedbackMessage = 'Copied!',
   startAdornment,
   onKeyDown,
}: Props) {
   const [length, setLength] = useState(value.length);

   return (
      <div
         className="flex flex-col items-start relative group autofill-reset"
         onClick={(e) => {
            if (!isCopyContent) return;
            e.preventDefault();
            e.stopPropagation();
            if (hiddenValue !== '') {
               navigator.clipboard.writeText(hiddenValue);
            } else {
               navigator.clipboard.writeText(value);
            }
            toast('Copied to clipboard');
         }}
      >
         {showLabel && <Label className="mb-2">{label}</Label>}
         {startAdornment && (
            <span className={cn(showLabel ? 'mt-[30px]' : 'mt-[8px]', 'absolute left-0 pl-3 pointer-events-none')}>
               {startAdornment}
            </span>
         )}
         <Input
            key={name ?? label}
            type={type}
            name={label}
            id={label}
            prefix={startAdornment}
            className={cn(
               'focus-visible:ring-primary focus-visible:ring-offset-0 focus:border-transparent',
               isCopyContent && 'cursor-pointer group-hover:bg-primary/10 pr-12 truncate',
               isMonotype && ' font-mono text-xs font-semibold',
               isError && ' ring-destructive',
               startAdornment && 'pl-6',
               className,
            )}
            placeholder={hint}
            readOnly={readOnly}
            disabled={disabled}
            onKeyDownCapture={onKeyDownCapture}
            onKeyDown={onKeyDown}
            onChange={(event) => {
               setLength(event.target.value.length);
               onChange(event);
            }}
            value={value}
            contentEditable={!readOnly}
            maxLength={maxLength}
         />
         {isCopyContent && (
            <span className="absolute right-3 top-[19px] group-hover:cursor-pointer">
               <CopyIcon className="h-4 w-4 text-primary" />
            </span>
         )}
         {typeof maxLength === 'number' && typeof minLength === 'number' && (
            <p className={clsx('mt-1 text-sm', (length > maxLength || length < minLength) && 'text-destructive')}>
               {length}/{maxLength}
            </p>
         )}
         {isError && <p className="mt-1 text-xs text-red-300">{errorMessage}</p>}
         {!isError && <p className="mt-1 text-xs text-muted-foreground">{hintText}</p>}
      </div>
   );
}
