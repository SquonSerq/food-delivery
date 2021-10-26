import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import Header from '../../components/header'
import React from 'react'
import Router from 'next/router'

export default class OperatorIndex extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			pendingOrders: [],
			callmeNumbers: [],
			intervalIDs: []
		}

		this.callmeWrapper = this.callmeWrapper.bind(this);
		this.pendingOrdersWrapper = this.pendingOrdersWrapper.bind(this);
		this.createOrderRedirect = this.createOrderRedirect.bind(this);
		this.createOrderPropRedirect = this.createOrderPropRedirect.bind(this);
	}


	componentDidMount(){
		let GETOptions = {method: 'GET', credentials: 'include'};
		let pendingOrdersInterval = setInterval(_=>{fetch('http://localhost:3001/orders/pending', GETOptions)
		.then(res => {
			if(res.status == 401) {
				Router.push('/login')
			}
			return res.json();
		})
		.then(pendingOrdersFetch => {
			this.setState({
				pendingOrders: pendingOrdersFetch 
			})
		})}, 1000);

		let callmeInterval = setInterval(_=>{fetch('http://localhost:3001/callme/all', GETOptions)
		.then(res => res.json())
		.then(callmeNumsFetch => {
			this.setState({
				callmeNumbers: callmeNumsFetch
			})
		})}, 1000);

		this.setState({
			intervalIDs: [pendingOrdersInterval, callmeInterval]
		});
		
	}

	componentWillUnmount(){
		this.state.intervalIDs.forEach(e => {
			clearInterval(e);
		})
	}

	handleChange(e){
		this.setState({[e.target.name]: e.target.value})
	}

	createOrderRedirect(phonenumber){
		fetch('http://localhost:3001/callme/'+phonenumber+'/delete', {
			method: 'POST',
			credentials: 'include'
		});
		Router.push('/operator/createorder');
	}

	createOrderPropRedirect(){
		Router.push('operator/createorder')
	}

	callmeWrapper(fetchNumbers){
		let callMeNumbers = [];
		fetchNumbers.forEach(e => {
			callMeNumbers.push(
				<div className="col-3 callme__block">
					<p className="callme__number">{e["phonenumber"]}</p>
					<button className="btn btn-primary callme__button" onClick={()=>this.createOrderRedirect(e["phonenumber"])}>Создать заказ</button>
				</div>
			)
		});
		return callMeNumbers;
	}

	pendingOrdersWrapper(fetchOrders){
		let orders = [];
		fetchOrders.forEach(e => {
			orders.push(
				<div className="col-3 order__item">
					<p className="order__text">{'Заказ: '+e["id"].substring(0,5)}</p>
					<button className="btn btn-primary callme__button" onClick={()=>this.createOrderPropRedirect({})}>Создать заказ</button>
				</div>
			)
		});
		return orders
	}

	render(){
		return(
			<>
				<Header />
				
				{this.state.callmeNumbers.length > 0 &&
				<div className="container">
					<h1 className="callme__header">
						Обратный звонок
					</h1>
					<hr />
					<div className="row">
							{this.callmeWrapper(this.state.callmeNumbers)}
					</div>
				</div>
				}

				<div className="container">
					<h1 className="header__orders">
						Заказы
					</h1>
					<button className="btn btn-primary">Создать новый заказ</button>
					<hr/>
					<div className="row">
						{this.state.pendingOrders.length > 0 &&
							this.pendingOrdersWrapper(this.state.pendingOrders)
						}
					</div>
				</div>
			</>
		)
	}
}