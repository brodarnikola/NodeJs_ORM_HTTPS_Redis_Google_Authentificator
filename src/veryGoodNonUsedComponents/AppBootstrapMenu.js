import React, {Component} from 'react';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';

import CreateComponent from './components/CreateComponent';
import EditComponent from './components/EditComponent';
import IndexComponent from './components/IndexComponent';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Signup from "./user/signup/SignupComponent";


import {Layout, notification} from 'antd';


const {Content} = Layout;


class AppBootstrapMenu extends Component {
    render() {
        return (
            <Layout className="app-container">

                <Router>
                    <div className="container">
                        <nav className="navbar navbar-expand-lg navbar-light bg-light">
                            <a className="navbar-brand">React Express App</a>
                            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                                <ul className="navbar-nav mr-auto">
                                    <li className="nav-item">
                                        <Link to={'/create'} className="nav-link">Create</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to={'/index'} className="nav-link">Index</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to={'/edit/:id'} className="nav-link">Edit</Link>
                                    </li>
                                </ul>
                                <ul className="navbar-nav" style={ {marginRight:'50px'} }>
                                    <li className="nav-item">
                                        <Link to={'/signUp'} className="nav-link">signUp</Link>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                        <Switch>
                            <Route exact path='/create' component={CreateComponent}/>
                            <Route path='/edit/:id' component={EditComponent}/>
                            <Route path='/index' component={IndexComponent}/>
                            <Route path='/signup' component={Signup}/>
                        </Switch>
                    </div>
                </Router>

            </Layout>
        );
    }
}

export default AppBootstrapMenu;
