import { Select } from '@/components/retroui/Select';

const CREATABLE_FORMATS = [
  { value: 'ips', label: 'IPS' },
  { value: 'bps', label: 'BPS' },
  { value: 'ups', label: 'UPS' },
  { value: 'ppf', label: 'PPF' },
  { value: 'aps', label: 'APS (N64)' },
  { value: 'rup', label: 'RUP' },
  { value: 'ebp', label: 'EBP (IPS + metadata)' },
];

interface FormatSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function FormatSelect({ value, onChange }: FormatSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <Select.Trigger className="w-48">
        <Select.Value placeholder="Patch format" />
      </Select.Trigger>
      <Select.Content>
        {CREATABLE_FORMATS.map((fmt) => (
          <Select.Item key={fmt.value} value={fmt.value}>
            {fmt.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}
