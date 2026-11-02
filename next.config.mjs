/** @type {import('next').NextConfig} */
const nextConfig = {
  // Respaldo de subida de archivos desde el panel (Vercel acepta hasta ~4.5 MB)
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  // inviteme.mx/pagos lleva directo a la sección de pagos de la portada
  async redirects() {
    return [
      // Todo lo que se abra en la dirección vieja de Vercel se manda a inviteme.mx,
      // con la misma ruta (los links que ya se compartieron siguen funcionando).
      {
        source: "/:ruta*",
        has: [{ type: "host", value: "inviteme-pi.vercel.app" }],
        destination: "https://inviteme.mx/:ruta*",
        permanent: true,
      },
      { source: "/pagos", destination: "/#pagos", permanent: false },
    ];
  },
  async rewrites() {
    return {
      // La portada (inviteme.mx/) es la página estática public/inicio.html
      beforeFiles: [{ source: "/", destination: "/inicio.html" }],
    };
  },
};

export default nextConfig;
