import React, {Component} from 'react';
import axios from 'axios';
import {withRouter} from "react-router-dom";
import {validateCustomerName, validateCustomerAddres} from '../util/inputValidations.js';
import '../util/common.css';
import LoadingIndicatorBesideElement from "./LoadingIndicatorBesideElement";
import {ACCESS_TOKEN} from "../constants";

class CreateComponent extends Component {

    constructor(props) {
        super(props);

        this.onChangeCustomerName = this.onChangeCustomerName.bind(this);
        this.onChangeCustomerAddress = this.onChangeCustomerAddress.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.onChangeUserRole = this.onChangeUserRole.bind(this);
        this.getAllUserWithThisRole = this.getAllUserWithThisRole.bind(this);

        this.state = {
            name: '',
            address: '',
            buttonClickAllowed: false,
            addedUserSuccesfully: false,
            showMessage: false,
            loading: false,
            userRole: '',
            // There can be three combinations: 1) at least one user found with role, 2) no user found, 3) something went wrong
            userRoleFound: 1,
            loadingUserRole: false,
            arrayUserRoleData: []
        }
    }

    componentWillMount() {

        if ( localStorage.getItem(ACCESS_TOKEN) !== null  && localStorage.getItem(ACCESS_TOKEN) !== "undefined" ) {
        }
        else {
            this.props.history.push({
                pathname: '/login'
            })
        }
    }

    componentDidMount() {

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

    onChangeUserRole(e) {
        this.setState({
            userRole: e.target.value
        });
    }

    onSubmit(e) {

        e.preventDefault();

        const serverport = {
            name: this.state.name,
            address: this.state.address
        }

        this.setState({
            loading: true
        });

        setTimeout(() => {
            axios.post('https://localhost:5000/add', serverport)
                .then(res =>

                    this.setState({
                        address: "",
                        name: "",
                        loading: false,
                        addedUserSuccesfully: res.data.success,
                        showMessage: true
                    })
                );
        }, 1500);
    }

    getAllUserWithThisRole(e) {

        e.preventDefault();
        //console.log(`name is ${this.state.name} and address is ${this.state.address}`);
        const userRole = {
            userRole: this.state.userRole
        }

        this.setState({
            loadingUserRole: true
        });

        setTimeout(() => {
            axios.post('https://localhost:5000/getAllUsersWithRole', userRole)
                .then(res => {

                    if (res.data.success === true && res.data.arrayUserData.length > 0) {

                        console.log("create component nadi usera")
                        this.setState({
                            loadingUserRole: false,
                            arrayUserRoleData: res.data.arrayUserData,
                            userRoleFound: 1
                        })

                        /* log check if we receive good data
                        for (let i = 0; i < this.state.arrayUserRoleData.length; i++) {
                            console.log("1 podatak " + i + ", 2 podatak: " + this.state.arrayUserRoleData[i].username)
                        } */
                    }
                    else if( res.data.success === true && res.data.arrayUserData.length === 0 ) {

                        console.log("sve je dobro, osim nije pronaden user sa tom rolom")
                        this.setState({
                            loadingUserRole: false,
                            arrayUserRoleData: res.data.arrayUserData,
                            userRoleFound: 0
                        })
                    }
                    else {
                        console.log("create component tu ce uci")
                        this.setState({
                            loadingUserRole: false,
                            userRoleFound: -1
                        })
                    }
                });
        }, 1500);
    }


    render() {


        const addedUserSuccesfully = this.state.addedUserSuccesfully;
        const showMessage = this.state.showMessage;

        const userRoleFound = this.state.userRoleFound

        let userRoleText;
        if (this.state.arrayUserRoleData.length > 0) {

            userRoleText = "Ispis podataka: \n"
            this.state.arrayUserRoleData.forEach((userRole, userRoleIndex) => {

                userRoleText += "Username: " + userRole.username + " email: " + userRole.email
                             +  " role name: " + userRole.role_name + "\n"
            });
        }

        let currentUser
        if (this.props.currentUser !== null)
            currentUser = this.props.currentUser

        let getButtonClickAllowed = "";
        if (validateCustomerName(this.state.name) === ""
            && validateCustomerAddres(this.state.address) === "" && this.state.loading === false) {

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
                        <label>Customer name: </label>
                        <input type="text" value={this.state.name} className="form-control"
                               onChange={this.onChangeCustomerName.bind(this)}/>
                    </div>
                    <div className="form-group">
                        <label>Customer addres: </label>
                        <input type="text" value={this.state.address} className="form-control"
                               onChange={this.onChangeCustomerAddress.bind(this)}/>
                    </div>
                    <div className="form-group" style={{display: 'inline-block'}}>
                        <input type="submit" value="Add customer" className={buttonClickAllowed}
                               disabled={!getButtonClickAllowed}/>
                        {this.state.loading === true &&
                        <LoadingIndicatorBesideElement/>

                        }
                    </div>
                    {showMessage === true &&
                        <p style={{color: 'red'}}>
                            <b> {addedUserSuccesfully === true ? 'User has been successfully added.' :
                                'User did not successfully added. Please try again.'}
                            </b>
                        </p>
                    }
                </form>

                <div>
                    <p> User data {<br/>}
                        Username: {currentUser !== undefined && currentUser.username}
                        <br/> Email: {currentUser !== undefined && currentUser.email}
                    </p>
                    <div>
                        <p>Insert role: </p>
                        <input type="text" value={this.state.userRole} onChange={this.onChangeUserRole.bind(this)}
                               style={{marginRight: "20px"}}/>
                        <button onClick={this.getAllUserWithThisRole.bind(this)}> Send</button>
                        {this.state.loadingUserRole === true &&
                            <LoadingIndicatorBesideElement/>
                        }
                    </div>

                    {/* If no user found with this role, then array length of user is 0 something went wrong */}
                    { userRoleFound === 0 &&
                        <p style={{color: 'red'}}>
                            <b> { 'No user with that role has been found.' }
                            </b>
                        </p>
                    }
                    {/* If something went wrong with our backend service, then we are showing this message */}
                    { userRoleFound === -1 &&
                        <p style={{color: 'red'}}>
                            <b> { 'Something went wrong. Please try again latter.' }
                            </b>
                        </p>
                    }
                    <textarea value={userRoleText} style={{width: "650px", height: "200px", marginTop: "10px"}}
                              className="textarea">
                    </textarea>
                </div>
            </div>
        )
    }
}

export default withRouter(CreateComponent);