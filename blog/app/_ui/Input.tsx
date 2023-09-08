'use client'

import { AtSign, Eye, EyeOff, FormInput, KeyRound } from "lucide-react";
import { ChangeEvent, DetailedHTMLProps, InputHTMLAttributes, ReactElement, useRef, useState } from "react";

type Props = {
  label: string;
  required?: boolean;
  name?: string;
  onchange?: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>["onChange"];
  icon?: "email" | "password" | "text";
};

const Input = ({ label, required = false, name, icon, onchange }: Props) => {
  const [labelUp, setLabelUp] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null);
  const [passwdShow, setPasswdShow] = useState(false)

  const handleIconClick = () => {
    inputRef.current?.focus();
  };

  const className = `absolute w-6 h-6 top-3 select-none max-mobile-md:w-5 max-mobile-md:h-5 left-4 text-slate-300 stroke-slate-400 pointer-events-none select-none`

  const getIcon = (icon: string): ReactElement => {
    switch (icon) {
      case "email":
        return <AtSign onClick={handleIconClick} className={className} />
      case "password":
        return <KeyRound onClick={handleIconClick} className={className} />
      case "text":
        return <FormInput onClick={handleIconClick} className={className} />
      default:
        return <FormInput onClick={handleIconClick} className={className} />
    }
  }

  const handleOnchange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length !== 0) {
      setLabelUp(true)
    } else if (e.target.value.length === 0) {
      setLabelUp(false)
    }
  }

  const inputId = label.toLowerCase().replace(/\s/g, "-");

  return (
    <div className="w-full">
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}

          autoComplete="off"
          type={icon === "password" ? (passwdShow ? "text" : "password") : `${icon === "email" ? "email" : "text"}`}
          onChange={(e) => {
            if (onchange) onchange(e)
            handleOnchange(e)
          }}
          placeholder=""
          name={name}
          required={required}
          className={`w-full h-12 px-4 pl-12 ${icon === "password" && "pr-20"} transition-all bg-transparent border rounded outline-none peer border-slate-200 text-slate-400 autofill:bg-primary focus:border-fuchsia-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`} />
        <label onClick={handleIconClick} htmlFor={inputId} className={`cursor-pointer max-mobile-md:max-w-[120px] max-mobile-md:truncate select-none pointer-events-none peer-focus:cursor-default absolute ${labelUp ? `-top-[7px] left-2 text-xs before:content-['◀'] before:pr-2 after:content-['▶'] after:pl-2` : "left-10 top-3 text-base max-sm:text-sm"} z-[1] ml-2 text-slate-400 before:z-[-1] backdrop-blur-3xl peer-focus:before:content-['◀'] peer-focus:before:pr-1 peer-focus:after:content-['▶'] peer-focus:after:pl-1 peer-focus:-top-[7px] peer-focus:left-2 peer-focus:text-xs peer-focus:transition-all peer-focus:ease-in-out peer-focus:rounded-lg peer-focus:text-fuchsia-500`}>
          {label}
        </label>
        {icon === "password" && <>
          {
            passwdShow ? <EyeOff className={`absolute w-6 h-6 top-3 cursor-pointer select-none text-slate-300 right-4 stroke-slate-400`} onClick={() => setPasswdShow(false)} />
              : <Eye className={`absolute w-6 h-6 top-3 cursor-pointer select-none text-slate-300 right-4 stroke-slate-400`} onClick={() => setPasswdShow(true)} />
          }
        </>}
        {icon && getIcon(icon)}
      </div>
    </div>
  )
};

export default Input;