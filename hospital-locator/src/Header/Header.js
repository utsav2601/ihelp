import React, { useState } from "react";
import "./Header.css";
import { LocationWidget } from "../Location/LocationWidget";
import "../SearchBar/SearchBar";
import { getNearByHospitalsFromLocation, useLocation} from "../Location/Location";
function Header() {
    const renderHeader = () => {
        return (
            <div className="header-root">
                <h1>Covid Resources</h1>
                <LocationWidget />
            </div>
        )
    }

    return (
        renderHeader()
    )
}




export { Header };
