import React from "react"

export default props => {
	const renderTd = item => {
		const itemKeys = Object.keys(item)
		return itemKeys.map(key => {
			if (key !== "dataGroup") {
				return <td>{item[key]}</td>
			}
			return key
		})
	}

	if (props.values) {
		return props.values.map(item => {
			return (
				<tr>
					{renderTd(item)}
					<td>
						<button
							className="btn btn-warning ml-2"
							onClick={() => props.load(item)}
						>
							<i className="fa fa-pencil" />
						</button>
						<button
							className="btn btn-danger ml-2"
							onClick={() => props.remove(item)}
						>
							<i className="fa fa-trash" />
						</button>
						<button
							className="btn btn-primary ml-2"
							onClick={() => props.detail(item)}
						>
							<i className="fa fa-info-circle" />
						</button>
					</td>
				</tr>
			)
		})
	}
}
