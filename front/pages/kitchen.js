import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Header from '../components/header'
import React from 'react'
import Router from 'next/router'


export default class Kitchen extends React.Component {
	constructor(props){
		super(props)	
		this.state = {
			pendingOrders: [],
			cookingOrders: [],
			intervalIDs: []
		}

		this.cookingOrdersWrapper = this.cookingOrdersWrapper.bind(this);
		this.pendingOrdersWrapper = this.pendingOrdersWrapper.bind(this);
	}

	componentDidMount() {
		let GETOptions = {method: 'GET', credentials: 'include'};
		let intervalPending = setInterval(_=>{
			fetch('http://localhost:3001/orders/kitchen/waiting', GETOptions)
			.then(res => res.json())
			.then(pendingOrds => {
				this.setState({
					pendingOrders: pendingOrds
				});
			})
		}, 1000)

		let intervalCooking = setInterval(_=>{
			fetch('http://localhost:3001/orders/kitchen/cooking', GETOptions)
			.then(res => res.json())
			.then(cookingOrds => {
				this.setState({
					cookingOrders: cookingOrds
				})
			})
		}, 1000)

		this.setState({
			intervalIDs: [intervalCooking, intervalPending]
		})
	}

	componentWillUnmount(){
		this.state.intervalIDs.forEach(e=>{
			clearInterval(e)
		})
	}

	pendingOrdersWrapper(orders){
		let pendingOrds = [];
		orders.forEach(e => {
			pendingOrds.push(
				<div className="col-3 order__item">
					<p className="order__text">{e["id"]}</p>
					<button className="btn btn-primary callme__button" onClick={()=>this.createOrderRedirect(e["id"])}>Подтвердить</button>
				</div>
			)
		});
		return pendingOrds;
	}

	cookingOrdersWrapper(orders){
		let cookingOrds = [];
		orders.forEach(e => {
			cookingOrds.push(
				<div className="col-3 order__item">
					<p className="order__text">{e["id"]}</p>
					<p className="order__text">{e["products"]}</p>
				</div>
			)
		});
		return cookingOrds;

	}
	
	render() {
		return(
			<>
				<Header />

				<div className="container">
					<h1 className="header__orders">
						Заказы
					</h1>
					<hr/>
					<div className="row">
						{this.state.pendingOrders.length > 0 &&
							this.pendingOrdersWrapper(this.state.pendingOrders)
						}

						{this.state.cookingOrders.length > 0 &&
							this.cookingOrdersWrapper(this.state.cookingOrders)
						}
					</div>
				</div>
			</>
		)
	}
}