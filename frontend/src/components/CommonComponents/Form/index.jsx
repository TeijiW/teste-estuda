import React from "react"
import TextInput from "./TextInput"
import DateInput from "./DateInput"
import Dropdown from "./Dropdown"
import TextInputWithIcon from "./TextInputWithIcon"
import Password from "./Password"
import ErrorAlert from "./ErrorAlert"
import WarningAlert from "./WarningAlert"
import NumberInput from "./NumberInput"

export default props => {
	const { errors, fieldState, warnings } = props

	const renderClearButton = () => {
		if (props.clearButtonText) {
			return props.clearButtonText
		}
		return "Cancelar"
	}
	const renderFields = fieldList => {
		return fieldList.map(field => {
			let values
			const { type, name, label } = field
			switch (type) {
				case "Dropdown":
					values = field.values
					return (
						<Dropdown
							style={renderError(name)}
							values={values}
							label={label}
							name={name}
							value={fieldState[name]}
							onChange={event => props.updateField(event)}
						/>
					)
				case "TextInput":
					return (
						<TextInput
							style={renderError(name)}
							label={label}
							name={name}
							value={fieldState[name]}
							onChange={event => props.updateField(event)}
						/>
					)
				case "TextInputWithIcon":
					const { maxLength } = field
					return (
						<TextInputWithIcon
							style={renderError(name)}
							values={values}
							label={label}
							name={name}
							value={fieldState[name]}
							onChange={event => props.updateField(event)}
							maxLength={maxLength}
						/>
					)
				case "DateInput":
					return (
						<DateInput
							style={renderError(name)}
							label={label}
							name={name}
							value={fieldState[name]}
							onChange={event => props.updateField(event)}
						/>
					)
				case "NumberInput":
					const { min, max } = field
					return (
						<NumberInput
							style={renderError(name)}
							label={label}
							name={name}
							value={fieldState[name]}
							onChange={event => props.updateField(event)}
							min={min}
							max={max}
						/>
					)
				case "Password":
					return (
						<Password
							style={renderError(name)}
							label={label}
							name={name}
							value={fieldState[name]}
							onChange={event => props.updateField(event)}
						/>
					)
				default:
					return <></>
			}
		})
	}
	const renderError = field => {
		if (errors) {
			if (errors.length >= 1) {
				const fieldsWithError = errors.reduce((accumulator, currentError) => {
					const { fields } = currentError
					if (fields) accumulator = [...accumulator] + [...fields]
					return accumulator
				}, [])
				const errorInputStyle = {
					borderColor: "rgb(248, 215, 218)",
					boxShadow: "0 0 0 0.2rem rgba(205, 50, 65, 0.7)",
					backgroundColor: "rgb(248, 215, 218)"
				}
				if (fieldsWithError.includes(field)) {
					return errorInputStyle
				}
			} else {
				return null
			}
		}
	}

	const renderErrorAlert = () => {
		if (errors && errors.length > 0) {
			return <ErrorAlert errors={errors} />
		}
	}

	const renderWarningAlert = warnings => {
		if (warnings && warnings.length > 0) {
			return <WarningAlert warnings={warnings} />
		}
	}

	return (
		<div>
			{renderErrorAlert()}
			<form className="form" onSubmit={props.handleSubmit}>
				<div className="row">{renderFields(props.fieldList)}</div>
				<div className="row">
					<div className="col-12 d-flex justify-content-end">
						<button type="submit" className="btn btn-primary">
							{props.saveButtonText}
						</button>
						<button
							type="button"
							className="btn btn-secondary ml-2"
							onClick={() => props.clear()}
						>
							{renderClearButton()}
						</button>
					</div>
				</div>
			</form>
			{renderWarningAlert(warnings)}
		</div>
	)
}
