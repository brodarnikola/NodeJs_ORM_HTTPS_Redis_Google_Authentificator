import {CUSTOMER_NAME_ADDRESS_MIN_LENGTH, CUSTOMER_NAME_ADDRESS_MAX_LENGTH} from '../constants';




export function validateEmail(email) {

    if ((email.length ) < CUSTOMER_NAME_ADDRESS_MIN_LENGTH) {
        return `Email is too short (Minimum ${CUSTOMER_NAME_ADDRESS_MIN_LENGTH} characters needed.)`
    } else if (email.length > CUSTOMER_NAME_ADDRESS_MAX_LENGTH) {
        return `Email is too long (Maximum ${CUSTOMER_NAME_ADDRESS_MAX_LENGTH} characters allowed.)`
    } else {
        return ""
    }
}


export function validateUsername(username) {

    if ((username.length ) < CUSTOMER_NAME_ADDRESS_MIN_LENGTH) {
        return `Username is too short (Minimum ${CUSTOMER_NAME_ADDRESS_MIN_LENGTH} characters needed.)`
    } else if (username.length > CUSTOMER_NAME_ADDRESS_MAX_LENGTH) {
        return `Username is too long (Maximum ${CUSTOMER_NAME_ADDRESS_MAX_LENGTH} characters allowed.)`
    } else {
        return ""
    }
}


export function validatePassword(password) {

    if ((password.length ) < CUSTOMER_NAME_ADDRESS_MIN_LENGTH) {
        return `Password is too short (Minimum ${CUSTOMER_NAME_ADDRESS_MIN_LENGTH} characters needed.)`
    } else if (password.length > CUSTOMER_NAME_ADDRESS_MAX_LENGTH) {
        return `Password is too long (Maximum ${CUSTOMER_NAME_ADDRESS_MAX_LENGTH} characters allowed.)`
    } else {
        return ""
    }
}


export function validateCustomerName(userNameSurname) {

    if ((userNameSurname.length ) < CUSTOMER_NAME_ADDRESS_MIN_LENGTH) {
        return `User name and surname is too short (Minimum ${CUSTOMER_NAME_ADDRESS_MIN_LENGTH} characters needed.)`
    } else if (userNameSurname.length > CUSTOMER_NAME_ADDRESS_MAX_LENGTH) {
        return `User name and surname is too long (Maximum ${CUSTOMER_NAME_ADDRESS_MAX_LENGTH} characters allowed.)`
    } else {
        return ""
    }
}

export function validateCustomerAddres(customerAddress) {

    if ((customerAddress.length ) < CUSTOMER_NAME_ADDRESS_MIN_LENGTH) {
        return `Address is too short (Minimum ${CUSTOMER_NAME_ADDRESS_MIN_LENGTH} characters needed.)`
    } else if (customerAddress.length > CUSTOMER_NAME_ADDRESS_MAX_LENGTH) {
        return `Address is too long (Maximum ${CUSTOMER_NAME_ADDRESS_MAX_LENGTH} characters allowed.)`
    } else {
        return ""
    }
}


