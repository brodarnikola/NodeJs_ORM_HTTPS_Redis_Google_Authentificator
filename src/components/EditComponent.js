import React, {Component} from 'react';
import axios from 'axios';
import LoadingIndicatorCenter from './LoadingIndicatorCenter';
import {withRouter} from "react-router-dom";
import {ACCESS_TOKEN} from "../constants";


class EditComponent extends Component {

    constructor(props) {
        super(props);
        this.onChangeHostName = this.onChangeHostName.bind(this);
        this.onChangePort = this.onChangePort.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            userId: '-1',
            name: '',
            address: '',
            loading: false,
            messageToDisplay: '',
            showMessage: false
        };
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

        // In App.js we have a function that draw orange menu indicator by index
        // index of menu orange indicator
        let menuOrangeIndicator = 3;
        this.props.passClick(menuOrangeIndicator);

        axios.get('https://localhost:5000/edit/' + this.props.match.params.id)
            .then(res => {

                // 1) IF I DON'T USE ORM, ONLY BASIC QUERY, THEN I NEED TO USE THIS STATEMENT
                /* this.setState({
                    name: res.data[0].name,
                    address: res.data[0].address
                }); */
                //console.log("ime: "+ res.data.name + " drugo ime: " + res.data[0].name);

                // 2) IF I USE ORM AND AdminRoutesORM.js, then it need to be written in this way
                if( res.data.success !== '-1' ) {
                    this.setState({
                        userId: res.data.success.id,
                        name: res.data.success.name,
                        address: res.data.success.address
                    });
                }
                else {
                    this.setState({
                        userId: '-1'
                    })
                }
            })
            .catch(function (error) {
                console.log("aaaaa: " + error);
            })
    }

    onChangeHostName(event) {
        this.setState({
            name: event.target.value
        });
    }

    onChangePort(event) {
        this.setState({
            address: event.target.value
        });
    }

    onSubmit(event) {

        event.preventDefault();

        if( this.state.userId !== '-1' ) {

            this.setState({
                loading: true
            })

            const userData = {
                name: this.state.name,
                address: this.state.address
            }

            console.log("zaustavi pokretanje")

            // 1 PRIMJER /////////////////////////////////////??????????????????
            // Ako bih želio kad korisnik klikne na update i sve se uspješno izvrši i ako ga želim odmah prebaciti
            // to bih tako da dodam 2 stvari:
            // 1) dodam tu naredbu  await res.redirect('http://localhost:5000/index'); i zakomentiram naredbu  res.send(result);
            // 2) uključim naredbu u EditComponent.js   " .then( res  => {
            //                     this.props.history.push('/index')
            //                     //setTimeout( () => { this.props.history.push('/index')  }, 10)
            //                 }
            //             ); "
            /* axios.post('http://localhost:5000/update/' + this.props.match.params.id, userData)
                .then(res =>
                        console.log("EDIT COMPONENT 111: " + res.data),

                    this.setState({
                        loading: false
                    })

                    //setTimeout( () => { this.props.history.push('/index')  }, 10)
                )
                .then(res => {
                        this.props.history.push('/index')
                        //setTimeout( () => { this.props.history.push('/index')  }, 10)
                }
            ); */

            setTimeout(() => {

                // 2 PRIMJER ///////////////////// ??????????????????????
                axios.post('https://localhost:5000/update/' + this.props.match.params.id, userData)
                    .then(res => {

                            this.setState({
                                messageToDisplay: res.data.success,
                                loading: false,
                                showMessage: true
                            })
                    });
            }, 500);
        }
        else {
            this.setState({
                userId: '-1',
                showMessage: true
            })
        }
    }

    render() {

        const userId = this.state.userId;

        const messageToDisplay = this.state.messageToDisplay;
        const showMessage = this.state.showMessage;

        if (this.state.loading) {
            return <LoadingIndicatorCenter/>;
        }

        return (
            <div style={{marginTop: 50}}>
                <h3>Edit customer</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label>Update customer name: </label>
                        <input type="text" value={this.state.name} className="form-control"
                               onChange={this.onChangeHostName}>
                        </input>
                    </div>
                    <div className="form-group">
                        <label>Update customer address: </label>
                        <input type="text" value={this.state.address} className="form-control"
                               onChange={this.onChangePort}/>
                    </div>
                    <div className="form-group">
                        <input type="submit" value="Update customer" className="btn btn-primary"/>
                    </div>
                </form>

                {showMessage === true && userId === '-1' &&
                    <p style={{color: 'red'}}>
                        <b> { 'You have not selected any user'}
                        </b>
                    </p>
                }
                {showMessage === true && userId !== '-1' &&
                    <p style={{color: 'red'}}>
                        <b> {messageToDisplay === true ? 'User has been successfully updated.' :
                            'User did not successfully updated. Please try again.'}
                        </b>
                    </p>
                }
            </div>
        )
    }
}


export default  withRouter(EditComponent);