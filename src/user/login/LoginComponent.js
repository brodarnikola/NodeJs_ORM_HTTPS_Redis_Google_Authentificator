import React, {Component} from 'react';
import axios from 'axios';
import {validateUsername, validatePassword} from '../../util/inputValidations.js';
import LoadingIndicatorBesideElement from "../../components/LoadingIndicatorBesideElement";
import createHistory from 'history/createBrowserHistory'
import '../../util/common.css';
import {ACCESS_TOKEN, CURRENT_USER} from "../../constants";

export default class LoginComponent extends Component {

    constructor(props) {
        super(props);

        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.sendOneMoreTokenFunction = this.sendOneMoreTokenFunction.bind(this);

        this.state = {
            username: '',
            password: '',
            buttonClickAllowed: false,
            loading: false,
            numberOfRows: 0,
            wrongUsernameOrPassword: false,
            accessToken: 0,
            wrongToken: 0,
            showResetTokenButton: 0,
            confirmAccessToken: 0,
            sendOneMoreToken: 0,
            receivedUserId: 0,
            expiredPasswordRecoveryToken: 0,
            messageToDisplay: '',
            errorMessageToDisplay: ''
        }
    }

    componentDidMount() {

        // In App.js we have a function that draw orange menu indicator by index
        // index of menu orange indicator
        let menuOrangeIndicator = 0;
        this.props.passClick(menuOrangeIndicator);

        if (this.props.location.state !== undefined) {
            if (this.props.location.state.numberOfInsertedRows === 1) {

                this.setState({
                    numberOfRows: 1
                })

                const history = createHistory();
                if (history.location && history.location.state && history.location.state.numberOfInsertedRows) {
                    const state = {...history.location.state};
                    delete state.numberOfInsertedRows;
                    history.replace({...history.location, state});
                }
            }
            else if (this.props.location.state.accessTokenNull === 1) {

                this.setState({
                    accessToken: 1
                })

                const history = createHistory();
                if (history.location && history.location.state && history.location.state.accessTokenNull) {
                    const state = {...history.location.state};
                    delete state.accessTokenNull;
                    history.replace({...history.location, state});
                }
            }
            else if (this.props.location.state.wrongTokenProps === 1) {

                this.setState({
                    receivedUserId: this.props.location.state.getUserId,
                    wrongToken: 1,
                    showResetTokenButton: 1
                })

                const history = createHistory();
                if (history.location && history.location.state && history.location.state.wrongTokenProps) {
                    const state = {...history.location.state};
                    delete state.wrongTokenProps;
                    history.replace({...history.location, state});
                }
                if (history.location && history.location.state && history.location.state.getUserId) {
                    const state = {...history.location.state};
                    delete state.getUserId;
                    history.replace({...history.location, state});
                }
            }
            else if (this.props.location.state.confirmCorrectTokenProps === 1) {

                this.setState({
                    confirmAccessToken: 1,
                    messageToDisplay: this.props.location.state.messageToDisplayProps
                })

                const history = createHistory();
                if (history.location && history.location.state && history.location.state.confirmCorrectTokenProps) {
                    const state = {...history.location.state};
                    delete state.confirmCorrectTokenProps;
                    history.replace({...history.location, state});
                }
                if (history.location && history.location.state && history.location.state.messageToDisplayProps) {
                    const state = {...history.location.state};
                    delete state.confirmCorrectTokenProps;
                    history.replace({...history.location, state});
                }
            }
            else if (this.props.location.state.passwordRecoveryTokenExpired === 1) {

                this.setState({
                    expiredPasswordRecoveryToken: 1
                })

                const history = createHistory();
                if (history.location && history.location.state && history.location.state.passwordRecoveryTokenExpired) {
                    const state = {...history.location.state};
                    delete state.passwordRecoveryTokenExpired;
                    history.replace({...history.location, state});
                }
            }
        }

    }

    onChangeUsername(e) {
        this.setState({
            username: e.target.value
        });
    }

    onChangePassword(e) {
        this.setState({
            password: e.target.value
        });
    }

    onSubmit(e) {

        e.preventDefault();
        // console.log(`username is ${this.state.username} and password is ${this.state.password}`);
        const serverport = {
            username: this.state.username,
            password: this.state.password
        }

        this.setState({
            loading: true
        });

        setTimeout(() => {

            // 1 PRIMJER, NE ŽELI MI ULOVITI GREŠKU, KADA USER UNESE KRIVI USERNAME ILI PASSWORD
            axios.post('https://localhost:5000/loginUser', serverport)
                .then(response => {

                    // if the response is succcess, then we are saving token, currentUser and redirecting user
                    if (response.data.success === true) {

                        localStorage.setItem(CURRENT_USER, JSON.stringify(response.data.currentUser));
                        this.props.onLogin()
                    }
                    else {
                        console.log("55555 NIJE PRONADEN TAJ USER: " + response.data.errorLoginMessageToDisplay);
                        this.setState({
                            password: "",
                            username: "",
                            loading: false,
                            wrongUsernameOrPassword: true,
                            errorMessageToDisplay: response.data.errorLoginMessageToDisplay
                        });
                    }
                })
                .catch(function (error) {

                    console.log("CCCC: " + error);
                    //this.setState({
                    //    password: "",
                    //    username: "",
                    //    loading: false
                    //});
                });

            // 2 PRIMJER, ŽELI ULOVITI GREŠKU, KADA USER UNESE KRIVI USERNAME ILI PASSWORD
            /* const url = "http://localhost:5000/loginUser";
            const getData = async url => {
                try {
                    const response = await axios.post(url, serverport);

                    // if the response is succcess, then we are saving token, currentUser and redirecting user
                    if (response.data.success === true) {

                        localStorage.setItem(CURRENT_USER, JSON.stringify(response.data.currentUser));
                        this.props.onLogin()
                    }
                    else {
                        console.log("55555 NIJE PRONADEN TAJ USER: " + response.data.errorLoginMessageToDisplay);
                        this.setState({
                            password: "",
                            username: "",
                            loading: false,
                            wrongUsernameOrPassword: true,
                            errorMessageToDisplay: response.data.errorLoginMessageToDisplay
                        });
                    }

                } catch (error) {
                    console.log("NIJE PRONADEN TAJ USER: " + error);
                    this.setState({
                        password: "",
                        username: "",
                        loading: false,
                        wrongUsernameOrPassword: true,
                        errorMessageToDisplay: error.response.data.errorLoginMessageToDisplay
                    });
                }
            };
            getData(url); */
        }, 500);
    }

    sendOneMoreTokenFunction(e) {

        const serverport = {
            userId: this.state.receivedUserId
        }

        this.setState({
            loading: true
        });

        axios.post('https://localhost:5000/sendOneMoreToken', serverport)
            .then(res => {

                if (res.data.success === true) {
                    this.setState({
                        sendOneMoreToken: 1,
                        loading: false,
                        showResetTokenButton: 0,
                        wrongToken: 0
                    })
                }
            })
    }

    render() {

        let getButtonClickAllowed = "";
        if (validateUsername(this.state.username) === ""
            && validatePassword(this.state.password) === "" && this.state.loading === false) {

            getButtonClickAllowed = true
        }
        else {
            getButtonClickAllowed = false
        }

        let buttonClickAllowed = getButtonClickAllowed ? "button_allowed" : "button_disabled";

        return (
            <div style={{marginTop: 30}}>
                <div style={{display: "inline"}}>
                    <h3 style={{display: "inline"}}>Login</h3>
                    {this.state.numberOfRows === 1 &&

                    <p className="popUpCorrectResponse">Now you just need to confirm link on your email account. </p>
                    }
                    {this.state.accessToken === 1 &&

                    <p className="popUpWrongResponse">You don't have permission, token for this.
                        Please login to access permission. </p>
                    }
                    {this.state.wrongToken === 1 &&

                    <p className="popUpWrongResponse">Something went wrong with your token. Please try to send one more
                        token </p>
                    }
                    {this.state.expiredPasswordRecoveryToken === 1 &&

                    <p className="popUpWrongResponse">Your token for password recovery has been expired. Please try to
                        send one more token </p>
                    }

                    {/* <p className="popUpCorrectResponse">You have successfully confirmed your link. Now you can login </p> */}
                    {this.state.confirmAccessToken === 1 &&

                    <p className="popUpCorrectResponse"> {this.state.messageToDisplay} </p>
                    }
                </div>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label>Username: </label>
                        <input type="text" value={this.state.username} className="form-control"
                               onChange={this.onChangeUsername.bind(this)}/>
                    </div>
                    <div className="form-group">
                        <label>Password: </label>
                        <input type="text" value={this.state.password} className="form-control"
                               onChange={this.onChangePassword.bind(this)}/>
                        {this.state.wrongUsernameOrPassword === true &&

                        <p style={{color: "red"}}> {this.state.errorMessageToDisplay} </p>
                        }
                    </div>
                    <div className="form-group" style={{display: 'inline-block'}}>
                        <input type="submit" value="Login" className={buttonClickAllowed}
                               disabled={!getButtonClickAllowed} style={{marginRight: '50px'}}/>
                        {this.state.loading === true &&
                        <LoadingIndicatorBesideElement/>
                        }
                        {this.state.showResetTokenButton === 1 &&

                        <input type="button" value="Send token" className="button_allowed"
                               onClick={this.sendOneMoreTokenFunction.bind(this)}/>
                        }
                        {this.state.sendOneMoreToken === 1 &&

                        <p style={{color: "#007bff"}}>We have successfully send you one more token.
                            Please confirm to login. </p>
                        }
                        <p style={{marginTop: "15px"}}>
                            Forgot your password?
                            <a href={"/forgotPassword"}> Click here for recovery it </a>
                        </p>
                    </div>

                </form>
            </div>
        )
    }
}