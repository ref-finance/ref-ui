export const uniqueArray = (array, objectKey) => {
  const map = {};
  for (const element of array) {
    map[element.id] = element;
  }
  return Object.values(map);
};
