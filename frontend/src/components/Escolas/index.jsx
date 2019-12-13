import React, { Component } from "react"
import Form from "../CommonComponents/Form"
import Table from "../CommonComponents/Table"
import TableOptions from "../CommonComponents/TableOptions"
import ErrorTable from "../CommonComponents/ErrorTable"
import Main from "../CommonComponents/Templates/Main"
import api from "../../config/api"
import updateFieldUtil from "../../utils/updateField"
import exists from "../../utils/exists"
import getUpdatedList from "../../utils/getUpdatedList"

const server = api()

const headerProps = {
	icon: "users",
	title: "Escolas",
	subtitle: "Listagem dos Escolas"
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
		id: "endereco",
		label: "Endereço",
		showSort: false
	},
	{
		id: "data",
		label: "Data de última atualização",
		showSort: false
	},
	{
		id: "situacao",
		label: "Situação",
		showSort: false
	},
	{
		id: "id_escola",
		label: "Escola",
		showSort: false
	}
]

const initialState = {
	escola: {
		id: "",
		nome: "",
		endereco: "",
		data: "",
		situacao: ""
	},
	initialList: [],
	list: [],
	listOrder: "increasing",
	showErrorTable: false,
	showTableOptions: true,
	showTable: true,
	showForm: false,
	errorsTable: [],
	errors: []
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
			label: "Nome",
			name: "nome"
		},
		{
			type: "TextInput",
			label: "Endereço",
			name: "endereco"
		},
		{
			type: "Dropdown",
			name: "situacao",
			label: "Situação",
			values: [
				"Em atividade",
				"Paralisada",
				"Extinta",
				"Extinta no ano anterior"
			]
		}
	]

	async componentWillMount() {
		try {
			const list = await server.get({ dataGroup: "escolas" })
			this.setState({ initialList: list })
			this.setState({ list })
			this.listSort("id")
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

	load = escola => {
		this.setState({ escola })
		this.setState({ showErrorTable: false })
		if (!this.state.showForm) this.setState({ errors: [], errorsTable: [] })
		if (!this.state.showForm) this.formToggle()
	}

	remove = async escola => {
		try {
			escola.dataGroup = "escolas"
			await server.remove(escola)
			const list = this.state.list.filter(element => element !== escola)
			this.setState({ list })
		} catch (error) {
			const { errorsTable } = this.state
			errorsTable.push({ title: error.message ? error.message : error })
			this.formToggle()
			this.setState({ errorsTable, showErrorTable: true })
		}
	}

	save = async () => {
		const { escola } = this.state
		if (this.state.errors.length < 1) {
			try {
				escola.dataGroup = "escolas"
				const response = await server.save(escola)
				const responseWithID = { ...response, ...escola }
				if (response.id) escola.id = response.id
				const list = getUpdatedList(
					escola.id ? escola : responseWithID,
					this.state.list
				)
				this.setState({
					list,
					escola: initialState.escola,
					saveButtonText: initialState.saveButtonText
				})
				console.log(this.state.list)
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

	updateEscolasAPI = () => {
		server.updateEscolas()
		window.location.reload()
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

	handleSubmit = async event => {
		event.preventDefault()
		this.save()
	}

	updateField = async event => {
		console.clear()
		console.log(event.target.name)
		console.log(event.target.value)
		const escola = await updateFieldUtil(event, this.state.escola)
		this.setState({ escola })
	}

	clear = () => {
		const { escola } = this.state
		this.setState({ escola })
		this.setState({ escola: initialState.escola })
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
					showSearchBar={false}
					addButtonText={"Registrar Turma"}
					updateButtonText={"Atualizar lista de escolas - API"}
					update={this.updateEscolasAPI}
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
					fieldState={this.state.escola}
					fieldList={this.fieldList}
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
