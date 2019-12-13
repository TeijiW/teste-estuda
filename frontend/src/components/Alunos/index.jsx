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
		email: "",
		telefone: "",
		nascimento: "",
		genero: "Masculino"
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
			label: "Email",
			name: "email"
		},
		{
			type: "TextInput",
			label: "Telefone",
			name: "telefone"
		},
		{
			type: "Dropdown",
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

	load = aluno => {
		this.setState({ aluno })
		this.setState({ showErrorTable: false })
		if (!this.state.showForm) this.setState({ errors: [], errorsTable: [] })
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
					saveButtonText: initialState.saveButtonText
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
		const aluno = await updateFieldUtil(event, this.state.aluno)
		this.setState({ aluno })
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
					showSearchBar={false}
					addButtonText={"Registrar Aluno"}
					updateButtonText={"Atualizar"}
					update={() => {
						window.location.reload()
					}}
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
