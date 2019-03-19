import React, { Component } from 'react';
import axios from 'axios';
import { validateEmail, validateUsername, validatePassword} from '../../util/inputValidations.js';
import '../../util/common.css';
import LoadingIndicatorBesideElement from "../../components/LoadingIndicatorBesideElement"; 

export default class SignupComponent extends Component {

    constructor(props) {
        super(props);

        this.checkIfUsernameOrEmailExists = this.checkIfUsernameOrEmailExists.bind(this);
        this.onChangeSurnameAndName = this.onChangeSurnameAndName.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            name: '',
            username: '',
            email: '',
            password: '',
            codeForAdmin: '',
            buttonClickAllowed: false,
            loading: false,
            checkEmailOrUsername: '0',
            numberOfInsertedRows: 0
        }
    }

    componentDidMount(){

        // In App.js we have a function that draw menu orange indicator by index
        // index of menu orange indicator
        let menuOrangeIndicator = 1;
        this.props.passClick(menuOrangeIndicator);
    }

    onChangeSurnameAndName(e) {
        this.setState({
            name: e.target.value
        });
    }

    onChangeUsername(e) {
        this.setState({
            username: e.target.value
        });
    }

    onChangeEmail(e) {
        this.setState({
            email: e.target.value
        });
    }

    onChangePassword(e) {
        this.setState({
            password: e.target.value
        });
    }

    onChangeCodeForAdmin(e) {
        this.setState({
            codeForAdmin: e.target.value
        });
    }

    checkIfUsernameOrEmailExists() {

        const serverport = {
            username: this.state.username,
            email: this.state.email
        }

        this.setState({
            checkEmailOrUsername: '0'
        })

        console.log("podaci su: " + serverport.username)

        axios.post('https://localhost:5000/checkIfUsernameOrEmailExists', serverport)
            .then(res =>
                    this.setState({
                        checkEmailOrUsername: res.data
                    })
                    //console.log("podaci su: " + this.setState.checkEmailOrUsername)
        );
    }

    onSubmit(e) {

        e.preventDefault();

        const serverport = {
            name: this.state.name,
            username: this.state.username,
            email: this.state.email,
            password: this.state.password,
            codeForAdmin: this.state.codeForAdmin
        }

        this.setState({
            loading: true
        });

        setTimeout(() => {
             axios.post('https://localhost:5000/signUpUser', serverport)
                .then( res => {

                    // AKO ŽELIMO REDIREKTATI USERA, TO MOŽEMO NAPRAVITI NA NAČIN DA
                    // 1) dodamo usera,
                    // 2) zatim njegovu rolu i to sve povezali
                    // 3) tek onda želimo preusmjeriti usera na login page
                    // PREUSMJERAVANJE RADIMO U "SignupComponent.js" datoteci
                    // VAŽNO JE STAVITI zAGRADE "{}" nakon "res =>"
                    if( res.data.success === true ) {
                        this.props.history.push({
                            pathname: '/login',
                            state: { numberOfInsertedRows: 1 }
                        })
                    }
                })
        }, 1500);
    }

    render() {


        let getButtonClickAllowed = "";
        if( validateUsername(this.state.username) === "" && validateEmail(this.state.email) === ""
           && validatePassword(this.state.password) === "" && this.state.loading === false
           && this.state.checkEmailOrUsername < 1) {

            // provjeri ako postoji več taj username ili email

            //this.checkIfUsernameOrEmailExists();
            //console.log(this.state.checkEmailOrUsername)
            //if( this.state.checkEmailOrUsername >= 1 )
            //    getButtonClickAllowed = false
            //else
                getButtonClickAllowed = true
        }
        else {
            getButtonClickAllowed = false
        }

        let buttonClickAllowed = getButtonClickAllowed ? "button_allowed" : "button_disabled";

        return (
            <div style={{marginTop: 50}}>
                <h3>SignUp</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label>Surname and name:  </label>
                        <input type="text" value={this.state.name} className="form-control"
                               onChange={ this.onChangeSurnameAndName.bind(this) }   />
                    </div>
                    <div className="form-group">
                        <label>Username:  </label>
                        <input type="text" value={this.state.username} className="form-control"
                               /* onBlur={ this.checkIfUsernameOrEmailExists } */
                               onChange={(event) => this.onChangeUsername(event, this.validateUsername)}  />
                        {this.state.checkEmailOrUsername >= 1 &&
                            <p>This username already exists</p>
                        }
                    </div>
                    <div className="form-group">
                        <label>Email: </label>
                        <input type="text" value={this.state.email} className="form-control"
                                /* onBlur={ this.checkIfUsernameOrEmailExists } */
                               onChange={ this.onChangeEmail.bind(this)}   />
                        {this.state.checkEmailOrUsername >= 1 &&
                            <p>This email already exists</p>
                        }
                    </div>
                    <div className="form-group">
                        <label>Password: </label>
                        <input type="text" value={this.state.password} className="form-control"
                               onChange={ this.onChangePassword.bind(this)}/>
                    </div>
                    <div className="form-group">
                        <label>Code for admin: </label>
                        <input type="text" value={this.state.codeForAdmin} className="form-control"
                               onChange={ this.onChangeCodeForAdmin.bind(this)}/>
                    </div>
                    <div className="form-group"  style={{display: 'inline-block'}}>
                        <input type="submit" value="Login" className={buttonClickAllowed}
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