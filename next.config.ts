import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    // バイナリファイルをWebpackの処理から除外
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      'onnxruntime-node$': false,
    };

    // .nodeファイルの処理を無視
    config.module = {
      ...config.module,
      exprContextCritical: false,
      noParse: [/onnxruntime-node/],
    };

    return config;
  },
};

export default nextConfig;
