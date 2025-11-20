export default function Description({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2 className="mx-auto mt-4 text-center text-sm text-gray-500 md:text-base dark:text-neutral-400">
      {children}
    </h2>
  );
}
