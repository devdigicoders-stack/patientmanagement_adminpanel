import React from "react";
import { Calendar } from "lucide-react";
import { Input } from "./Input";

export const DatePicker = ({ label, value, onChange, error, required = false, ...props }) => {
  return (
    <Input
      type="date"
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      required={required}
      icon={Calendar}
      {...props}
    />
  );
};
