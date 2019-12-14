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

	const save = async (data, extraArray = []) => {
		const { dataGroup } = data
		delete data.dataGroup
		if (dataGroup && dataGroup !== "") {
			if (dataGroup === "turmas") {
				extraArray.map(item => {
					if (item.nome === data.id_escola) data.id_escola = item.id
					return item
				})
			}
			try {
				if (data.id && data.id !== "") {
					data.id = Number(data.id)
					const response = await axios.put("/" + dataGroup, data)
					return response.data
				}
				const response = await axios.post("/" + dataGroup, data)
				return response.data
			} catch (error) {
				console.log(error)
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

	const saveTurmasFromAluno = async (turmas, id_aluno) => {
		try {
			await axios.post("/alunos/turmas", {
				turmas,
				id_aluno
			})
		} catch (error) {
			throw error
		}
	}

	const getTurmasFromAlunos = async data => {
		try {
			const { id } = data
			const response = await axios.post("/alunos/turmas/get", { id })
			return response.data
		} catch (error) {
			throw error
		}
	}

	return {
		get,
		save,
		remove,
		updateEscolas,
		saveTurmasFromAluno,
		getTurmasFromAlunos
	}
}

export default api
