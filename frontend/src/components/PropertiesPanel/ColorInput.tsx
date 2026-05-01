import { normalizeToHex } from "../../shared/colors";

type Props = {
  label: string;
  value: string | undefined;
  onChange: (hex: string) => void;
};

export default function ColorInput({ label, value, onChange }: Props) {
  const hex = normalizeToHex(value);
  return (
    <label className="row">
      <span>{label}</span>
      <input
        type="color"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        title={value ?? hex}
      />
    </label>
  );
}
