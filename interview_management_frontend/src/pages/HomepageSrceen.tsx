import React from "react";
import { Helmet } from 'react-helmet';
export function HomePage() {
    return (
        <section>
            <Helmet>
                <title>Home Page</title>
            </Helmet>
            <div className="tab-content">
                
                    <img src={require('../fpt.png')} alt="Logo" style={{width:'100%'}} />
            </div>
        </section>

    );

}