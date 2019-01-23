import React, {Component} from 'react';
import axios from 'axios';
import '../util/common.css';
import LoadingIndicatorCenter from "./LoadingIndicatorCenter";
import {ACCESS_TOKEN} from "../constants";
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

        console.log("ACCESS TOKEN JE: " + localStorage.getItem(ACCESS_TOKEN))

        if (  localStorage.getItem(ACCESS_TOKEN) !== "undefined") {

            let config = {
                headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem(ACCESS_TOKEN))}
            };

            axios.post('http://localhost:5000/checkPictureComponent', "", config)
                .then(response => {

                    if (response.data.success === false) {
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
                    console.log(error);
                    console.log("GRESKAAA BBBBBBB");
                    window.location = "/login"
                })
        }
        else {
            this.props.history.push({
                pathname: '/login',
                state: {accessTokenNull: 1}
            })
        }

        let menuOrangeIndicator = 2;
        this.props.passClick(menuOrangeIndicator);
    }


    render() {

        if (this.state.loading) { // if your component doesn't have to wait for an async action, remove this block
            return <LoadingIndicatorCenter/>;
        }

        return (
            <div style={{marginTop: 50}}>
                <h3>PICTURES</h3>

                <img src={require('../images/lion.jpg')}
                     style={{  width: "300px", height: "200px", marginRight: "50px"}}  />
                <img src={require('../images/delfin.jpg')} style={{  width: "300px", height: "200px"}}  />
            </div>
        )
    }
}