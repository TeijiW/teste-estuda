const getUpdatedList = (item, list) => {
	try {
		const filteredList = list.filter(el => {
			if (item.id) {
				return el.id !== item.id
			} else {
				return el.id
			}
		})
		filteredList.unshift(item)
		return filteredList
	} catch (error) {
		throw error
	}
}

export default getUpdatedList
