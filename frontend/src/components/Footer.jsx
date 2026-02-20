export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-emerald-900 text-emerald-100 py-6 mt-auto dark:bg-emerald-950">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-sm">© {year} EncoderUnlimited. All rights reserved.</p>
        <p className="text-xs mt-1 text-emerald-200/80">
          Quran data from{' '}
          <a
            href="https://quran.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            Quran.com
          </a>
        </p>
      </div>
    </footer>
  );
}
