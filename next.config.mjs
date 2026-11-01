/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      // La portada (inviteme.mx/) es la página estática public/inicio.html
      beforeFiles: [{ source: "/", destination: "/inicio.html" }],
    };
  },
};

export default nextConfig;
