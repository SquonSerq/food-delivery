import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Header from '../components/header'
import React from 'react'


export default class Login extends React.Component {
	constructor(props){
		super(props)
		this.state={
			login: '',
			password: ''
		}

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleNajmi = this.handleNajmi.bind(this);
	}

	handleChange(e){
		this.setState({[e.target.name]: e.target.value})
	}

	handleSubmit(e){
		let requestOptions = {
			method: "POST",
			headers: {
    			'Accept': 'application/json',
    			'Content-Type': 'application/json',
  			},	
			body: JSON.stringify({
				login: this.state.login,
				password: this.state.password
			}),
			credentials: 'include'
		}
		
		fetch('http://localhost:3001/login', requestOptions);
		e.preventDefault()
	}

	handleNajmi(){
		fetch('http://localhost:3001/checksession', {
			method: 'GET',
			credentials: 'include'
		})
	}

	render() {
		return(
			<>
				<Header/>

				<div className="container login">
					<div className="row">
						<div className="col-6">
							<form onSubmit={(e)=>this.handleSubmit(e)}>
								<div className="form-group">
									<label>Login: </label>
									<input type="text" name="login" onChange={(e)=>this.handleChange(e)} value={this.state.login}></input>
								</div>
								<br/>
								<div className="form-group">
									<label>Password: </label>
									<input type="password" name="password" onChange={(e)=>this.handleChange(e)} value={this.state.password}></input>
								</div>
								<br/>
								<button type="submit" className="btn btn-primary">Login</button>
							</form>
						</div>
					</div>
				</div>
				<button onClick={this.handleNajmi} className="btn btn-primary">Нажми</button>
			</>
		)
	}
}