const emptyKeys = (state, essential) => {
	const stateKeys = Object.keys(state)
	return stateKeys.filter(
		key => essential.includes(key) && !state[key] && state[key] === ""
	)
}

const formValidation = async (state, errors, essential) => {
	const emptyKeysArray = emptyKeys(state, essential)
	if (emptyKeysArray.length >= 1) {
		const fields = [...emptyKeysArray]
		const error = {
			title: "Todos os campos marcados devem ser preenchidos",
			fields
		}
		errors.push(error)
		return { isValid: false, formErrors: errors }
	} else {
		return { isValid: true }
	}
}

export default formValidation
