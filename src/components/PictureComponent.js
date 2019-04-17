import React, {Component} from 'react';
import axios from 'axios';
import '../util/common.css';
import LoadingIndicatorCenter from "./LoadingIndicatorCenter";
import {ACCESS_TOKEN, CURRENT_USER} from "../constants";
import decode from 'jwt-decode';
//import lion, delfin from '../images/search-icon.png';

export default class PictureComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            messageToDisplay: ''
        };
    }

    componentWillMount() {

        this.setState({
            loading: true
        })

        if ( localStorage.getItem(ACCESS_TOKEN) !== null  && localStorage.getItem(ACCESS_TOKEN) !== "undefined" ) {

            // first here I'm checking if token is not expired and after that I'm validating token on backend
            /* try {
                const decoded = decode(localStorage.getItem(ACCESS_TOKEN));
                if (decoded.exp < Date.now() / 1000) { // Checking if token is expired. N

                    localStorage.removeItem(ACCESS_TOKEN)
                    localStorage.removeItem(CURRENT_USER)
                    this.props.history.push({
                        pathname: '/login',
                        state: {accessTokenNull: 1}
                    })
                }
                else
                    this.setState({
                        loading: false
                    })
            }
            catch (err) {
                this.props.history.push({
                    pathname: '/login',
                    state: {accessTokenNull: 1}
                })
            } */

            let config = {
                headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem(ACCESS_TOKEN))}
            };

            axios.post('https://localhost:5000/checkPictureComponent', "", config)
                .then(response => {

                    if (response.data.success === false) {

                        localStorage.removeItem(ACCESS_TOKEN)
                        localStorage.removeItem(CURRENT_USER)
                        this.props.history.push({
                            pathname: '/login',
                            state: {accessTokenNull: 1}
                        })
                    }
                    else {
                        //console.log("da li ce uci" + response.data.success);
                        this.setState({
                            loading: false
                        })
                    }
                })
                .catch(function (error) {

                    localStorage.removeItem(ACCESS_TOKEN)
                    localStorage.removeItem(CURRENT_USER)
                    console.log(error);
                    console.log("GRESKAAA BBBBBBB");
                    window.location = "/login"
                })
        }
        else {
            localStorage.removeItem(ACCESS_TOKEN)
            localStorage.removeItem(CURRENT_USER)
            this.props.history.push({
                pathname: '/login',
                state: {accessTokenNull: 1}
            })
        }

        let menuOrangeIndicator = 2;
        this.props.passClick(menuOrangeIndicator);
    }


    render() {

        if (this.state.loading) {
            return <LoadingIndicatorCenter/>;
        }

        return (
            <div style={{marginTop: 50}}>
                <h3>PICTURES</h3>

                <img src={require('../images/lion.jpg')}
                     style={{  width: "300px", height: "200px", marginRight: "50px"}}  alt={""} />
                <img src={require('../images/delfin.jpg')} style={{  width: "300px", height: "200px"}}  alt={""} />
            </div>
        )
    }
}