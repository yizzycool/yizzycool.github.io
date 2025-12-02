type Props = {
  children: React.ReactNode;
};

export default function Title({ children }: Props) {
  return (
    <h1 className="mx-auto mt-6 text-2xl font-bold sm:mt-12">{children}</h1>
  );
}
