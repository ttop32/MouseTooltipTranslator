// Extensions
import { Service } from '../service'; // Utilities

import { mergeDeep } from '../../util/helpers'; // Presets

import presets from './presets';
export class Icons extends Service {
  constructor(preset) {
    super();
    const {
      iconfont,
      values,
      component
    } = preset[Icons.property];
    this.component = component;
    this.iconfont = iconfont;
    this.values = mergeDeep(presets[iconfont], values);
  }

}
Icons.property = 'icons';
//# sourceMappingURL=index.js.map