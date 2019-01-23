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
            confirmAccessToken: 0,
            sendOneMoreToken: 0
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
                    wrongToken: 1
                })

                const history = createHistory();
                if (history.location && history.location.state && history.location.state.wrongTokenProps) {
                    const state = {...history.location.state};
                    delete state.wrongTokenProps;
                    history.replace({...history.location, state});
                }
            }
            else if (this.props.location.state.confirmCorrectTokenProps === 1) {

                this.setState({
                    confirmAccessToken: 1
                })

                const history = createHistory();
                if (history.location && history.location.state && history.location.state.confirmCorrectTokenProps) {
                    const state = {...history.location.state};
                    delete state.confirmCorrectTokenProps;
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
            /* axios.post('http://localhost:5000/loginUser', serverport)
                .then(res => {
                    localStorage.setItem(USERNAME, JSON.stringify(res.data));

                        console.log("LOGIN USER KAO TOCAN RESPONSE");

                        this.props.onLogin()
                })
                .catch(function (error) {
                    this.setState({
                        password: "",
                        username: "",
                        loading: false
                    });
                }); */

            // 2 PRIMJER, ŽELI ULOVITI GREŠKU, KADA USER UNESE KRIVI USERNAME ILI PASSWORD
            const url = "http://localhost:5000/loginUser";
            const getData = async url => {
                try {
                    const response = await axios.post(url, serverport);

                    // if the response is succcess, then we are saving token, currentUser and redirecting user
                    if( response.data.success ) {

                        localStorage.setItem(ACCESS_TOKEN, JSON.stringify(response.data.token));
                        localStorage.setItem(CURRENT_USER, JSON.stringify(response.data.currentUser));
                        this.props.onLogin()
                    }
                    else {
                        console.log("55555 NIJE PRONADEN TAJ USER: ");
                        this.setState({
                            password: "",
                            username: "",
                            loading: false,
                            wrongUsernameOrPassword: true
                        });
                    }

                } catch (error) {
                    console.log("NIJE PRONADEN TAJ USER: " + error);
                    this.setState({
                        password: "",
                        username: "",
                        loading: false,
                        wrongUsernameOrPassword: true
                    });
                }
            };
            getData(url);
        }, 500);
    }

    sendOneMoreTokenFunction(e) {

        console.log("SEND ONE MORE TOKEN,,, FRONTEND")

        const serverport = {
            username: this.state.username,
            password: this.state.password
        }

        this.setState({
            loading: true
        });

        axios.post('http://localhost:5000/sendOneMoreToken', serverport)
            .then( res => {

                    console.log("nakon responsa od servera: ==> "  +res.data.success);
                    if( res.data.success === true ) {
                        this.setState({
                            sendOneMoreToken: 1,
                            loading: false,
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

                        <p className="popUpWrongResponse">Something went wrong with your token. Please try to send one more token </p>
                    }
                    {this.state.confirmAccessToken === 1 &&

                        <p className="popUpCorrectResponse">You have successfully confirmed your link. Now you can login </p>
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
                        { this.state.wrongUsernameOrPassword === true &&

                            <p style={{color: "red"}}>You have inserted wrong username or password or you did not confirmed link on your email account</p>
                        }
                    </div>
                    <div className="form-group" style={{display: 'inline-block'}}>
                        <input type="submit" value="Login" className={buttonClickAllowed}
                               disabled={!getButtonClickAllowed}  style={{marginRight: '50px'}}/>
                        {this.state.loading === true &&
                            <LoadingIndicatorBesideElement/>
                        }
                        {this.state.wrongToken === 1 &&

                            <input type="submit" value="Send token" className={buttonClickAllowed}
                                onClick={this.sendOneMoreTokenFunction.bind(this)}   disabled={!getButtonClickAllowed}/>
                        }
                        {this.state.sendOneMoreToken === 1 &&

                            <p style={{color: "#007bff"}}>We have successfully send you one more token.
                            Please confirm to login. </p>
                        }
                    </div>
                </form>
            </div>
        )
    }
}