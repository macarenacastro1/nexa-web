// Productos CONCEPTUALES para el portfolio (no son productos oficiales de Criscuolo Coffee).
export type Product = {
  n: string; name: string; variety: string; process: string; altitude: string; notes: string[]; roast: string;
  lat: string; lon: string; latN: number; lonN: number;
  bg: string; ink: string; accent: string; shape: string; label: string;
};

export const PRODUCTS: Product[] = [
  {
    n: "01", name: "Origem", variety: "Catuaí Vermelho", process: "Natural", altitude: "1.080 m",
    notes: ["Chocolate", "Caramelo", "Castanhas"], roast: "Média",
    lat: "19°41′35″ S", lon: "46°10′17″ W", latN: -19.693, lonN: -46.171,
    bg: "#501f26", ink: "#f4efe5", accent: "#f4efe5", shape: "#6a2c35", label: "#f4efe5",
  },
  {
    n: "02", name: "Reserva", variety: "Bourbon Amarelo", process: "Honey", altitude: "1.120 m",
    notes: ["Mel", "Frutas maduras", "Flores"], roast: "Clara",
    lat: "19°38′52″ S", lon: "46°13′04″ W", latN: -19.648, lonN: -46.218,
    bg: "#ece4d3", ink: "#555c3c", accent: "#555c3c", shape: "#dcd3bf", label: "#f7f3ea",
  },
  {
    n: "03", name: "Equilíbrio", variety: "Catuaí e Mundo Novo", process: "Natural", altitude: "1.160 m",
    notes: ["Cacau", "Frutas secas", "Açúcar mascavo"], roast: "Média",
    lat: "19°44′10″ S", lon: "46°08′31″ W", latN: -19.736, lonN: -46.142,
    bg: "#b45f3a", ink: "#f4efe5", accent: "#f4efe5", shape: "#9c4f2f", label: "#f4efe5",
  },
  {
    n: "04", name: "Experiência", variety: "Geisha", process: "Lavado", altitude: "1.220 m",
    notes: ["Jasmim", "Frutas cítricas", "Chá branco"], roast: "Clara",
    lat: "19°36′27″ S", lon: "46°15′48″ W", latN: -19.608, lonN: -46.263,
    bg: "#263c2c", ink: "#f4efe5", accent: "#c9b27a", shape: "#30493a", label: "#f4efe5",
  },
];
