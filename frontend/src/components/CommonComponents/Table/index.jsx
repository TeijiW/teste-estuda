import React from "react"
import Rows from "./Rows"
import TableHeaders from "./TableHeaders"

export default props => {
	// TableHaders - Renderiza os cabeçalhos conforme a lista
	// Rows - Renderiza as linhas conforme a lista dos objetos
	return (
		<div>
			<table className="table mt-4">
				<thead>
					<tr>
						<TableHeaders
							values={props.thList}
							listOrder={props.listOrder}
							onClick={props.onClick}
						/>
					</tr>
				</thead>
				<tbody>
					<Rows
						values={props.list}
						remove={props.remove}
						load={props.load}
						detail={props.detail}
					/>
				</tbody>
			</table>
		</div>
	)
}
