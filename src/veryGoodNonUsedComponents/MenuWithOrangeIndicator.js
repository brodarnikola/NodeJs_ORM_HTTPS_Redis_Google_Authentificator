import React, {Component} from 'react';
import './MenuWithOrangeIndicator.css';
import searchIcon from '../images/search-icon.png';
import {Link, withRouter} from "react-router-dom";


class MenuWithOrangeIndicator extends Component {

    constructor() {
        super();

        this.state = {
            showForm: false,
            changeMenuClickHover: false,
        };

        this.handleClickLogedUser = this.handleClickLogedUser.bind(this);
        this.handleClickNeedToLogin = this.handleClickNeedToLogin.bind(this);
    }

    showForm() {
        this.setState({
            showForm: !this.state.showForm
        });
    }

    handleClickLogedUser(index) {
        //console.log("1:  " + index);
        if(index === 5) {
            this.props.onLogout();
        }
        else {
            this.props.passClickLogedUser(index);
        }
    }

    handleClickNeedToLogin(index) {
        //console.log("1:  " + index);
        this.props.passClickNeedToLogin(index);
    }

    render() {

        let linksMarkup;

        if( this.props.currentUser !== null && this.props.isAuthenticated === true ) {

            /* menuItems = [
                    <Link to="/index">
                        Index
                    </Link>,
                    <Link to="/create">
                        Create
                    </Link>
            ]; */

            linksMarkup = this.props.sendMenuLinksLoggedUser.map((link, index) => {

                //console.log("link je: " + link + " index je: " + index)
                let linkMarkup = link.active ? (

                    <Link to={link.link}className="menu__link menu__link--active " >{link.label}</Link>
                    //<a className="menu__link menu__link--active " href={link.link}>{link.label}</a>
                ) : (
                    <Link to={link.link}className="menu__link  " >{link.label}</Link>
                    //<a className="menu__link" href={link.link}>{link.label}</a>
                );

                return (
                    <li key={index} className="menu__list-item" onClick={this.handleClickLogedUser.bind(this, index)}>
                        {linkMarkup}
                    </li>
                );
            });
        }
        else {
            /* menuItems = [
                    <Link to="/login">LoginComponent</Link>,
                    <Link to="/signup">SignupComponent</Link>
            ]; */

            linksMarkup = this.props.sendMenuLinksNeedToLogin.map((link, index) => {

                //console.log("link je: " + link + " index je: " + index)
                let linkMarkup = link.active ? (

                    <Link to={link.link}className="menu__link menu__link--active " >{link.label}</Link>
                    //<a className="menu__link menu__link--active " href={link.link}>{link.label}</a>
                ) : (
                    <Link to={link.link}className="menu__link  " >{link.label}</Link>
                    //<a className="menu__link" href={link.link}>{link.label}</a>
                );

                return (
                    <li key={index} className="menu__list-item" onClick={this.handleClickNeedToLogin.bind(this, index)}>
                        {linkMarkup}
                    </li>
                );
            });
        }

        let searchForm = this.state.showForm ? (
            <form className="menu__search-form" method="POST">
                <input className="menu__search-input" placeholder="Type and hit enter"/>
            </form>
        ) : '';

        return (
            <nav className="menu">

                <h1 style={{
                    backgroundImage: 'url(' + this.props.logo + ')'
                }} className="menu__logo">Epic Co.</h1>

                <div className="menu__right">
                    <ul className="menu__list">
                        {linksMarkup}

                    </ul>

                    <button onClick={this.showForm.bind(this)} style={{
                        backgroundImage: 'url(' + searchIcon + ')'
                    }} className="menu__search-button"></button>

                    { searchForm }
                </div>
            </nav>
        );
    }
}

export default  withRouter(MenuWithOrangeIndicator);
