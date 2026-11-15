import {fileURLToPath} from 'node:url';
const at = path => fileURLToPath(new URL(path, import.meta.url));
// 共用项目内已安装的依赖，构建后的成果不再依赖这些目录。
export default {
  base: './',
  cacheDir: at('../../03_工作文件/缓存/react-v010-vite'),
  resolve: {alias: [
    {find: /^react-dom(\/.*)?$/, replacement: at('../ReactBits试验区/node_modules/react-dom')+'$1'},
    {find: /^react(\/.*)?$/, replacement: at('../ReactBits试验区/node_modules/react')+'$1'},
    {find: /^gsap(\/.*)?$/, replacement: at('../网页动画工具/node_modules/gsap')+'$1'},
    {find: /^lenis(\/.*)?$/, replacement: at('../网页动画工具/node_modules/lenis')+'$1'}
  ]},
  esbuild: {jsx:'automatic'},
  build: {outDir:at('../../04_交付成果/纹境React_v010'), emptyOutDir:true, target:'es2020'}
};
