import React from 'react';

/*export default function LoadingIndicator(props) {
    const antIcon = <Icon type="loading-3-quarters" style={{ fontSize: 30 }} spin />;
    return (
        <Spin indicator={antIcon} style = {{display: 'block', textAlign: 'center', marginTop: 30}} />
    );
} */

export default function LoadingIndicatorBesideElement(props) {
    return (
          <img src={require('../images/smaller_spinner.gif')} alt={""} style={{ marginLeft: '10px'}}/>
    );
}