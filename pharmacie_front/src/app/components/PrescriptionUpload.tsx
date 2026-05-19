import { Camera, Upload, X, Check, Edit3 } from "lucide-react";
import { useState } from "react";
import { ocrMock } from "../datamock/ocr.mock";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (items: string[]) => void;
};

export function PrescriptionUpload({ open, onClose, onConfirm }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [scanning, setScanning] = useState(false);

  if (!open) return null;

  const handleFile = (f: File) => {
    const url = URL.createObjectURL(f);
    setPreview(url);
    setScanning(true);
    setTimeout(() => {
      setItems(ocrMock);
      setScanning(false);
    }, 1400);
  };

  const close = () => {
    setPreview(null);
    setItems([]);
    setEditing(false);
    onClose();
  };

  const updateItem = (i: number, v: string) => {
    const next = [...items];
    next[i] = v;
    setItems(next);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3>Envoyer mon ordonnance</h3>
          <button
            onClick={close}
            className="p-1.5 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!preview ? (
            <label className="block border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleFile(e.target.files[0])
                }
              />
              <div
                className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: "#EFF6FF" }}
              >
                <Camera className="w-6 h-6" style={{ color: "#2563EB" }} />
              </div>
              <p className="text-gray-700">Prenez une photo ou importez</p>
              <p className="text-sm text-gray-500 mt-1">
                PNG / JPG · OCR automatique
              </p>
              <div
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-white text-sm"
                style={{ backgroundColor: "#3B82F6" }}
              >
                <Upload className="w-4 h-4" />
                Sélectionner un fichier
              </div>
            </label>
          ) : (
            <>
              <div className="rounded-2xl overflow-hidden border border-gray-200 relative">
                <img
                  src={preview}
                  alt="Ordonnance"
                  className="w-full max-h-64 object-cover"
                />
                {scanning && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white px-4 py-2 rounded-xl text-sm">
                      Analyse OCR en cours...
                    </div>
                  </div>
                )}
              </div>

              {!scanning && items.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Médicaments détectés
                    </span>
                    <button
                      onClick={() => setEditing(!editing)}
                      className="flex items-center gap-1 text-sm"
                      style={{ color: "#2563EB" }}
                    >
                      <Edit3 className="w-4 h-4" />
                      {editing ? "Terminer" : "Corriger"}
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {items.map((it, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2"
                      >
                        <Check
                          className="w-4 h-4 shrink-0"
                          style={{ color: "#10B981" }}
                        />
                        {editing ? (
                          <input
                            value={it}
                            onChange={(e) => updateItem(i, e.target.value)}
                            className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-blue-400"
                          />
                        ) : (
                          <span className="flex-1 text-sm">{it}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => onConfirm(items)}
                disabled={scanning || items.length === 0}
                className="w-full py-3 rounded-xl text-white disabled:opacity-50"
                style={{ backgroundColor: "#2563EB" }}
              >
                Chercher dans les pharmacies
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
