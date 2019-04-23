import React, {Component} from 'react';
import '../util/common.css';
import {ACCESS_TOKEN, CURRENT_USER} from "../constants";
import axios from "axios";
import LoadingIndicatorBesideElement from "./LoadingIndicatorBesideElement";

export default class ConfirmLoginComponent extends Component {

    constructor(props) {
        super(props);

        this.onChangeQR_CODE = this.onChangeQR_CODE.bind(this)
        this.onChangeSMS_INSERT_PHONE = this.onChangeSMS_INSERT_PHONE.bind(this)
        this.onConfirmOptionSelect = this.onConfirmOptionSelect.bind(this)
        this.onSubmit_DISABLED_QR_CODE = this.onSubmit_DISABLED_QR_CODE.bind(this)
        this.onSubmitQR_Enabled = this.onSubmitQR_Enabled.bind(this)
        this.onSubmitSMS_INSERT_PHONE = this.onSubmitSMS_INSERT_PHONE.bind(this)
        this.onSubmitSMS_CONFIRM = this.onSubmitSMS_CONFIRM.bind(this)

        this.state = {
            loading: false,
            qurCode: '',
            tempSecret: '',
            dataURL: '',
            otpURL: '',
            chooseConfirmOption: 'nothing',
            phoneNumber: '',
            verificationPhoneNumber: '',
            errorMessageToDisplay: ''
            // nothing user did not select anything,
            // qr_code user did select qr_code confirmation
            // sms confirmation
        }
    }

    componentDidMount() {

        // In App.js we have a function that draw orange menu indicator by index
        // index of menu orange indicator
        let menuOrangeIndicator = 0;
        this.props.passClick(menuOrangeIndicator);
    }

    onChangeQR_CODE(e) {
        this.setState({
            qurCode: e.target.value
        });
    }

    onConfirmOptionSelect(e) {

        // AKO JE KORISNIK IZABRAO QR CODE, PRVO BI MORAO PROVJERITI DA LI JE UNESEO VEC QR CODE
        // TO PRROVJERAVAM NA UZ POMOC LOCAL STORAGE AKO JE UNESEL QR_CODE i ONDA NA TEMELJU TOGA MU CRTAM PONOVNO SCREEN
        // JER IMAM DVIJE MOGUCNOSTI CRTANJA, KAD JE UNESEL QR_CODE i KAD NIJE

        // TU MOZDA ZBOG TOGA NEBI MORAO BITI TAJ SET STATE, NEGO SE TO CRTA U ODNOSU NA LOCAL _STORAGE, TJ

        if (e.target.value === "QR_CODE") {

            let getUserData = JSON.parse(localStorage.getItem(CURRENT_USER))
            const userData = {
                id: getUserData.id,
                enabledQR: getUserData.enabledQR
            }

            // ZNACI AKO USER NIJE JOS NITI JEDANPUT UNIO QR CODE, TU GA ONDA PRVI PUT UNOSI
            // A SVAKI SLIJEDECI PUT BUDE ISAO NA ELSE
            if (userData.enabledQR === 0) {

                axios.post('https://localhost:5000/twofactor/setup', userData)
                    .then(response => {

                        this.setState({
                            chooseConfirmOption: "QR_CODE_DISABLED",
                            tempSecret: response.data.tempSecret,
                            dataURL: response.data.dataURL,
                            otpURL: response.data.otpURL,
                            loading: false
                        });

                        // to je provjera za stari nacin KORISTENJA SQL query, dok nisam koristio ORM za SQL query
                        //console.log("response je: " + this.state.currentUser[0].username)
                        // provjera za novi nacin KORISTENJA SQL QUERY, KORISTI SE ORM za SQL
                        /* console.log("temp secret response je: " + this.state.tempSecret)
                        console.log("response je: " + this.state.dataURL)
                        console.log("response je: " + this.state.otpURL)
                        console.log("response je: " + this.state.qurCode) */
                    })
                    .catch(function (error) {
                        console.log(error);
                        console.log("GRESKAAA DDDD");
                    })
            }
            else {

                this.setState({
                    chooseConfirmOption: "QR_CODE_ENABLED",
                    loading: false
                });
            }
        }
        else {

            this.setState({
                chooseConfirmOption: "SMS_INSERT_PHONE_NUMBER",
                loading: false
            });
            // TODO možda će tu nešto ici za SMS confirmation
        }
    }

    onSubmitQR_Enabled(e) {

        e.preventDefault();

        let getUserData = JSON.parse(localStorage.getItem(CURRENT_USER))
        const userData = {
            id: getUserData.id,
            enabledQR: getUserData.enabledQR
        }

        const serverport = {
            qrcode: this.state.qurCode,
            userId: userData.id
        }

        this.setState({
            loading: true
        });

        setTimeout(() => {

            axios.post('https://localhost:5000/twofactor/verify_QR_enabled', serverport)
                .then(res => {
                    //localStorage.setItem(USERNAME, JSON.stringify(res.data));

                    if (res.data.success === true) {

                        localStorage.setItem(ACCESS_TOKEN, JSON.stringify(res.data.token));
                        this.props.onLogin()
                    }
                })
                .catch(error => {
                    this.setState({
                        loading: false,
                        errorMessageToDisplay: error.response.data.message
                    });
                    console.log("GRESKAAA ANDREJAAAA KRIVI RESPONSE" + this.state.errorMessageToDisplay);
                });
        }, 500);
    }

    onSubmit_DISABLED_QR_CODE(e) {

        e.preventDefault();

        let getUserData = JSON.parse(localStorage.getItem(CURRENT_USER))
        const userData = {
            id: getUserData.id,
            enabledQR: getUserData.enabledQR
        }

        const serverport = {
            qrcode: this.state.qurCode,
            userId: userData.id,
            secret_key: this.state.tempSecret
        }

        this.setState({
            loading: true
        });

        setTimeout(() => {

            axios.post('https://localhost:5000/twofactor/verify', serverport)
                .then(res => {

                    //localStorage.setItem(USERNAME, JSON.stringify(res.data));

                    if (res.data.success === true) {

                        localStorage.setItem(ACCESS_TOKEN, JSON.stringify(res.data.token));
                        this.props.onLogin()
                    }
                })
                .catch(error => {
                    this.setState({
                        loading: false,
                        errorMessageToDisplay: error.response.data.message
                    });
                    console.log("GRESKAAA ANDREJAAAA KRIVI RESPONSE" + this.state.errorMessageToDisplay);
                });
        }, 500);
    }


    onChangeSMS_INSERT_PHONE(e) {

        this.setState({
            phoneNumber: e.target.value
        });
    }

    onSubmitSMS_INSERT_PHONE() {

        const userData = {
            //id: getUserData.id,
            phoneNumber: this.state.phoneNumber
        }

        axios.post('https://localhost:5000/sms/insertPhone', userData)
            .then(response => {

                this.setState({
                    //chooseConfirmOption: "QR_CODE_DISABLED",
                    //tempSecret: response.data.tempSecret,
                    chooseConfirmOption: "SMS_CONFIRM_PHONE_NUMBER",
                    verificationPhoneNumber : response.data.verificationPhoneNumber,
                    loading: false
                });

                /* console.log("temp secret response je: " + this.state.tempSecret)
                console.log("response je: " + this.state.dataURL) */
            })
            .catch(function (error) {
                console.log(error);
                console.log("GRESKAAA DDDD");
            })
    }

    onSubmitSMS_CONFIRM() {

    }


    render() {

        let getButtonClickAllowed = "";
        if (this.state.qurCode !== "" || this.state.phoneNumber) {

            getButtonClickAllowed = true
        }
        else {
            getButtonClickAllowed = false
        }

        let buttonClickAllowed = getButtonClickAllowed ? "button_allowed" : "button_disabled";

        return (
            <div style={{marginTop: 30}}>
                <div style={{display: "inline"}}>

                    <h3 style={{display: "inline"}}>Confirm Login</h3>

                    <p> Please choose how you would like to confirm login.
                    </p>

                    <div onChange={this.onConfirmOptionSelect.bind(this)}>
                        <input type="radio" name="gender" value="QR_CODE"/> QR_CODE <br/>
                        <input type="radio" name="gender" value="SMS"/> SMS <br/>
                    </div>

                    {this.state.numberOfRows === 1 &&

                        <p className="popUpCorrectResponse">Now you just need to confirm link on your email account. </p>
                    }

                </div>
                {this.state.chooseConfirmOption === "QR_CODE_ENABLED" &&

                <form onSubmit={this.onSubmitQR_Enabled}>

                    <p style={{marginTop: '20px'}}>You can scan QR code with google authentificator on mobile phone or
                        web browser.
                        <br/>You just need to download app or install plugin in google chrome</p>

                    <input type="text" value={this.state.qurCode} className="form-control"
                           onChange={this.onChangeQR_CODE.bind(this)}/>

                    {this.state.errorMessageToDisplay !== ''  &&

                        <p style={{color: "red"}}> {this.state.errorMessageToDisplay} </p>
                    }

                    <input type="submit" value="Confirm Login" className={buttonClickAllowed}
                           disabled={!getButtonClickAllowed} style={{marginTop: '20px'}}/>

                    {this.state.loading === true &&
                        <LoadingIndicatorBesideElement/>
                    }
                </form>
                }
                {this.state.chooseConfirmOption === "QR_CODE_DISABLED" &&

                <form onSubmit={this.onSubmit_DISABLED_QR_CODE}>

                    <p style={{marginTop: '20px'}}>You can scan QR code with google authentificator on mobile phone or
                        web browser.
                        <br/>You just need to download app or install plugin in google chrome</p>

                    <img src={this.state.dataURL} alt="" className="img-thumbnail"/>

                    <input type="text" value={this.state.qurCode} className="form-control"
                           onChange={this.onChangeQR_CODE.bind(this)} style={{marginTop: '20px'}}/>

                    {this.state.errorMessageToDisplay !== ''  &&

                        <p style={{color: "red"}}> {this.state.errorMessageToDisplay} </p>
                    }

                    <input type="submit" value="Confirm Login" className={buttonClickAllowed}
                           disabled={!getButtonClickAllowed} style={{marginTop: '20px'}}/>

                    {this.state.loading === true &&
                        <LoadingIndicatorBesideElement/>
                    }
                </form>
                }
                {this.state.chooseConfirmOption === "SMS_INSERT_PHONE_NUMBER" &&
                <form onSubmit={this.onSubmitSMS_INSERT_PHONE}>

                    <input type="text" value={this.state.phoneNumber} className="form-control"
                           onChange={this.onChangeSMS_INSERT_PHONE.bind(this)}/>

                    <input type="submit" value="Confirm Login" className={buttonClickAllowed}
                           disabled={!getButtonClickAllowed} style={{marginTop: '20px'}}/>

                </form>
                }
                {this.state.chooseConfirmOption === "SMS_CONFIRM_PHONE_NUMBER" &&
                <form onSubmit={this.onSubmitSMS_INSERT_PHONE}>

                    <input type="text" value={this.state.phoneNumber} className="form-control"
                           onChange={this.onChangeSMS_INSERT_PHONE.bind(this)}/>

                    <input type="submit" value="Confirm Login" className={buttonClickAllowed}
                           disabled={!getButtonClickAllowed} style={{marginTop: '20px'}}/>

                </form>
                }
            </div>
        )
    }
}