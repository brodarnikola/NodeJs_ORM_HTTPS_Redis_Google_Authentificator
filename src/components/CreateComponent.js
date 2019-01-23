import React, { Component } from 'react';
import axios from 'axios';
import { withRouter} from "react-router-dom";
import {validateCustomerName, validateCustomerAddres} from '../util/inputValidations.js';
import '../util/common.css';
import LoadingIndicatorBesideElement from "./LoadingIndicatorBesideElement";

class CreateComponent extends Component {

    constructor(props) {
        super(props);
        this.onChangeCustomerName = this.onChangeCustomerName.bind(this);
        this.onChangeCustomerAddress = this.onChangeCustomerAddress.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            name: '',
            address: '',
            buttonClickAllowed: false,
            loading: false
        }
    }

    componentDidMount(){

        //console.log("CREATE COMPONENT => component did mount")
        // In App.js we have a function that draw orange menu indicator by index
        // index of menu orange indicator
        let menuOrangeIndicator = 1;
        this.props.passClick(menuOrangeIndicator);
    }

    onChangeCustomerName(e) {
        this.setState({
            name: e.target.value
        });
    }

    onChangeCustomerAddress(e) {
        this.setState({
            address: e.target.value
        });
    }

    onSubmit(e) {

        e.preventDefault();
        console.log(`name is ${this.state.name} and address is ${this.state.address}`);
        const serverport = {
            name: this.state.name,
            address: this.state.address
        }

        this.setState({
            loading: true
        });

        setTimeout(() => {
            axios.post('http://localhost:5000/add', serverport)
                .then(res =>
                    this.setState({
                        address: "",
                        name: "",
                        loading: false
                    })
                );
        }, 1500);
    }


    render() {

        let getButtonClickAllowed = "";
        if( validateCustomerName(this.state.name) === ""
            && validateCustomerAddres(this.state.address) === "" && this.state.loading === false ) {

            getButtonClickAllowed = true
        }
        else {
            getButtonClickAllowed = false
        }

        let buttonClickAllowed = getButtonClickAllowed ? "button_allowed" : "button_disabled";

        return (
            <div style={{marginTop: 50}}>
                <h3>Add New Customer</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label>Customer name:  </label>
                        <input type="text" value={this.state.name} className="form-control"
                               onChange={ this.onChangeCustomerName.bind(this) }   />
                    </div>
                    <div className="form-group">
                        <label>Customer addres: </label>
                        <input type="text" value={this.state.address} className="form-control"
                               onChange={ this.onChangeCustomerAddress.bind(this)}/>
                    </div>
                    <div className="form-group"  style={{display: 'inline-block'}}>
                        <input type="submit" value="Add customer" className={buttonClickAllowed}
                               disabled={!getButtonClickAllowed}/>
                        {this.state.loading === true &&
                            <LoadingIndicatorBesideElement/>

                        }
                    </div>
                </form>
            </div>
        )
    }
}

export default  withRouter(CreateComponent);