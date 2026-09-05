export type SelectorProps = {
  title?: string;
  desc?: string;
  defaultValue?: string;
  options: Array<string>;
  onChange: (value: string) => void;
};
