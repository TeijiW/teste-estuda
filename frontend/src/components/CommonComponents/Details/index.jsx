import React from "react"

export default props => {
	const tableOptionsBtnStyle = {
		color: "#EEE",
		backgroundColor: "#3291b3",
		marginRight: "10px",
		marginBottom: "10px",
		fontWeight: "bold"
	}
	const itemKeys = Object.keys(props.item)
	const renderRows = () => {
		if (itemKeys.length > 0) {
			return itemKeys.map(key => {
				if (key === "Turmas" && props.item[key].length > 0) {
					return (
						<tr>
							<th>{key}</th>
							<td>
								{props.item[key].map(item => {
									item.nome = `${item.ano ? item.ano : "?"} - ${
										item.turno ? item.turno : "?"
									} - ${item.nivel ? item.nivel : "?"} - ${
										item.serie ? item.serie + "º Ano" : "?"
									}`
									return <p>{item.nome}</p>
								})}
							</td>
						</tr>
					)
				}
				return (
					<tr>
						<th>{key}</th>
						<td>{props.item[key]}</td>
					</tr>
				)
			})
		}
	}
	return (
		<>
			<button
				style={tableOptionsBtnStyle}
				className="btn float-left"
				onClick={() => props.detailToggle(props.item, true)}
			>
				<i className="fa fa-arrow-left fa-fw" />
				Voltar
			</button>
			<div className="table-responsive">
				<table className="table table-striped table-bordered">
					<tbody>{renderRows()}</tbody>
				</table>
			</div>
		</>
	)
}
