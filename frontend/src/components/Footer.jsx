export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-emerald-900 text-emerald-100 py-6 mt-auto dark:bg-emerald-950">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-sm">© {year} EncoderUnlimited. All rights reserved.</p>
      </div>
    </footer>
  );
}
