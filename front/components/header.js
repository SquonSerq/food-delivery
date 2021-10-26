import React from "react";

export default class Header extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			login: 'Guest',
			userRole: 'role'
		}
	}

	componentDidMount() {
		fetch('http://localhost:3001/getsessioninfo', {
			method: 'GET',
			credentials: 'include'
		})
		.then((res) => res.json())
		.then((resData) => {
			console.log(resData)
			this.setState({
				login: resData[0]['login'],
				userRole: resData[0]['role']
			})
		})
	}

	render() {
		return (
			<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
  				<a className="navbar-brand" href="#">Доставка "Название":{this.state.userRole.length > 0 && this.state.userRole} | {this.state.login.length >0 && this.state.login.toUpperCase()}
				</a>
			</nav>
		)
	}
}