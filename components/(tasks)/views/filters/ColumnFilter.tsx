'use client';

import { Check, Filter, X } from 'lucide-react';
import { type ReactElement, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils/styles';

interface FilterOption {
  value: string;
  label: string;
}

interface ColumnFilterProps {
  columnId: string;
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export function ColumnFilter({
  columnId,
  label,
  options,
  selectedValues,
  onChange
}: ColumnFilterProps): ReactElement {
  const [open, setOpen] = useState(false);

  const toggleOption = (value: string): void => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  const clearFilter = (): void => {
    onChange([]);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 w-8 p-0 hover:bg-zinc-800',
            selectedValues.length > 0 && 'text-emerald-500'
          )}
        >
          <Filter className="h-4 w-4" />
          {selectedValues.length > 0 && (
            <Badge
              variant="default"
              className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px]"
            >
              {selectedValues.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`${label}で絞り込み...`} />
          <CommandEmpty>オプションが見つかりません</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => toggleOption(option.value)}
              >
                <div
                  className={cn(
                    'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-zinc-700',
                    selectedValues.includes(option.value)
                      ? 'bg-emerald-500 text-white'
                      : 'opacity-50'
                  )}
                >
                  {selectedValues.includes(option.value) && (
                    <Check className="h-3 w-3" />
                  )}
                </div>
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
          {selectedValues.length > 0 && (
            <>
              <Separator />
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-zinc-400 hover:text-zinc-300"
                  onClick={clearFilter}
                >
                  <X className="mr-2 h-4 w-4" />
                  フィルターをクリア
                </Button>
              </div>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

