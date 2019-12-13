import React from "react"
import SearchBar from "./SearchBar"

export default props => {
	const tableOptionsBtnStyle = {
		color: "#FFF",
		backgroundColor: "#97a626",
		marginRight: "10px",
		marginLeft: "10px",
		marginBottom: "10px",
		fontWeight: "bold"
	}

	const {
		formToggle,
		filterToggle,
		updateButtonText,
		update,
		searchQuery,
		searchOnChange,
		generatePDF,
		showAddButton,
		showUpdateButton,
		showFilterButton,
		showPrintButton,
		showSearchBar,
		addButtonText
	} = props

	const renderAddButton = () => {
		if (showAddButton) {
			return (
				<button
					style={tableOptionsBtnStyle}
					className="btn float-left"
					onClick={() => formToggle()}
				>
					<i className="fa fa-plus fa-fw" />
					{addButtonText}
				</button>
			)
		}
	}

	const renderUpdateButton = () => {
		if (showUpdateButton) {
			return (
				<button
					style={tableOptionsBtnStyle}
					className="btn float-left"
					onClick={() => update()}
				>
					<i className="fa fa-refresh fa-fw" />
					{updateButtonText}
				</button>
			)
		}
	}

	const renderFilterButton = () => {
		if (showFilterButton) {
			return (
				<button
					style={tableOptionsBtnStyle}
					className="btn float-left"
					onClick={() => filterToggle()}
				>
					<i className="fa fa-filter fa-fw" />
					Filtro
				</button>
			)
		}
	}

	const renderPrintButton = () => {
		if (showPrintButton) {
			return (
				<button
					style={tableOptionsBtnStyle}
					className="btn float-left"
					onClick={() => generatePDF()}
				>
					<i className="fa fa-print fa-fw" />
					Imprimir Tabela
				</button>
			)
		}
	}

	const renderSearchBar = () => {
		if (showSearchBar) {
			return (
				<SearchBar
					value={searchQuery}
					placeholder="Pesquisa"
					onChange={value => searchOnChange(value)}
				/>
			)
		}
	}

	return (
		<div className="row">
			<div className="col">
				{renderAddButton()}
				{renderUpdateButton()}
				{renderFilterButton()}
				{renderPrintButton()}
			</div>
			<div className="col">{renderSearchBar()}</div>
		</div>
	)
}
