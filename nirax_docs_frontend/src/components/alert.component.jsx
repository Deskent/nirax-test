import { useState } from 'react';
import { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

/*
    alert-secondary;
    alert-success;
    alert-danger;
    alert-warning;
    alert-info;
    alert-light;
    alert-dark.
 */

function Alert({ type="danger", messages=[] }) {
    const [visible, setVisible] = useState('flex');

    const close = () =>{
        setVisible('none');
    }

    useEffect(() => {
        setVisible('flex');
        const timer = setTimeout(() => {
                setVisible('none');
            }, 3000);
        return () => clearTimeout(timer);
    }, [messages]) 

    return (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: visible, alignItems: 'flex-start', justifyContent: 'center', pointerEvents: 'none'}} onClick={close}>
            <div className={`alert alert-${type}`} role="alert">
                {messages.map((error, i) => {
                    let text = error;
                    if(typeof( error)==="object")
                    {
                        text = JSON.stringify(error);
                    }
                    return (
                        <p key={i} className="mb-0 small">
                            {text}
                        </p>
                    )}
                )} 
            </div>
        </div>        
    );
}

export default Alert;