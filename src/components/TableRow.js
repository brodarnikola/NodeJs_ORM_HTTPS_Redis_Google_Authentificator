import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

class TableRow extends Component {

    constructor(props) {
        super(props);
        this.state = {
            reloadData: false
        };
        this.delete = this.delete.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    delete() {
          axios.get('http://localhost:5000/delete/'+this.props.obj.id)
            .then(
                res  => console.log("Deleted")
            )
            .then(res =>

                this.props.reloadDataAfterDelete()
                //setTimeout( () => { this.props.history.push('/index')  }, 10)
            )
            .catch(err => console.log(err))
    }

    handleClick(index) {
        this.props.passClick(index);
    }


    render() {

        return (
            <tr>
                <td>
                    {this.props.obj.id}
                </td>
                <td>
                    {this.props.obj.name}
                </td>
                <td>
                    {this.props.obj.address}
                </td>
                <td onClick={this.handleClick.bind(this, 2)}>
                    <Link to={"/edit/"+this.props.obj.id} className="btn btn-primary">Update</Link>
                </td>
                <td>
                    <button onClick={this.delete} className="btn btn-danger">Delete</button>
                </td>
            </tr>
        );
    }
}

export default TableRow;