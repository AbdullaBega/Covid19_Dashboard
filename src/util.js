import React from "react";
import numeral from "numeral";
import { Circle, Popup } from "react-leaflet";

const casesTypeColors = {
    cases: {
        hex: "#1d52d7",
        multiplier: 300,
    },
    recovered: {
        hex: "#7dd71d",
        multiplier: 400,
    },
    deaths: {
        hex: "#fb4443",
        multiplier: 2000,
    },
};


const getColor = (cases,casesType) => {
    const colors = {
      cases: {
        range: [0, 1000000],
        color: [255, 0, 0],
      },
      recovered: {
        range: [0, 1000000],
        color: [0, 255, 0],
      },
      deaths: {
        range: [0, 500000],
        color: [255, 0, 0],
      },
    };

    const { range, color } = colors[casesType];
    const fraction = (cases - range[0]) / (range[1] - range[0]);
    const red = fraction*255;

    return `rgb(${red}, ${color[1]}, ${color[2]})`;
  };



export const showDataOnMap = (data, casesType = "cases") => 
    data.map(country => (
        <Circle
            center={[country.countryInfo.lat, country.countryInfo.long]}
            color={getColor(country[casesType],casesType)}
            fillColor={getColor(country[casesType],casesType)}
            fillOpacity={0.4}
            radius={Math.sqrt(country[casesType]) * casesTypeColors[casesType].multiplier/10}
        >
            <Popup>
                <div className="info-container">
                    <div
                        className="info-flag"
                        style={{ backgroundImage: `url(${country.countryInfo.flag})` }}
                    ></div>
                    <div className="info-name">{country.country}</div>
                    <div className="info-confirmed">
                        Cases: {numeral(country.cases).format("0,0")}
                    </div>
                    <div className="info-recovered">
                        Recovered: {numeral(country.recovered).format("0,0")}
                    </div>
                    <div className="info-deaths">
                        Deaths: {numeral(country.deaths).format("0,0")}
                    </div>
                </div>
            </Popup>
        </Circle>
    ))



export const sortData =data => {
    const sortedData= [...data]
    return sortedData.sort((a,b) => a.cases > b.cases ? -1 : 1)
    
}

export const prettyPrintStat = (stat) => stat ? `+${numeral(stat).format("0.0a")}` : "+0";
