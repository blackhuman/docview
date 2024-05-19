import CopyPlugin from "copy-webpack-plugin"

/** @type {import('next').NextConfig} */
const nextConfig = {
  // webpack: (config) => {
  //   // append the CopyPlugin to copy the file to your public dir
  //   config.plugins.push(
  //     new CopyPlugin({
  //       patterns: [
  //         { from: "node_modules/pdfjs-dist/build/pdf.worker.mjs", to: "public/" },
  //       ],
  //     }),
  //   )

  //   // Important: return the modified config
  //   return config
  // }
};

export default nextConfig;
