import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface RangeInputValue {
  condition: string;
  value: string;
}

interface RangeInputFilterProps {
  label: string;
  conditions?: string[];
  defaultCondition?: string;
  value?: string;
  onChange?: (val: RangeInputValue) => void;
  className?: string;
}

export function RangeInputFilter({
  label,
  conditions = ["Greater than", "Less than", "Equal to", "Between"],
  defaultCondition = "Greater than",
  value: initialValue = "",
  onChange,
  className = "",
}: RangeInputFilterProps) {
  const [condition, setCondition] = useState(defaultCondition);
  const [value, setValue] = useState(initialValue);

  const handleConditionChange = (newCondition: string) => {
    setCondition(newCondition);
    onChange?.({ condition: newCondition, value });
  };

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    onChange?.({ condition, value: newValue });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex flex-col min-w-[170px]">
        <span className="font-normal text-[#5b636a] text-xs">{label}</span>
        <Select value={condition} onValueChange={handleConditionChange}>
          <SelectTrigger
            className="border-0 p-0 h-auto text-xs text-[#0f69ff] font-normal shadow-none focus:ring-0 w-auto gap-0.5"
            data-testid={`select-condition-${label.replace(/\s+/g, "-").toLowerCase()}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {conditions.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Input
        type="text"
        value={value}
        onChange={(e) => handleValueChange(e.target.value)}
        className="w-20 h-7 text-xs border-[#e0e4e9] rounded-[3px]"
        data-testid={`input-${label.replace(/\s+/g, "-").toLowerCase()}`}
      />
    </div>
  );
}