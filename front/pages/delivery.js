import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Header from '../components/header'
import React from 'react'
import Router from 'next/router'

export default class Delivery extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			orders: [],
			intervalIDs: []
		}
		
		this.ordersWrapper = this.ordersWrapper.bind(this);
	}

	componentDidMount(){
		let GETOptions = {method: 'GET', credentials: 'include'};
		let intervalDelivery = setInterval(_=>{
			fetch('http://localhost:3001/orders/delivery', GETOptions)
			.then(res => res.json())
			.then(pendingOrds => {
				this.setState({
					pendingOrders: pendingOrds
				});
			})
		}, 1000)

		this.setState({
			intervalIDs: [intervalDelivery]
		})
	}

	componentWillUnmount(){
		this.state.intervalIDs.forEach(e=>{
			clearInterval(e);
		})
	}

	endDelivery(id){
		fetch('http://localhost:3001/order/'+id+'/end', {
			method: 'POST',
			credentials: 'include'
		});

	}

	ordersWrapper(orders){
		let deliveryOrders = [];
			orders.foreach(e => {
				let gis = 'https://2gis.ru/omsk/search/'+e['adress'];
				pendingords.push(
					<div classname="col-3 order__item">
						<p className="callme__number"><b>{e['id'].substring(0,5)}</b></p>
						<p className="callme__number">{e['adress']}</p>
						<p className="callme__number">{e['phonenumber']}</p>
						<p className="callme__number">{e['name']}</p>
						<a href={gis} className="callme__number">Маршрут</a>
						<button classname="btn btn-primary callme__button" onclick={()=>this.endDelivery(e["id"])}>Закончить</button>
					</div>
				)
			});
		return deliveryOrders;	
	}


	render() {
		return(
			<>
				<Header />

				<div className="container">
					<h1 className="callme__header">
						Доставка
					</h1>
					<hr />
					<div className="row">
						{this.state.orders.length > 0 &&
							this.ordersWrapper(this.state.orders)
						}
					</div>
				</div>
			</>
		)
	}
}