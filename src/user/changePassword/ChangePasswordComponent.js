import React, {Component} from 'react';
import axios from 'axios';
import {withRouter} from "react-router-dom";
import '../../util/common.css';
import LoadingIndicatorBesideElement from "../../components/LoadingIndicatorBesideElement";
import {validatePassword} from "../../util/inputValidations";

class ChangePasswordComponent extends Component {

    constructor(props) {
        super(props);

        this.onChangePasswordFirstValue = this.onChangePasswordFirstValue.bind(this);
        this.onChangePasswordSecondValue = this.onChangePasswordSecondValue.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            passwordFirstValue: '',
            passwordSecondValue: '',
            buttonClickAllowed: false,
            loading: false,
            getUserId: 0,
            showMessage: ''
        }
    }

    componentWillMount() {

        let token = this.props.match.params.token;

        axios.post('https://localhost:5000/readforgotPasswordToken/' + token)
            .then(response => {

                // 23.01.2019 If token has expired, then I need to redirect user, and display user that message
                // 24.01.2019 this is now handled
                if (response.data.success === false) {
                    this.props.history.push({
                        pathname: '/login',
                        state: {passwordRecoveryTokenExpired: 1}
                    })
                }
                else {
                    this.setState({
                        getUserId: response.data.id
                    })
                }
            })
            .catch(function (error) {
                console.log(error);
                console.log("GRESKAAA BBBBBBB");
                window.location = "/login"
            })
    }

    onChangePasswordFirstValue(e) {
        this.setState({
            passwordFirstValue: e.target.value
        });
    }

    onChangePasswordSecondValue(e) {
        this.setState({
            passwordSecondValue: e.target.value
        });
    }

    onSubmit(e) {

        e.preventDefault();
        //console.log(`email is ${this.state.email} and address is ${this.state.address}`);
        const userPassword = {
            passwordFirstValue: this.state.passwordFirstValue,
            userId: this.state.getUserId
        }

        this.setState({
            loading: true
        });

        console.log("change password component: ID razlicit od nule: " + this.state.getUserId)
        setTimeout(() => {
            axios.post('https://localhost:5000/updateUserPassword', userPassword)
                .then(res => {
                    if (res.data.success === true) {
                        this.props.history.push({
                            pathname: '/login',
                            state: {
                                confirmCorrectTokenProps: 1,
                                messageToDisplayProps: "You have successfully updated your password. Now you can login"
                            }
                        })
                    }
                });
        }, 1500);

    }


    render() {

        let getButtonClickAllowed = "";
        if (validatePassword(this.state.passwordFirstValue) === "" &&
            validatePassword(this.state.passwordSecondValue) === "" &&
            this.state.passwordFirstValue === this.state.passwordSecondValue && this.state.loading === false) {

            getButtonClickAllowed = true
        }
        else {
            getButtonClickAllowed = false
        }

        let buttonClickAllowed = getButtonClickAllowed ? "button_allowed" : "button_disabled";

        return (
            <div style={{marginTop: 30}}>
                <h3>Change your password</h3>
                <form onSubmit={this.onSubmit} style={{marginTop: 30}}>
                    <div className="form-group">
                        <label>Password: </label>
                        <input type="text" value={this.state.passwordFirstValue} className="form-control"
                               onChange={this.onChangePasswordFirstValue.bind(this)}/>
                    </div>
                    <div className="form-group">
                        <label>Confirm password: </label>
                        <input type="text" value={this.state.passwordSecondValue} className="form-control"
                               onChange={this.onChangePasswordSecondValue.bind(this)}/>
                    </div>
                    <div className="form-group" style={{display: 'inline-block'}}>
                        <input type="submit" value="Send" className={buttonClickAllowed}
                               disabled={!getButtonClickAllowed}/>
                        {this.state.loading === true &&
                        <LoadingIndicatorBesideElement/>
                        }
                        {this.state.showMessage !== '' &&
                        <p style={{color: "red"}}> {this.state.showMessage} </p>
                        }
                    </div>
                </form>
            </div>
        )
    }
}

export default withRouter(ChangePasswordComponent);