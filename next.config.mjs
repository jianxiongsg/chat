import webpack from "webpack";

const mode = process.env.BUILD_MODE ?? "standalone";
console.log("build mode", mode);

// const disableChunk = !!process.env.DISABLE_CHUNK || mode === "export";
// console.log("build with chunk: ", !disableChunk);


/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // if (disableChunk) {
    //   config.plugins.push(
    //     new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
    //   );
    // }

    config.resolve.fallback = {
      child_process: false,
    };

    return config;
  },
  output: mode,
  images: {
    unoptimized: mode === "export",
  },
  experimental: {
    forceSwcTransforms: true,
  },
  // assetPrefix: process.env.ASSET_PREFIX || './', // 确保在构建时设置环境变量
  // basePath: './'
  // 国际化配置
  // i18n: {
  //   locales: ['en', 'fr', 'es'], // 定义语言环境
  //   defaultLocale: 'en', // 设置默认语言环境
  // },
  // 重定向配置
  // redirects: async () => {
  //   return [
  //     {
  //       source: '/old-path',
  //       destination: '/new-path',
  //       permanent: true,
  //     },
  //   ];
  // },
  //  // 重写配置
  //  rewrites: async () => {
  //   return [
  //     {
  //       source: '/some-path',
  //       destination: '/another-path',
  //     },
  //   ];
  // },
  // 静态导出配置
  // 如果你计划使用 `next export`，下面的选项将有用
  // 注意：这些选项仅在使用 `next export` 时相关
  // exportPathMap: async (defaultPathMap) => {
  //   return {
  //     '/': { page: '/' },
  //     '/about': { page: '/about' },
  //     // 添加更多路径...
  //   };
  // },
};

const CorsHeaders = [
  { key: "Access-Control-Allow-Credentials", value: "true" },
  { key: "Access-Control-Allow-Origin", value: "*" },
  {
    key: "Access-Control-Allow-Methods",
    value: "*",
  },
  {
    key: "Access-Control-Allow-Headers",
    value: "*",
  },
  {
    key: "Access-Control-Max-Age",
    value: "86400",
  },
];

if (mode !== "export") {
  nextConfig.headers = async () => {
    return [
      {
        source: "/api/:path*",
        headers: CorsHeaders,
      },
    ];
  };

  nextConfig.rewrites = async () => {
    const ret = [
      // {
      //   source: "/api/proxy/:path*",
      //   destination: "https://api.openai.com/:path*",
      // },
      // {
      //   source: "/google-fonts/:path*",
      //   destination: "https://fonts.googleapis.com/:path*",
      // },
      // {
      //   source: "/sharegpt",
      //   destination: "https://sharegpt.com/api/conversations",
      // },
    ];

    return {
      beforeFiles: ret,
    };
  };
}

export default nextConfig;
