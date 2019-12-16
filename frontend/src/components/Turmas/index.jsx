import React, { Component } from "react"
import { isEmpty } from "lodash"
import Fuse from "fuse.js"
import Form from "../CommonComponents/Form"
import Table from "../CommonComponents/Table"
import TableOptions from "../CommonComponents/TableOptions"
import ErrorTable from "../CommonComponents/ErrorTable"
import Detail from "../CommonComponents/Details"
import Main from "../CommonComponents/Templates/Main"
import api from "../../config/api"
import updateFieldUtil from "../../utils/updateField"
import exists from "../../utils/exists"
import getUpdatedList from "../../utils/getUpdatedList"

const server = api()

// Configurações para amostragem na página
const headerProps = {
	icon: "book",
	title: "Turmas",
	subtitle: "Listagem dos Turmas"
}

// Lista de cabeçalhos da tabela
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
	// Objeto para os detalhes
	turmaDetail: {
		"Código de Identificação": "",
		Nível: "Fundamental",
		Turno: "Matutino",
		Ano: "2019",
		Série: "",
		Escola: ""
	},
	initialList: [],
	list: [],
	listOrder: "increasing",
	listSortKey: "id",
	search: {
		query: "",
		list: []
	},
	// Estados de renderização
	showErrorTable: false,
	showTableOptions: true,
	showTable: true,
	showForm: false,
	showDetail: false,
	// Estados de erro
	errorsTable: [],
	errors: [],
	// Listas relacionadas as escolas
	escolasList: [],
	escolasObjectList: []
}

// Configurações para o Fuse [fusejs.io]
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

	// Lista e configurações dos campos do formulário
	fieldList = [
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
			let errorTitle = {
				title: "Undefined error, please contact the admin"
			}
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
				const response = await server.save(
					turma,
					this.state.escolasObjectList
				)
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
				errorsTable.push({
					title: error.message ? error.message : error
				})
				this.formToggle()
				return await this.setState({
					errorsTable,
					showErrorTable: true
				})
			}
		}
	}

	// Troca de ordem na tabela
	listOrderToggle = async state => {
		if (state.listOrder === "increasing")
			await this.setState({ listOrder: "decreasing" })
		if (state.listOrder === "decreasing")
			await this.setState({ listOrder: "increasing" })
	}

	// Checagem de item definido para ordenação na tabela
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

	// Alterna entre tela de detalhes e tabela e determina os estados necessários
	detailToggle = async item => {
		const { showForm, showTable } = this.state
		await this.setState({ turma: item })
		const { turma } = this.state
		await this.setState({
			turmaDetail: {
				"Código de Identificação": turma.id,
				Nível: turma.nivel,
				Turno: turma.turno,
				Ano: turma.ano,
				Série: turma.serie,
				Escola: turma.id_escola
			}
		})
		if (showForm || showTable) {
			this.setState({
				showForm: false,
				showTable: false,
				showTableOptions: false,
				showDetail: true
			})
		}
		if (!showForm && !showTable) {
			this.setState({
				showForm: false,
				showTable: true,
				showTableOptions: true,
				showDetail: false,
				turma: initialState.turma,
				turmaDetail: initialState.turmaDetail
			})
		}
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

	// Método exclusivo para atualizar campo de pesquisa
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
			return item
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
				return escola
			})
			return item
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
					detail={this.detailToggle}
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

	renderDetail = () => {
		if (this.state.showDetail) {
			return (
				<Detail
					item={this.state.turmaDetail}
					detailToggle={this.detailToggle}
				></Detail>
			)
		}
	}

	render() {
		return (
			<Main {...headerProps}>
				{this.renderErrorTable()}
				{this.renderTableOptions()}
				{this.renderTable()}
				{this.renderForm()}
				{this.renderDetail()}
			</Main>
		)
	}
}
