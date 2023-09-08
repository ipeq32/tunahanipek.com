'use client';

import { FileSignature } from "lucide-react";
import { ChangeEventHandler, DetailedHTMLProps, TextareaHTMLAttributes, useRef, useState } from "react";

type Props = {
  label?: string;
  onchange?: ChangeEventHandler<HTMLTextAreaElement>;
  name?: DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>["name"];
  required?: DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>["required"];
  rows?: number;
  cols?: number;
};

const TextArea = ({
  label = "",
  onchange,
  name,
  required,
  rows = 4,
  cols = 50
}: Props) => {
  const [labelUp, setLabelUp] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleOnchange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length !== 0) {
      setLabelUp(true)
    } else if (e.target.value.length === 0) {
      setLabelUp(false)
    }
  }

  const handleIconClick = () => {
    inputRef.current?.focus();
  };

  const inputId = label.toLowerCase().replace(/\s/g, "-");

  return (
    <div className="w-full">
      <div className="relative">
        <textarea
          ref={inputRef}
          id={inputId}
          autoComplete="off"
          placeholder=""
          onChange={(e) => {
            if (onchange) onchange(e)
            handleOnchange(e)
          }}
          name={name}
          required={required}
          rows={rows}
          cols={cols}
          className={`relative w-full px-4 pb-2 pt-3 leading-6 indent-8 min-h-[50px] max-h-40 transition-all bg-transparent border rounded outline-none focus-visible:outline-none peer border-slate-200 text-slate-400 autofill:bg-primary focus:border-fuchsia-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
        />
        <label onClick={handleIconClick} htmlFor={inputId} className={`cursor-pointer max-mobile-md:max-w-[120px] max-mobile-md:truncate select-none pointer-events-none peer-focus:cursor-default absolute ${labelUp ? "-top-[7px] left-2 text-xs before:content-['◀'] before:pr-2 after:content-['▶'] after:pl-2" : "left-10 top-3 text-base max-sm:text-sm"} z-[1] ml-2 text-slate-400 before:z-[-1] bg-primary peer-focus:-top-[7px] peer-focus:left-2 peer-focus:text-xs peer-focus:before:content-['◀'] peer-focus:before:pr-1 peer-focus:after:content-['▶'] peer-focus:after:pl-1 peer-focus:transition-all peer-focus:ease-in-out peer-active:border-x-0 peer-focus:rounded-lg peer-focus:text-fuchsia-500`}>
          {label}
        </label>
        <FileSignature onClick={handleIconClick} className="absolute w-6 h-6 select-none text-slate-300 top-3 left-4 stroke-slate-400" />
      </div>
    </div>
  );
};

export default TextArea;