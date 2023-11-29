import {
  defineConfig,
  presetWind,
  presetIcons,
  presetAttributify,
  transformerVariantGroup,
  transformerDirectives
} from 'unocss'
import presetTagify from '@unocss/preset-tagify'
import { presetScrollbar } from 'unocss-preset-scrollbar'
import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx'

export default defineConfig({
  presets: [
    presetWind(),
    presetIcons(),
    presetAttributify(),
    presetScrollbar(),
    presetTagify({ prefix: 'un-' })
  ],
  transformers: [transformerVariantGroup(), transformerDirectives(), transformerAttributifyJsx()]
})
