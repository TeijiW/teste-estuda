import React, { Component } from "react"
import { isEmpty } from "lodash"
import Fuse from "fuse.js"
import Form from "../CommonComponents/Form"
import Table from "../CommonComponents/Table"
import TableOptions from "../CommonComponents/TableOptions"
import ErrorTable from "../CommonComponents/ErrorTable"
import Main from "../CommonComponents/Templates/Main"
import api from "../../config/api"
import updateFieldUtil from "../../utils/updateField"
import exists from "../../utils/exists"
import getUpdatedList from "../../utils/getUpdatedList"
import notEmptyValidation from "../../utils/notEmptyValidation"

const server = api()

const headerProps = {
	icon: "users",
	title: "Alunos",
	subtitle: "Listagem dos Alunos"
}

const thList = [
	{
		id: "id",
		label: "ID",
		showSort: false
	},
	{
		id: "nome",
		label: "Nome",
		showSort: false
	},
	{
		id: "telefone",
		label: "Telefone",
		showSort: false
	},
	{
		id: "email",
		label: "Email",
		showSort: false
	},
	{
		id: "nascimento",
		label: "Data de Nascimento",
		showSort: false
	},
	{
		id: "genero",
		label: "Gênero",
		showSort: false
	}
]

const initialState = {
	aluno: {
		id: "",
		nome: "",
		telefone: "",
		email: "",
		nascimento: "",
		genero: "Masculino"
	},
	initialList: [],
	list: [],
	listOrder: "increasing",
	listSortKey: "id",
	search: {
		query: "",
		list: []
	},
	showErrorTable: false,
	showTableOptions: true,
	showTable: true,
	showForm: false,
	errorsTable: [],
	errors: [],
	turmasList: [],
	initialTurmasList: [],
	selectedTurmasList: [],
	lastInsertedId: ""
}

const fuseOptions = {
	threshold: 0.2,
	location: 0,
	distance: 100,
	maxPatternLength: 32,
	minMatchCharLength: 3,
	keys: ["nome", "email", "nascimento", "genero"]
}

export default class User extends Component {
	state = { ...initialState }

	fieldList = [
		{
			type: "TextInput",
			label: "Código",
			name: "id"
		},
		{
			type: "TextInput",
			label: "Nome*",
			name: "nome"
		},
		{
			type: "TextInput",
			label: "Email*",
			name: "email"
		},
		{
			type: "TextInput",
			label: "Telefone",
			name: "telefone"
		},
		{
			type: "Dropdown",
			label: "Gênero",
			values: ["Masculino", "Feminino"],
			name: "genero"
		},
		{
			type: "DateInput",
			label: "Data de Nascimento",
			name: "nascimento"
		}
	]

	async componentWillMount() {
		try {
			const list = await server.get({ dataGroup: "alunos" })
			this.setState({ initialList: list })
			this.setState({ list })
			this.listSort("id")
			await this.getTurmas()
			this.fieldList.push({
				type: "DinamicDropdown",
				label: "Seleção de turmas",
				options: this.state.turmasList,
				onRemove: this.onRemoveDinamicDropdown,
				onSelect: this.onSelectDinamicDropdown
			})
		} catch (error) {
			let errorTitle = { title: "Undefined error, please contact the admin" }
			if (error.status && error.statusText) {
				const errorString = `${error.status}: ${error.statusText}`
				errorTitle = { title: errorString }
			}
			const { errorsTable } = this.state
			if (!exists(errorTitle, errorsTable, "title"))
				errorsTable.push(errorTitle)
			if (this.state.showForm) this.formToggle()
			await this.setState({ errorsTable, showErrorTable: true })
		}
	}

	load = async aluno => {
		this.setState({ showErrorTable: false })
		if (!this.state.showForm) this.setState({ errors: [], errorsTable: [] })
		const selectedTurmasList = await server.getTurmasFromAlunos(aluno)
		await this.setState({ selectedTurmasList })
		this.setState({ aluno })
		if (!this.state.showForm) this.formToggle()
	}

	remove = async aluno => {
		try {
			aluno.dataGroup = "alunos"
			await server.remove(aluno)
			const list = this.state.list.filter(element => element !== aluno)
			this.setState({ list })
		} catch (error) {
			const { errorsTable } = this.state
			errorsTable.push({ title: error.message ? error.message : error })
			this.formToggle()
			this.setState({ errorsTable, showErrorTable: true })
		}
	}

	save = async () => {
		const { aluno } = this.state
		if (this.state.errors.length < 1) {
			try {
				aluno.dataGroup = "alunos"
				const response = await server.save(aluno)
				const responseWithID = { ...response, ...aluno }
				if (response.id) aluno.id = response.id
				const list = getUpdatedList(
					aluno.id ? aluno : responseWithID,
					this.state.list
				)
				this.setState({
					list,
					aluno: initialState.aluno,
					saveButtonText: initialState.saveButtonText,
					lastInsertedId: aluno.id
				})
				await this.setState({ errors: [] })
				this.formToggle()
				this.setState({ fieldList: initialState.fieldList })
			} catch (error) {
				const { errorsTable } = this.state
				errorsTable.push({ title: error.message ? error.message : error })
				this.formToggle()
				return await this.setState({ errorsTable, showErrorTable: true })
			}
		}
	}

	onSelectDinamicDropdown = (optionsList, selectedItem) => {
		this.setState({ selectedTurmasList: optionsList })
	}

	onRemoveDinamicDropdown = (optionsList, removedItem) => {
		this.setState({ selectedTurmasList: optionsList })
	}

	getTurmas = async () => {
		const turmasList = await server.get({ dataGroup: "turmas" })
		turmasList.map(item => {
			item.nome = `${item.ano ? item.ano : "?"} - ${
				item.turno ? item.turno : "?"
			} - ${item.nivel ? item.nivel : "?"} - ${item.serie ? item.serie : "?"}`
			return item
		})
		this.setState({ initialTurmasList: turmasList, turmasList })
	}

	listOrderToggle = async state => {
		if (state.listOrder === "increasing")
			await this.setState({ listOrder: "decreasing" })
		if (state.listOrder === "decreasing")
			await this.setState({ listOrder: "increasing" })
	}

	thListToggle = field => {
		thList.forEach(item => {
			if (item.id === field) {
				item.showSort = true
			} else {
				item.showSort = false
			}
		})
	}

	formToggle = () => {
		this.setState({
			showForm: !this.state.showForm,
			showTable: !this.state.showTable,
			showTableOptions: !this.state.showTableOptions,
			errors: []
		})
	}

	listSort = async field => {
		if (this.state.listSortKey === field) {
			await this.listOrderToggle(this.state)
			this.thListToggle(field)
		} else {
			this.setState({ listSortKey: field })
			this.thListToggle(field)
		}
		let list = undefined
		const { listOrder } = this.state
		list = this.state.list.sort((a, b) => {
			a[field] = Number(a[field]) ? Number(a[field]) : a[field]
			b[field] = Number(b[field]) ? Number(b[field]) : b[field]
			if (listOrder === "increasing") {
				if (a[field] > b[field]) return 1
				if (a[field] < b[field]) return -1
			}
			if (listOrder === "decreasing") {
				if (a[field] > b[field]) return -1
				if (a[field] < b[field]) return 1
			}
			return 0
		})
		this.setState({ list })
	}

	formValidation = async () => {
		const { aluno, errors } = this.state
		const { isValid, formErrors } = await notEmptyValidation(aluno, errors, [
			"nome",
			"email"
		])
		if (!isValid) {
			this.setState({ errors: formErrors })
			return false
		}
		if (isValid) {
			this.setState({ errors: [] })
			return true
		}
	}

	handleSubmit = async event => {
		event.preventDefault()
		const valid = await this.formValidation()
		if (valid) {
			await this.save()
			await server.saveTurmasFromAluno(
				this.state.selectedTurmasList,
				this.state.aluno.id ? this.state.aluno.id : this.state.lastInsertedId
			)
		}
	}

	updateField = async event => {
		const aluno = await updateFieldUtil(event, this.state.aluno)
		this.setState({ aluno })
	}

	updateSearchQuery = async event => {
		const search = await updateFieldUtil(event, this.state.search)
		this.setState({ search })
		this.listSearch()
	}

	listSearch = () => {
		if (isEmpty(this.state.search.query)) {
			this.setState({ list: this.state.initialList })
		} else {
			const term = this.state.search.query
			const fuse = new Fuse(this.state.initialList, fuseOptions)
			const list = fuse.search(term)
			this.setState({ list })
		}
	}

	clear = () => {
		const { aluno } = this.state
		this.setState({ aluno })
		this.setState({ aluno: initialState.aluno })
		this.formToggle()
		this.setState({ saveButtonText: initialState.saveButtonText })
		this.setState({ fieldList: initialState.fieldList })
	}

	renderTable = () => {
		if (this.state.showTable) {
			return (
				<Table
					thList={thList}
					listOrder={this.state.listOrder}
					onClick={this.listSort}
					list={this.state.list}
					remove={this.remove}
					load={this.load}
				/>
			)
		}
	}

	renderTableOptions = () => {
		if (this.state.showTableOptions) {
			return (
				<TableOptions
					formToggle={this.formToggle}
					showAddButton={true}
					showUpdateButton={true}
					showFilterButton={false}
					showPrintButton={false}
					addButtonText={"Registrar Aluno"}
					updateButtonText={"Atualizar"}
					update={() => {
						window.location.reload()
					}}
					searchQuery={this.state.searchQuery}
					searchOnChange={this.updateSearchQuery}
					showSearchBar={true}
				/>
			)
		}
	}

	renderForm = () => {
		if (this.state.showForm) {
			return (
				<Form
					errors={this.state.errors}
					updateField={this.updateField}
					handleSubmit={this.handleSubmit}
					clear={this.clear}
					saveButtonText="Salvar"
					fieldState={this.state.aluno}
					fieldList={this.fieldList}
					selectedTurmasList={this.state.selectedTurmasList}
				/>
			)
		}
	}

	renderErrorTable = () => {
		if (this.state.showErrorTable) {
			const { errorsTable } = this.state
			return <ErrorTable errorsTable={errorsTable} />
		}
	}

	render() {
		return (
			<Main {...headerProps}>
				{this.renderErrorTable()}
				{this.renderTableOptions()}
				{this.renderTable()}
				{this.renderForm()}
			</Main>
		)
	}
}
