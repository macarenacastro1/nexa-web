/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
// Vista previa: rutas relativas para poder servirla desde cualquier dirección.
const assetPrefix = process.env.PREVIEW_RELATIVE ? "." : undefined;
export default {
  output: "export",
  basePath,
  assetPrefix,
  images: { unoptimized: true },
  trailingSlash: true,
};
