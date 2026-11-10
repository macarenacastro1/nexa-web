// Línea real de Criscuolo Coffee (textos tomados del packaging). Las coordenadas de cada lote son ilustrativas.
export type Product = {
  n: string; name: string; notes: string[]; notesText: string; body: string;
  lat: string; lon: string; latN: number; lonN: number;
  bg: string; ink: string; label: string; labelInk: string;
};

export const ORIGIN = { farm: "Fazenda Granno", place: "Campos Altos - MG" };

export const PRODUCTS: Product[] = [
  {
    n: "01", name: "Bourbon Vermelho", notes: ["Chocolate ao leite", "Caramelo", "Castanhas"],
    notesText: "Chocolate ao leite, caramelo e castanhas.", body: "Corpo cremoso, doçura marcante e acidez equilibrada.",
    lat: "19°41′35″ S", lon: "46°10′17″ W", latN: -19.693, lonN: -46.171,
    bg: "#4b2533", ink: "#f2f0e4", label: "#f2f1e6", labelInk: "#2e2328",
  },
  {
    n: "02", name: "Arara", notes: ["Caramelo", "Mel", "Frutas cítricas"],
    notesText: "Caramelo, mel e frutas cítricas.", body: "Corpo aveludado, doçura intensa e acidez vibrante.",
    lat: "19°38′52″ S", lon: "46°13′04″ W", latN: -19.648, lonN: -46.218,
    bg: "#1f3832", ink: "#f2f0e4", label: "#f2f1e6", labelInk: "#2e2328",
  },
  {
    n: "03", name: "Catuaí", notes: ["Chocolate amargo", "Cacau", "Açúcar mascavo"],
    notesText: "Chocolate amargo, cacau e açúcar mascavo.", body: "Corpo médio, doçura equilibrada e acidez suave.",
    lat: "19°44′10″ S", lon: "46°08′31″ W", latN: -19.736, lonN: -46.142,
    bg: "#aab384", ink: "#4a2232", label: "#f3f2e8", labelInk: "#2e2328",
  },
  {
    n: "04", name: "Topázio", notes: ["Caramelo", "Mel", "Amêndoas"],
    notesText: "Caramelo, mel e amêndoas.", body: "Corpo sedoso, doçura intensa e acidez delicada.",
    lat: "19°36′27″ S", lon: "46°15′48″ W", latN: -19.608, lonN: -46.263,
    bg: "#cfccc3", ink: "#4a2232", label: "#f3f2e8", labelInk: "#2e2328",
  },
];
