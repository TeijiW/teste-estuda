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

const server = api()

const headerProps = {
	icon: "users",
	title: "Turmas",
	subtitle: "Listagem dos Turmas"
}

const thList = [
	{
		id: "id",
		label: "ID",
		showSort: false
	},
	{
		id: "nivel",
		label: "Nível / Ensino",
		showSort: false
	},
	{
		id: "turno",
		label: "Turno",
		showSort: false
	},
	{
		id: "ano",
		label: "Ano",
		showSort: false
	},
	{
		id: "serie",
		label: "Série",
		showSort: false
	},
	{
		id: "id_escola",
		label: "Escola",
		showSort: false
	}
]

const initialState = {
	turma: {
		id: "",
		nivel: "Fundamental",
		turno: "Matutino",
		ano: "2019",
		serie: "",
		id_escola: ""
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
	escolasList: [],
	escolasObjectList: []
}

const fuseOptions = {
	threshold: 0.2,
	location: 0,
	distance: 100,
	maxPatternLength: 32,
	minMatchCharLength: 3,
	keys: ["nivel", "turno", "ano", "id_escola"]
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
			type: "Dropdown",
			label: "Nível/Ensino",
			name: "nivel",
			values: ["Fundamental", "Medio"]
		},
		{
			type: "Dropdown",
			label: "Turno",
			name: "turno",
			values: ["Matutino", "Vespertino", "Integral"]
		},
		{
			type: "NumberInput",
			name: "ano",
			label: "Ano"
		},
		{
			type: "NumberInput",
			name: "serie",
			label: "Série",
			min: 1,
			max: 9
		}
	]

	async componentWillMount() {
		try {
			const list = await server.get({ dataGroup: "turmas" })
			await this.getEscolas()
			// list.map(item => {
			// 	this.state.escolasObjectList.map(escola => {
			// 		if (item.id_escola === escola.id) item.id_escola = escola.nome
			// 	})
			// })
			this.escolasShowName(list)
			this.setState({ initialList: list })
			this.setState({ list })
			this.listSort("id")
			this.fieldList.push({
				type: "Dropdown",
				label: "Seleção de Escola",
				name: "id_escola",
				values: this.state.escolasList
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

	load = turma => {
		this.setState({ turma })
		this.setState({ showErrorTable: false })
		if (!this.state.showForm) this.setState({ errors: [], errorsTable: [] })
		if (!this.state.showForm) this.formToggle()
	}

	remove = async turma => {
		try {
			turma.dataGroup = "turmas"
			await server.remove(turma)
			const list = this.state.list.filter(element => element !== turma)
			this.setState({ list })
		} catch (error) {
			const { errorsTable } = this.state
			errorsTable.push({ title: error.message ? error.message : error })
			this.formToggle()
			this.setState({ errorsTable, showErrorTable: true })
		}
	}

	save = async () => {
		const { turma } = this.state
		if (this.state.errors.length < 1) {
			try {
				turma.dataGroup = "turmas"
				const response = await server.save(turma, this.state.escolasObjectList)
				const responseWithID = { ...response, ...turma }
				if (response.id) turma.id = response.id
				const list = getUpdatedList(
					turma.id ? turma : responseWithID,
					this.state.list
				)
				this.setState({
					list,
					turma: initialState.turma,
					saveButtonText: initialState.saveButtonText
				})
				this.escolasShowName(list)
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
		const turma = await updateFieldUtil(event, this.state.turma)
		this.setState({ turma })
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

	getEscolas = async () => {
		const escolasList = await server.get({ dataGroup: "escolas" })
		const escolasListArray = []
		escolasList.map(item => {
			escolasListArray.push(item.nome)
		})
		this.setState({
			escolasObjectList: escolasList,
			escolasList: escolasListArray
		})
	}

	escolasShowName = list => {
		list.map(item => {
			this.state.escolasObjectList.map(escola => {
				if (item.id_escola === escola.id) item.id_escola = escola.nome
			})
		})
		return list
	}

	clear = () => {
		const { turma } = this.state
		this.setState({ turma })
		this.setState({ turma: initialState.turma })
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
					addButtonText={"Registrar Turma"}
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
					fieldState={this.state.turma}
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
