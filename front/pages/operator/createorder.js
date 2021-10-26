import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import Header from '../../components/header'
import React from 'react'

export default class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state= {
			productsText: '',
			username: '',
			adress: '',
			phonenumber: '',
			deliverytime: '',
			deliverymethod: '',
			paymentmethod: '',
			products: []
		}

		this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
		this.productClick = this.productClick.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.productsList = this.productsList.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		fetch('http://localhost:3001/product/all')
		.then(res => res.json())
		.then(productsFetched => {
			console.log(productsFetched)
			this.setState({
				products: productsFetched
			});
		})

	}

	handleSubmit(e){
		const requestOptions = {
			method: 'POST',
			credentials: 'include',
			headers: {
    			'Accept': 'application/json',
    			'Content-Type': 'application/json',
  			},	
			body: JSON.stringify({
				name: this.state.username,
				adress: this.state.adress,
				phonenumber: this.state.phonenumber,
				products: this.state.productsText,
				paymentmethod: this.state.paymentmethod,
				deliverymethod: this.state.deliverymethod
			})
		};
		fetch('http://localhost:3001/order/operator/create', requestOptions)
		e.preventDefault();
	}

	handleChange(e){
  		this.setState({[e.target.name]: e.target.value})
	}

	handleTextAreaChange(e) {
		this.setState({
			productsText: e.target.value
		});
	}

	productClick(product) {
		let currentProductsText = this.state.productsText;
		if (currentProductsText == '') {
			currentProductsText = product; 
		} else {
			currentProductsText = currentProductsText + ', ' + product;
		}
		this.setState({
			productsText: currentProductsText
		})
	}

	productsList(products) {
		let namesArray = [];
		products.forEach(element => {
			namesArray.push(<a href="#" class="list-group-item list-group-item-action" onClick={(e) => this.productClick(e.nativeEvent.target.text)}>{element["name"]}</a>);
		});
		return namesArray
	}

  render() {
	return (
    <>
		<Header/>

		<div className="container createorder">
			<div className="col-6">
				<h1 className="createorder__header">Создать заказ</h1>
				<form onSubmit={this.handleSubmit}>
  				<div className="form-group">
    				<label for="inputName">Имя</label>
    				<input name="username" value={this.state.name} onChange={(e) => this.handleChange(e)} type="text" className="form-control" id="inputName" aria-describedby="nameHelp" placeholder="Введите имя"/>
  				</div>
  				<div className="form-group">
    				<label for="adress">Адрес</label>
    				<input name="adress" value={this.state.adress} onChange={(e) => this.handleChange(e)} type="text" className="form-control" id="adressInput" placeholder="Введите адрес"/>
  				</div>
  				<div class="form-group">
    				<label for="inputPhonenumber">Номер телефона</label>
    				<input name="phonenumber" value={this.state.phonenumber} onChange={(e) => this.handleChange(e)} type="text" class="form-control" id="inputPhonenumber" placeholder="Введите номер"/>
  				</div>
  				<div class="form-group">
    				<label for="inputDeliveryTime">Время доставки</label>
    				<input name="deliverytime" value={this.state.deliverytime} onChange={(e) => this.handleChange(e)} type="text" class="form-control" id="inputDeliveryTime" placeholder="Введите время доставки"/>
  				</div>
  				<div class="form-group">
    				<label for="inputProducts">Блюда</label>
    				<textarea class="form-control" id="inputProducts" placeholder="Блюда для заказа" value={this.state.productsText} onChange={this.handleTextAreaChange}></textarea>
					<div class="list-group list-group-height createorder-list-height">
						{ this.state.products.length > 0 &&
							this.productsList(this.state.products)
						}
					</div>
  				</div>
				<label>Способ оплаты:</label>
				<div class="form-check">
  					<input checked={this.state.paymentmethod === "cash"} onChange={(e)=>this.handleChange(e)} class="form-check-input" type="radio" name="paymentmethod" id="paymentMethodCash" value="cash" />
  					<label class="form-check-label" for="paymentMethodCash">
    					Наличные
  					</label>
				</div>
				<div class="form-check">
  					<input checked={this.state.paymentmethod === "card"} onChange={(e)=>this.handleChange(e)} class="form-check-input" type="radio" name="paymentmethod" id="paymentMethodCard" value="card" />
  					<label class="form-check-label" for="paymentMethodCard">
    					Карта
  					</label>
				</div>
				<label>Способ доставки:</label>
				<div class="form-check">
  					<input checked={this.state.deliverymethod === "delivery"} onChange={(e)=>this.handleChange(e)} class="form-check-input" type="radio" name="deliverymethod" id="deliveryMethodDelivery" value="delivery" />
  					<label class="form-check-label" for="deliveryMethod">
    					Доставка
  					</label>
				</div>
				<div class="form-check">
  					<input checked={this.state.deliverymethod === "takeout"} onChange={(e)=>this.handleChange(e)} class="form-check-input" type="radio" name="deliverymethod" id="deliveryMethodTakeout" value="takeout" />
  					<label class="form-check-label" for="deliveryMethod">
    					Самовывоз
  					</label>
				</div>
  				<button type="submit" class="btn btn-primary">Подтвердить</button>
				</form>
			</div>
			</div>
    </>
  )
  } 
}