import React, {Component} from 'react';

import {
    Route,
    withRouter,
    Switch
} from 'react-router-dom';

import WeatherComponent from './components/WeatherComponent';
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
import ConfirmationTokenComponent from "./user/confirmationToken/ConfirmationTokenComponent";
import ForgotPasswordComponent from "./user/forgotPassword/ForgotPasswordComponent";

import PrivateRoute from './util/PrivateRoute';
import ChangePasswordComponent from "./user/changePassword/ChangePasswordComponent";
import ConfirmLoginComponent from "./components/ConfirmLoginComponent";


class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            menuLinksLoggedUser: [
                {label: 'Home', link: '/index', active: true},
                {label: 'Create', link: '/create'},
                {label: 'Picture', link: '/picture'},
                {label: 'Update', link: '/edit/:id'},
                {label: 'Weather', link: '/weather'},
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
        this.handleConfirmLogin = this.handleConfirmLogin.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);

        this.loadCurrentUser = this.loadCurrentUser.bind(this);
    }

    // namjerno loadamo usera, da spremamo u state "currentUser",
    // podatke od usera i onda ih kasnije sano proslijeđujemo ostalim komponentama
    loadCurrentUser() {

        if ( localStorage.getItem(CURRENT_USER) !== null) {

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

            axios.post('https://localhost:5000/user/me', serverport)
                .then(response => {

                    this.setState({
                        currentUser: response.data.loggedUserData,
                        isAuthenticated: false,
                        isLoading: false,
                        showUserAdminMenu: false
                    });

                    // to je provjera za stari nacin KORISTENJA SQL query, dok nisam koristio ORM za SQL query
                    //console.log("response je: " + this.state.currentUser[0].username)
                    // provjera za novi nacin KORISTENJA SQL QUERY, KORISTI SE ORM za SQL
                    console.log("response je: " + this.state.currentUser
                         + " enableQR: " + this.state.currentUser.enabledQR + " secretKey: " + this.state.currentUser.secret_key )

                    this.props.history.push("/confirmLogin");
                })
                .catch(function (error) {
                    console.log(error);
                    console.log("GRESKAAA DDDD");
                })

        }
    }


    componentDidMount() {

        if ( localStorage.getItem(ACCESS_TOKEN) !== null) {

            let getUserData = JSON.parse(localStorage.getItem(CURRENT_USER))
            const userData = {
                id: getUserData.id,
                enabledQR: getUserData.enabledQR
            }

            this.setState({
                currentUser: userData,
                isAuthenticated: true
            });
        }
    }

    handleMenuClickLogedUser(e) {
        //e.preventDefault();

        if (e === 0) {

            this.setState({
                menuLinksLoggedUser: [
                    {label: 'Home', link: '/index', active: true},
                    {label: 'Create', link: '/create'},
                    {label: 'Picture', link: '/picture'},
                    {label: 'Update', link: '/edit/:id'},
                    {label: 'Weather', link: '/weather'},
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
                    {label: 'Weather', link: '/weather'},
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
                    {label: 'Weather', link: '/weather'},
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
                    {label: 'Weather', link: '/weather'},
                    {label: 'Logout', link: '/logout'}
                ]
            })
        }
        else if (e === 4) {

            console.log("da li ce uci u meni, za vremensku prognozu: " + this.state.menuLinksLoggedUser[4].label)
            this.setState({
                menuLinksLoggedUser: [
                    {label: 'Home', link: '/index'},
                    {label: 'Create', link: '/create'},
                    {label: 'Picture', link: '/picture'},
                    {label: 'Update', link: '/edit/:id'},
                    {label: 'Weather', link: '/weather', active: true},
                    {label: 'Logout', link: '/logout'}
                ]
            })
        }
        else if (e === 5) {

            this.setState({
                menuLinksLoggedUser: [
                    {label: 'Home', link: '/index'},
                    {label: 'Create', link: '/create'},
                    {label: 'Picture', link: '/picture'},
                    {label: 'Update', link: '/edit/:id'},
                    {label: 'Weather', link: '/weather'},
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

        this.handleMenuClickLogedUser(0)
        this.setState({
            isAuthenticated: true
        })
        console.log("current user je: " + this.state.currentUser)
        this.props.history.push("/index");
    }

    handleConfirmLogin() {

        this.handleMenuClickNeedToLogIn(0)
        this.setState({
            currentUser: "A",
            isAuthenticated: false
        })
        this.loadCurrentUser();
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
                                             onLogout={this.handleLogout}  />

                    <Switch>
                        <Route path="/login" render={(props) => <LoginComponent
                            passClick={this.handleMenuClickNeedToLogIn}
                            onLogin={this.handleConfirmLogin}  {...props}  />}  />

                        <Route path="/confirmLogin" render={(props) => <ConfirmLoginComponent
                            passClick={this.handleMenuClickNeedToLogIn}
                            onLogin={this.handleLogin}  {...props}  />}  />
                        <Route path='/signup' render={(props) => <SignupComponent
                            passClick={this.handleMenuClickNeedToLogIn}  {...props}  />}  />
                        <Route path='/confirmation/:token' render={(props) => <ConfirmationTokenComponent
                            passClick={this.handleMenuClickNeedToLogIn}  {...props}  />}  />
                        <Route path='/forgotPassword' render={(props) => <ForgotPasswordComponent
                            passClick={this.handleMenuClickNeedToLogIn}  {...props}  />}  />
                        <Route path='/changePassword/:token?' render={(props) => <ChangePasswordComponent
                            passClick={this.handleMenuClickNeedToLogIn}  {...props}  />}  />

                        <Route path='/index' render={(props) => <IndexComponent
                            passClick={this.handleMenuClickLogedUser}  {...props}  />}  />
                        <Route path='/create' render={(props) => <CreateComponent
                            passClick={this.handleMenuClickLogedUser}
                            currentUser={this.state.currentUser} {...props}  />}  />
                        <Route path='/edit/:id' render={(props) => <EditComponent
                            passClick={this.handleMenuClickLogedUser} {...props}  />}  />

                        <Route path='/picture' render={(props) => <PictureComponent
                            authenticated={this.state.isAuthenticated}
                            handleLogout={this.handleLogout}
                            passClick={this.handleMenuClickLogedUser}    {...props}  />}  />

                        <Route path='/weather' render={(props) => <WeatherComponent
                            passClick={this.handleMenuClickLogedUser} {...props}  />}  />

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
