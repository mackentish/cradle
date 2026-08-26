export type TimePickerProps = Readonly<{
  hour: number;
  minute: number;
  /** Fires on every change; the caller is expected to debounce persistence. */
  onChange: (hour: number, minute: number) => void;
}>;
