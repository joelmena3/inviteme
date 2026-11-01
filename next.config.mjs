/** @type {import('next').NextConfig} */
const nextConfig = {
  // Respaldo de subida de archivos desde el panel (Vercel acepta hasta ~4.5 MB)
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  // inviteme.mx/pagos lleva directo a la sección de pagos de la portada
  async redirects() {
    return [{ source: "/pagos", destination: "/#pagos", permanent: false }];
  },
  async rewrites() {
    return {
      // La portada (inviteme.mx/) es la página estática public/inicio.html
      beforeFiles: [{ source: "/", destination: "/inicio.html" }],
    };
  },
};

export default nextConfig;
