import React from 'react';

/*export default function LoadingIndicator(props) {
    const antIcon = <Icon type="loading-3-quarters" style={{ fontSize: 30 }} spin />;
    return (i
        <Spin indicator={antIcon} style = {{display: 'block', textAlign: 'center', marginTop: 30}} />
    );
} */

export default function LoadingIndicatorCenter(props) {
    return (
        <div style={{display: 'block', width: '100px', height: '100px', marginLeft: 'auto',
            marginRight: 'auto', marginTop: '10%'}}>
            <img src={require('../images/spinner.gif')} alt={""}/>
        </div>
    );
}