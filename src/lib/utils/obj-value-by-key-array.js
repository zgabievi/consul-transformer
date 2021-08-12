export const objValueByKeyArray = (obj, keys) => {
    return keys.reduce((acc, key) => {
        return acc !== undefined ? acc[key] : undefined;
    }, obj);
};