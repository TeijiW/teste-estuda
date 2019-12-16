const getUpdatedList = (item, list) => {
	try {
		if (item.id) item.id = Number(item.id)
		const filteredList = list.filter(el => {
			if (item.id) {
				el.id = Number(el.id)
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
