import axios from "axios"
import config from "./config.json"

const api = () => {
	axios.defaults.baseURL = config.BASE_URL_API
	const get = async data => {
		const { dataGroup } = data
		const id = data.id
		if (dataGroup && dataGroup !== "") {
			try {
				if (id && id !== "") {
					const response = await axios.get("/" + dataGroup, {
						data: { id },
						headers: { Authorization: "***" }
					})
					return response.data ? response.data : []
				} else {
					const response = await axios.get("/" + dataGroup)
					return response.data ? response.data : []
				}
			} catch (error) {
				throw error
			}
		}
	}

	const save = async data => {
		const { dataGroup } = data
		delete data.dataGroup
		if (dataGroup && dataGroup !== "") {
			try {
				console.log(data)
				if (data.id && data.id !== "") {
					data.id = Number(data.id)
					const response = await axios.put("/" + dataGroup, data)
					return response.data
				}
				const response = await axios.post("/" + dataGroup, data)
				return response.data
			} catch (error) {
				throw error
			}
		}
	}

	const remove = async data => {
		const { dataGroup } = data
		const id = Number(data.id)
		delete data.dataGroup
		if (dataGroup && dataGroup !== "") {
			try {
				await axios.delete("/" + dataGroup, {
					data: { id },
					headers: { Authorization: "***" }
				})
			} catch (error) {
				throw error
			}
		}
	}

	const updateEscolas = () => {
		try {
			axios.post("/escolas/api")
		} catch (error) {
			throw error
		}
	}

	return { get, save, remove, updateEscolas }
}

export default api
