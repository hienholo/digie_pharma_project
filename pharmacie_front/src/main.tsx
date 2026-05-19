
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import "leaflet/dist/leaflet.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
  