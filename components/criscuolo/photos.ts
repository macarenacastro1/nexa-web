// Fotografías de la web. Cuando llegue cada foto real, se copia a /public/criscuolo/
// y se pone su ruta acá (p. ej. cultivo: "/criscuolo/cultivo.jpg"). Mientras sea null, se ve un marcador.
export const PHOTOS: Record<string, string | null> = {
  campo: null,        // vista aérea de las hileras (escena Origem)
  cultivo: null,      // planta de café, hojas y frutos verdes
  colheita: null,     // manos cosechando cerezas rojas
  selecao: null,      // granos secándose / selección en terreiro
  torra: null,        // granos saliendo del tostador
  xicara: null,       // taza servida, vista cenital
  sensorial: null,    // macro de café preparado (crema / textura)
  marcaCampo: null,   // paisaje de la fazenda
  marcaMaos: null,    // manos trabajando con granos
  marcaProcesso: null,// detalle del proceso
  marcaPack: null,    // packaging real de la marca
  final: null,        // taza sobre piedra o madera, luz natural
};
