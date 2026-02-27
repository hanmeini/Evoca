export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-100 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-stone-500">
        <p className="font-serif mb-2">
          &copy; {new Date().getFullYear()} Evoca AI. Educational Reader.
        </p>
        <p className="font-sans text-xs uppercase tracking-widest text-stone-400">
          Powered by Gemini & ElevenLabs
        </p>
      </div>
    </footer>
  );
}
