/** @type {import('next').NextConfig} */
const nextConfig = {
  // Respaldo de subida de archivos desde el panel (Vercel acepta hasta ~4.5 MB)
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  async rewrites() {
    return {
      // La portada (inviteme.mx/) es la página estática public/inicio.html
      beforeFiles: [{ source: "/", destination: "/inicio.html" }],
    };
  },
};

export default nextConfig;
