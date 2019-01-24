import React, {Component} from 'react';
import axios from 'axios';
import '../../util/common.css';
import LoadingIndicatorCenter from "../../components/LoadingIndicatorCenter";

export default class ConfirmationTokenComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
        }
    }

    componentDidMount() {

        // In App.js we have a function that draw orange menu indicator by index
        // index of menu orange indicator
        let menuOrangeIndicator = 0;
        this.props.passClick(menuOrangeIndicator);

        let token = this.props.match.params.token;

        /* 1) nacin
         let config = {
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem(ACCESS_TOKEN))}
        };

        axios.post('http://localhost:5000/checkPicture5', "", config)

         2) nacin
         axios.get('http://localhost:5000/edit/' + this.props.match.params.id)*/

        setTimeout(() => {
            axios.get('http://localhost:5000/confirmation/' + token)
                .then(response => {

                    if (response.data.success === false) {
                        this.props.history.push({
                            pathname: '/login',
                            state: { wrongTokenProps: 1, getUserId: response.data.id }
                        })
                    }
                    else {
                        this.props.history.push({
                            pathname: '/login',
                            state: { confirmCorrectTokenProps: 1}
                        })
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    console.log("GRESKAAA BBBBBBB");
                    window.location = "/login"
                })
        }, 2000);
    }


    render() {

        if (this.state.isLoading === false) {
            return  <div>
                        <LoadingIndicatorCenter/>
                        <p style={{ textAlign: "center", width: '500px', height: '200px', marginLeft: '25%',
                            marginRight: '25%', color: "red" , marginTop: '10%'}}>Loading.. Please wait while we are confirming link.</p>
                    </div>
        }
    }
}