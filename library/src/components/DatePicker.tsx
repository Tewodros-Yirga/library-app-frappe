import { TextField } from "@radix-ui/themes";
import { useEffect, useState } from "react";

interface DatePickerProps {
  id: string;
  value?: string;
  onChange: (date: string) => void;
  [key: string]: any;
}

const DatePicker = ({ id, value, onChange, ...props }: DatePickerProps) => {
  const [dateValue, setDateValue] = useState(value || "");

  useEffect(() => {
    if (value) {
      setDateValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDateValue(newValue);
    onChange(newValue);
  };

  return (
    <TextField.Root
      id={id}
      type="date"
      value={dateValue}
      onChange={handleChange}
      {...props}
    />
  );
};

export default DatePicker;
