// Preset
import { preset as Preset } from '../../presets/default'; // Utilities

import { consoleWarn } from '../../util/console';
import { mergeDeep } from '../../util/helpers';
import { Service } from '../service';
export class Presets extends Service {
  constructor(parentPreset, parent) {
    super(); // The default preset

    const defaultPreset = mergeDeep({}, Preset); // The user provided preset

    const {
      userPreset
    } = parent; // The user provided global preset

    const {
      preset: globalPreset = {},
      ...preset
    } = userPreset;

    if (globalPreset.preset != null) {
      consoleWarn('Global presets do not support the **preset** option, it can be safely omitted');
    }

    parent.preset = mergeDeep(mergeDeep(defaultPreset, globalPreset), preset);
  }

}
Presets.property = 'presets';
//# sourceMappingURL=index.js.map