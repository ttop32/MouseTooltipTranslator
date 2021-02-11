import icons from './fa';
export function convertToComponentDeclarations(component, iconSet) {
  const result = {};

  for (const key in iconSet) {
    result[key] = {
      component,
      props: {
        icon: iconSet[key].split(' fa-')
      }
    };
  }

  return result;
}
export default convertToComponentDeclarations('font-awesome-icon', icons);
//# sourceMappingURL=fa-svg.js.map