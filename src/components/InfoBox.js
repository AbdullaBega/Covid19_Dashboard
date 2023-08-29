import React from 'react';
import {Card ,CardContent ,Typography} from '@material-ui/core';
import './InfoBox.css'; 

const InfoBox = ({title ,cases, total ,onClick }) => {
    return (
        <Card onClick={onClick} classname={"InfoBox"}>
            <CardContent>
                <Typography
                    classname="InfoBox_title"
                    color="textSecondary">
                {title}</Typography>
                <h2 classname={"InfoBox__cases"}>{cases}</h2>
                <Typography
                   classname="InfoBox_total"
                   color="textSecondary">
                {total} Total
                </Typography>
            </CardContent>
        </Card>
    )
}

export default InfoBox;