import React, {Component} from 'react';
import axios from 'axios';
import {withRouter} from "react-router-dom";
import {validateEmail} from '../../util/inputValidations.js';
import '../../util/common.css';
import LoadingIndicatorBesideElement from "../../components/LoadingIndicatorBesideElement";

class ForgotPasswordComponent extends Component {

    constructor(props) {
        super(props);
        this.onChangeCustomerEmail = this.onChangeCustomerEmail.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            email: '',
            buttonClickAllowed: false,
            loading: false,
            showMessage: ''
        }
    }

    onChangeCustomerEmail(e) {
        this.setState({
            email: e.target.value
        });
    }

    onSubmit(e) {

        e.preventDefault();
        //console.log(`email is ${this.state.email} and address is ${this.state.address}`);
        const userEmail = {
            email: this.state.email
        }

        this.setState({
            loading: true
        });

        setTimeout(() => {
            axios.post('http://localhost:5000/forgotUserPassword', userEmail)
                .then(res => {
                    if (res.data.success === true) {
                        this.setState({
                            email: "",
                            loading: false,
                            showMessage: '1'
                        })
                    }
                    else {
                        this.setState({
                            loading: false,
                            showMessage: '0'
                        })
                    }
                })
                .catch(error => {
                    this.setState({
                        loading: false,
                        showMessage: '0'
                    })
                });
        }, 1500);
    }


    render() {

        let getButtonClickAllowed = "";
        if (validateEmail(this.state.email) === "" && this.state.loading === false) {

            getButtonClickAllowed = true
        }
        else {
            getButtonClickAllowed = false
        }

        let buttonClickAllowed = getButtonClickAllowed ? "button_allowed" : "button_disabled";

        return (
            <div style={{marginTop: 30}}>
                <div style={{display: "inline"}}>
                    <h3 style={{display: "inline"}}>Forgot your password</h3>
                    {this.state.showMessage === '1' &&

                        <p className="popUpCorrectResponse"> We have successfully send you email link for your password recovery. </p>
                    }
                    {this.state.showMessage === '0' &&

                        <p className="popUpWrongResponse"> Something went wrong, please try again to send email. </p>
                    }

                </div>
                <form onSubmit={this.onSubmit} style={{marginTop: 20}}>
                    <div className="form-group">
                        <label>Email address: </label>
                        <input type="text" value={this.state.email} className="form-control"
                               onChange={this.onChangeCustomerEmail.bind(this)}/>
                    </div>
                    <div className="form-group" style={{display: 'inline-block'}}>
                        <input type="submit" value="Send" className={buttonClickAllowed}
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

export default withRouter(ForgotPasswordComponent);