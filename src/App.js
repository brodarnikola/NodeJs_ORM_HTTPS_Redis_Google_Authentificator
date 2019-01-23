import React, {Component} from 'react';
//import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import {
    Route,
    withRouter,
    Switch
} from 'react-router-dom';

import CreateComponent from './components/CreateComponent';
import EditComponent from './components/EditComponent';
import IndexComponent from './components/IndexComponent';
import LoginComponent from './user/login/LoginComponent'

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './veryGoodNonUsedComponents/MenuWithOrangeIndicator.css';

import SignupComponent from "./user/signup/SignupComponent";

import MenuWithOrangeIndicator from "./veryGoodNonUsedComponents/MenuWithOrangeIndicator";
import axios from "axios";
import LoadingIndicatorCenter from "./components/LoadingIndicatorCenter";
import {ACCESS_TOKEN, CURRENT_USER} from "./constants";
import PictureComponent from "./components/PictureComponent";
import ConfirmationTokenComponent from "./user/ConfirmationToken/ConfirmationTokenComponent";

import PrivateRoute from './util/PrivateRoute';


class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            menuLinksLoggedUser: [
                {label: 'Home', link: '/index', active: true},
                {label: 'Create', link: '/create'},
                {label: 'Picture', link: '/picture'},
                {label: 'Update', link: '/edit/:id'},
                {label: 'Logout', link: '/logout'}
            ],
            menuLinksNeedToLogin: [
                {label: 'Login', link: '/login', active: true},
                {label: 'SignUp', link: '/signup'},
                {label: 'Picture', link: '/picture'},
            ],
            currentUser: null,
            isAuthenticated: false,
            isLoading: false,
            id: "",
            showUserAdminMenu: false
        };

        // This binding is necessary to make `this` work in the callback
        this.handleMenuClickLogedUser = this.handleMenuClickLogedUser.bind(this);
        this.handleMenuClickNeedToLogIn = this.handleMenuClickNeedToLogIn.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    // namjerno loadamo usera, da spremamo u state "currentUser",
    // podatke od usera i onda ih kasnije sano proslijeđujemo ostalim komponentama
    loadCurrentUser() {

        if (localStorage.getItem(ACCESS_TOKEN) != null) {

            /* this.setState({
                isLoading: true
            }); */

            // [{"username":"bbbb","password":"1234","email":"brodarnikola@gmail.com"}]
            /* let getUsername = JSON.parse(localStorage.getItem(ACCESS_TOKEN))
            const serverport = {
                username: getUsername[0].username
            } */

            let getUsername = JSON.parse(localStorage.getItem(CURRENT_USER))
            const serverport = {
                username: getUsername.username
            }

            axios.post('http://localhost:5000/user/me', serverport)
                .then(response => {

                    this.setState({
                        currentUser: response.data,
                        isAuthenticated: true,
                        isLoading: false,
                        showUserAdminMenu: true
                    });

                    //console.log("response je: " + this.state.currentUser[0].username)
                })
                .catch(function (error) {
                    console.log(error);
                    console.log("GRESKAAA DDDD");
                    /* this.setState({
                        isLoading: false,
                        showUserAdminMenu: false
                    }); */
                })

        }
    }


    componentDidMount() {
        //console.log("APP ==> Component did mount")
        this.loadCurrentUser();
    }

    handleMenuClickLogedUser(e) {
        //e.preventDefault();

        //console.log("APP ==> handleMenuClickLogedUser")
        if (e === 0) {

            this.setState({
                menuLinksLoggedUser: [
                    {label: 'Home', link: '/index', active: true},
                    {label: 'Create', link: '/create'},
                    {label: 'Picture', link: '/picture'},
                    {label: 'Update', link: '/edit/:id'},
                    {label: 'Logout', link: '/logout'}
                ]
            })
        }
        else if (e === 1) {

            this.setState({
                menuLinksLoggedUser: [
                    {label: 'Home', link: '/index'},
                    {label: 'Create', link: '/create', active: true},
                    {label: 'Picture', link: '/picture'},
                    {label: 'Update', link: '/edit/:id'},
                    {label: 'Logout', link: '/logout'}
                ]
            })
        }
        else if (e === 2) {

            this.setState({
                menuLinksLoggedUser: [
                    {label: 'Home', link: '/index'},
                    {label: 'Create', link: '/create'},
                    {label: 'Picture', link: '/picture', active: true},
                    {label: 'Update', link: '/edit/:id'},
                    {label: 'Logout', link: '/logout'}
                ]
            })
        }
        else if (e === 3) {

            this.setState({
                menuLinksLoggedUser: [
                    {label: 'Home', link: '/index'},
                    {label: 'Create', link: '/create'},
                    {label: 'Picture', link: '/picture'},
                    {label: 'Update', link: '/edit/:id', active: true},
                    {label: 'Logout', link: '/logout'}
                ]
            })
        }
        else if (e === 4) {

            this.setState({
                menuLinksLoggedUser: [
                    {label: 'Home', link: '/index'},
                    {label: 'Create', link: '/create'},
                    {label: 'Picture', link: '/picture'},
                    {label: 'Update', link: '/edit/:id'},
                    {label: 'Logout', link: '/logout', active: true}
                ]
            })
        }
    }

    handleMenuClickNeedToLogIn(e) {

        if (e === 0) {

            //console.log('0   The link was clicked.' + e);
            //this.history.push("/index");
            this.setState({
                menuLinksNeedToLogin: [
                    {label: 'Login', link: '/login', active: true},
                    {label: 'SignUp', link: '/signup'},
                    {label: 'Picture', link: '/picture'},
                ]
            })
        }
        else if (e === 1) {

            //console.log('1   The link was clicked.' + e);
            this.setState({
                menuLinksNeedToLogin: [
                    {label: 'Login', link: '/login'},
                    {label: 'SignUp', link: '/signup', active: true},
                    {label: 'Picture', link: '/picture'},
                ]
            })
        }
        else if (e === 2) {

            //console.log('2   The link was clicked.' + e);
            this.setState({
                menuLinksNeedToLogin: [
                    {label: 'Login', link: '/login'},
                    {label: 'SignUp', link: '/signup'},
                    {label: 'Picture', link: '/picture', active: true},
                ]
            })
        }
    }

    handleLogin() {

        //console.log("APP ==> HANDLE LOGIN")
        this.handleMenuClickLogedUser(0)
        this.setState({
            currentUser: "A",
            isAuthenticated: true
        })
        this.loadCurrentUser();
        this.props.history.push("/index");
    }

    handleLogout() {

        localStorage.removeItem(ACCESS_TOKEN)
        localStorage.removeItem(CURRENT_USER)

        this.setState({
            currentUser: null,
            isAuthenticated: false,
            showUserAdminMenu: false
        });

        this.props.history.push("/login");

        /* notification[notificationType]({
            message: 'Polling App',
            description: description,
        }); */
    }


    render() {

        /* if (this.state.isLoading) {
            return <LoadingIndicatorCenter/>
        } */

        return (
            <div className="container center">

                <div>
                    <MenuWithOrangeIndicator passClickLogedUser={this.handleMenuClickLogedUser}
                                             passClickNeedToLogin={this.handleMenuClickNeedToLogIn}
                                             sendMenuLinksLoggedUser={this.state.menuLinksLoggedUser}
                                             sendMenuLinksNeedToLogin={this.state.menuLinksNeedToLogin}
                                             currentUser={this.state.currentUser}
                                             isAuthenticated={this.state.isAuthenticated}
                                             onLogout={this.handleLogout}/>

                    <Switch>
                        <Route path="/login" render={(props) => <LoginComponent
                            passClick={this.handleMenuClickNeedToLogIn}
                            onLogin={this.handleLogin}  {...props}  />}/>
                        <Route path='/signup' render={(props) => <SignupComponent
                            passClick={this.handleMenuClickNeedToLogIn}  {...props}  />}/>
                        <Route path='/confirmation/:token' render={(props) => <ConfirmationTokenComponent
                            passClick={this.handleMenuClickNeedToLogIn}  {...props}  />}/>

                        <Route path='/index' render={(props) => <IndexComponent
                            passClick={this.handleMenuClickLogedUser}  {...props}  />}/>
                        <Route path='/create' render={(props) => <CreateComponent
                            passClick={this.handleMenuClickLogedUser}  {...props}  />}/>
                        <Route path='/edit/:id' render={(props) => <EditComponent
                            passClick={this.handleMenuClickLogedUser}  {...props}  />}/>


                        <Route path='/picture' render={(props) => <PictureComponent
                            authenticated={this.state.isAuthenticated}
                            handleLogout={this.handleLogout}
                            passClick={this.handleMenuClickLogedUser}    {...props}  />}/>

                        {/*  <Route path="/picture" render={(props) => component={PictureComponent}
                                   authenticated={this.state.isAuthenticated}
                                          handleLogout={this.handleLogout}
                                          passClick={this.handleMenuClickLogedUser}    {...props}  />}  />  */}

                    </Switch>
                </div>
            </div>
        );
    }
}

export default withRouter(App);
