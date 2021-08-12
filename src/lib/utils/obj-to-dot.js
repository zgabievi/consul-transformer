export const objToDot = (obj) => {
	const res = {};
    
	(function recurse(obj, current) {
		for (var key in obj) {
			const value = obj[key];
			const newKey = current ? current + '.' + key : key;

			if (value && typeof value === 'object') {
				recurse(value, newKey);
			} else {
				res[newKey] = value;
			}
		}
	})(obj);

	return res;
};
