import React, { Component } from 'react';
import axios from 'axios';
import TableRow from './TableRow';
import {withRouter} from "react-router-dom";

class IndexComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            serverports: [],
            reloadData: false
        };

        this.reloadDataAfterDeletingOneItem = this.reloadDataAfterDeletingOneItem.bind(this);
    }

    componentDidMount(){

        // In App.js we have a function that draw orange menu indicator by index
        let menuOrangeIndicator = 0;
        this.props.passClick(menuOrangeIndicator);
        // I don't need to call here this  1)  let menuOrangeIndicator = 1;
        //  2)  this.props.passClick(menuOrangeIndicator);  ,,, because by default it calls this route
        axios.get('http://localhost:5000/index')
            .then(response => {

                this.setState({
                    serverports: response.data
                });

                for (var i=0; i < this.state.serverports.length; i++) {
                    // do something with temp[i]
                    // something like temp[i].symbol is valid!
                    //console.log("Ime je: " + this.state.serverports[i].name );
                }
                //console.log("INDEX 2: podaci od customera: " + this.state.serverports[0].id);
            })
            .catch(function (error) {
                console.log(error);
                console.log("GRESKAAA");
            })
    }

    reloadDataAfterDeletingOneItem(e) {
        this.componentDidMount()
    }


    tabRow(passClick, reloadDataAfterDeletingOneItem){
        if( this.state.serverports.length > 0 )
        return this.state.serverports.map(function(object, i){
            return <TableRow obj = {object}
                             key = {i}
                             passClick = {passClick}
                             reloadDataAfterDelete = { reloadDataAfterDeletingOneItem }/>;
        });
    }

    render() {

        let passClick = this.props.passClick;

        return (
            <div className="container">

                <table className="table table-striped">
                    <thead >
                    <tr>
                        <td>ID</td>
                        <td>Name</td>
                        <td>Address</td>
                        <td>Update</td>
                        <td>Delete</td>
                    </tr>
                    </thead>
                    <tbody>
                        { this.tabRow(passClick, this.reloadDataAfterDeletingOneItem) }
                    </tbody>
                </table>
            </div>
        );
    }
}


export default  withRouter(IndexComponent);