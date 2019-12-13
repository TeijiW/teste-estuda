import React from "react"
import ReactDOM from "react-dom"
import Cleave from "cleave.js/react"

export default props => {
	const { label, name, value, onChange, style } = props
	return (
		<div className="col-12 col-md-6">
			<div className="form-group">
				<label htmlFor={name}>{label}</label>
				<Cleave
					className="form-control"
					name={name}
					placeholder="DD/MM/AAAA"
					options={{ date: true }}
					onChange={onChange}
				/>
			</div>
		</div>
	)
}
