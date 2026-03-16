import { m } from "framer-motion";
import { useEffect, useState } from "react";

const images = [
  "/campus/hero.jpg",
  "/campus/hero2.jpg",
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="h-screen bg-cover bg-center relative transition-all duration-1000"
      style={{ backgroundImage: `url(${images[index]})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <m.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-wide">
          SYMBIOSIS PUNE
        </h1>

        <p className="text-lg md:text-xl text-gray-200 max-w-2xl">
          Student Information Portal
        </p>

        <p className="mt-3 text-gray-300 max-w-xl">
          Secure academic access for Students, Faculty, and HODs
        </p>

        <button className="mt-10 px-8 py-3 bg-yellow-500 text-black font-semibold rounded-md hover:bg-yellow-400 transition">
          Continue with Symbiosis ID
        </button>
      </m.div>
    </section>
  );
}
