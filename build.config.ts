import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  externals: [
    'vite',
    'fs-extra',
    'csstype',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
