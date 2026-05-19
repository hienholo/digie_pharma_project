import { Search, Camera, Pill } from "lucide-react";
import { useState } from "react";

type Props = {
  onSearch: (q: string) => void;
  onUpload: () => void;
};

export function SearchHero({ onSearch, onUpload }: Props) {
  const [q, setQ] = useState("");
  const suggestions = ["Doliprane", "Amoxicilline", "Ventoline", "Ibuprofène"];

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #3B82F6 0%, #2563EB 60%, #10B981 120%)",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-14 md:py-20 text-center text-white">
        <h1 className="text-white" style={{ fontSize: "2rem" }}>
          Trouvez vos médicaments près de chez vous
        </h1>
        <p className="mt-3 text-white/90">
          Recherchez, commandez, recevez — en toute simplicité.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearch(q);
          }}
          className="mt-8 bg-white rounded-2xl p-2 flex items-center gap-2 shadow-xl"
        >
          <div className="pl-3 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nom du médicament, molécule..."
            className="flex-1 bg-transparent outline-none py-3 text-gray-800 placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={onUpload}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100"
          >
            <Camera className="w-4 h-4" />
            Ordonnance
          </button>
          <button
            type="submit"
            className="px-5 py-3 rounded-xl text-white"
            style={{ backgroundColor: "#2563EB" }}
          >
            Rechercher
          </button>
        </form>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQ(s);
                onSearch(s);
              }}
              className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur"
            >
              <Pill className="w-3.5 h-3.5" />
              {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
