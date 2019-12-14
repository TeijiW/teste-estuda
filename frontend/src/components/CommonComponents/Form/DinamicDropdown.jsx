import React from "react"
import { Multiselect } from "multiselect-react-dropdown"

export default props => {
	const { name, label, options, onSelect, onRemove } = props
	let { selectedValues } = props
	if (!selectedValues) {
		selectedValues = []
	} else {
		selectedValues.map(item => {
			item.nome = `${item.ano ? item.ano : "?"} - ${
				item.turno ? item.turno : "?"
			} - ${item.nivel ? item.nivel : "?"} - ${item.serie ? item.serie : "?"}`
			return item
		})
	}
	return (
		<div className="col-12 col-md-6">
			<div className="form-group">
				<label>{label}</label>
				<Multiselect
					selectedValues={selectedValues}
					options={options}
					onSelect={onSelect}
					onRemove={onRemove}
					displayValue="nome"
					placeholder="Selecione as turmas"
					emptyRecordMsg="Opções não disponíveis"
				/>
			</div>
		</div>
	)
}
