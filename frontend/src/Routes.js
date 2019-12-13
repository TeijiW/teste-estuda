import React from "react"
import { Switch, Route, Redirect } from "react-router"

import Alunos from "./components/Alunos"
import Turmas from "./components/Turmas"
import Escolas from "./components/Escolas"
import Home from "./components/Home"
import Logo from "./components/CommonComponents/Templates/Logo"
import Nav from "./components/CommonComponents/Templates/Nav"
import Footer from "./components/CommonComponents/Templates/Footer"

export default props => {
	const { name } = props
	return (
		<>
			<Logo />
			<Nav />
			<Switch>
				<Route path="/alunos" component={Alunos} />
				<Route path="/turmas" component={Turmas} />
				<Route path="/escolas" component={Escolas} />
				<Route exact path="/" component={props => <Home name={name} />} />
				<Redirect to="/" />
			</Switch>
			<Footer />
		</>
	)
}
