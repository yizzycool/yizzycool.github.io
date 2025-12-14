export default function Footer() {
  return (
    <div className="mx-auto max-w-screen-2xl border-t border-neutral-400/20">
      <footer className="mx-auto flex w-full justify-center py-10 text-xs">
        <p>
          Designed & Developed by{' '}
          <a
            href="https://www.linkedin.com/in/yizzy/"
            target="_blank"
            rel="noreferrer"
          >
            {process.env.NEXT_PUBLIC_WEBSITE_NAME}
          </a>{' '}
          &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
