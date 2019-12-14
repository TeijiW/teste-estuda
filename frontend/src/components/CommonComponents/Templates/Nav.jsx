import React from "react"
import { NavLink } from "react-router-dom"
import "./Nav.css"

export default props => {
	return (
		<aside className="menu-area">
			<nav className="menu">
				<NavLink activeClassName="active-link" exact to="/home">
					<i className="fa fa-home fa-fw" /> Inicio
				</NavLink>
				<NavLink activeClassName="active-link" to="/alunos">
					<i className="fa fa-users fa-fw" /> Alunos
				</NavLink>
				<NavLink activeClassName="active-link" to="/turmas">
					<i className="fa fa-book fa-fw" /> Turmas
				</NavLink>
				<NavLink activeClassName="active-link" to="/escolas">
					<i className="fas fa-school" /> Escolas
				</NavLink>
			</nav>
		</aside>
	)
}
