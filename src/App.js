import React from 'react';
import { useState , useEffect} from 'react';
import './App.css';
import {Card,CardContent , FormControl, Select, MenuItem} from '@material-ui/core';
import InfoBox from './components/InfoBox';
import Map from  './components/Map';
import Table from './components/Table';
import { sortData, prettyPrintStat } from './util';
import 'leaflet/dist/leaflet.css';
import numeral from 'numeral';
import { VictoryChart, VictoryLine, VictoryLegend,VictoryPie,VictoryAxis,VictoryTooltip } from 'victory';
import {FormHelperText, Grid, Button} from '@material-ui/core';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';



function App() {

  const [countryInfo ,setCountryInfo]=useState({})
  const [countries,setCountries]=useState([])
  const [country,setCountry]=useState('Worldwide')
  const [tableData,setTableData]=useState([])
  const [mapCenter , setMapCenter]=useState({lat:34.80746, lng:-40.4796})
  const [mapZoom,setMapZoom]=useState(3)
  const [mapCountries,setMapCountries]=useState([])
  const [casesType , setCasesType]= useState("cases")
  const [historicalData, setHistoricalData] = useState({});
  const [countryHistoricalData, setCountryHistoricalData] = useState({});
  const [countryFullName ,setCountryFullName] = useState("Worldwide")
  const [chartData, setChartData] = useState([]);
  const defaultStartDate = new Date(2020, 0, 1);
  const defaultEndDate = new Date(2023, 6, 20); 
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [vaccineData, setVaccineData] = useState([]);
  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };
  

  
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch('https://disease.sh/v3/covid-19/historical/all?lastdays=all');
        const data = await response.json();
        setHistoricalData(data);
        setCountryHistoricalData(data);

        const casesData = data[casesType];
      
        const chartData = Object.entries(casesData).map(([date, cases]) => ({
          x: new Date(date),
          y: cases,
        }));

        setChartData(chartData);
        
        
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchHistoricalData();
  }, []);
   
  const buildChartData = (casesType) => {
    if(casesType !=='recovered'){
    const data = countryHistoricalData[casesType];
    const chartData = [];

    for (let date in data) {
      if (data.hasOwnProperty(date)) {
        const newDataPoint = {
          x: new Date(date),
          y: data[date],
        };
        chartData.push(newDataPoint);
      }
    }

    return chartData;
  }
  else{
    const data = countryHistoricalData[casesType];
    const chartData = [];

    for (let date in data) {
      if (data.hasOwnProperty(date)) {
        const currentDate = new Date(date);
        if (currentDate.getFullYear() <= 2020) {
          const newDataPoint = {
            x: currentDate,
            y: data[date],
          };
          chartData.push(newDataPoint);
        }
      }
    }
    
    return chartData;
  }};


  const data = buildChartData(casesType);
  const formatXValue = (x) => {
    return new Date(x).getFullYear().toString();
  };

  const formatYValue = (y) => {
    if(country === "Worldwide" || casesType==='cases' || casesType=== 'recovered'){
    return `${(y / 1000000).toFixed(1)}M`;}
    else {
      return `${(y / 100000).toFixed(1)}HK`;
    }}

  const formatYValueForVaccines = (y) => {
      if(country === "Worldwide"){
      return `${(y / 1000000000).toFixed(1)}B`;}
      else {
        return `${(y / 1000000).toFixed(1)}M`;
      }
    }

  
  const formatXAxis = (x) => {
    const date = new Date(x);
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  };
  // CHARTS END


  // NEW CODE 
  const filteredData = data.filter(
    (item) =>
      item.x >= startDate &&
      item.x <= endDate
  );
  



  const [contData, setContData] = useState([]);

  useEffect(() => {
    fetchContData();
  }, [casesType]);

  const fetchContData = async () => {
    try {
      const response = await fetch('https://disease.sh/v3/covid-19/continents');
      const data = await response.json();
      const Data1 = data.map((continent) => ({
        x: continent.continent,
        y: continent[casesType],  
      }));
      setContData(Data1);
    } catch (error) {
      console.log('Error fetching data:', error);
    }
  };
  
  const colorScale = ['#008000', '#0000FF', '#FF0000', '#FFFF00', '#A52A2A', '#800080'];

  
  
  useEffect(() => {
    const fetchData = async () => {
    if(country !== 'Worldwide'){
      try {
        const response = await fetch(
          `https://disease.sh/v3/covid-19/vaccine/coverage/countries/${country}?lastdays=all&fullData=true`
        );
        const data = await response.json();
        const timeline = data.timeline;
        const Data2= {};
       for(let i = 0 ; i< timeline.length; i++){
            Data2[timeline[i]["date"]]=timeline[i]['total'];
      }

      const Data3 = Object.keys(Data2).map((date) => ({
        x: new Date(date),
        y: Data2[date],
      }));

        setVaccineData(Data3);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    else{

      try {
        const response = await fetch(
          'https://disease.sh/v3/covid-19/vaccine/coverage?lastdays=all&fullData=true'
        );
        const data = await response.json();
    
        const Data2= {};
       for(let i = 0 ; i< data.length; i++){
            Data2[data[i]["date"]]=data[i]['total'];
      }

      const Data3 = Object.keys(Data2).map((date) => ({
        x: new Date(date),
        y: Data2[date],
      }));

        setVaccineData(Data3);
      } catch (error) {
        console.error('Error fetching data:', error);
      }

    }
  };

    fetchData();
  }, [country]);



  
  // NEW CODE  END

  useEffect(() => {
     fetch('https://disease.sh/v3/covid-19/all')
     .then(response => response.json())
     .then(data => setCountryInfo(data))    
  },[])

  useEffect(()=> {
    const getData=async () => {
    await fetch("https://disease.sh/v3/covid-19/countries")
     .then(response => response.json())
     .then(data => {
       const countries = data.map(item => (
        {
        name:item.country,
        value : item.countryInfo.iso2
       }
       ))
       const sortedData =sortData(data)
       setTableData(sortedData)
       setMapCountries(data)
       setCountries(countries)
     })
   }
   getData()
  },[])
  
  
  const onCountryChange = async e => {
    try{
    const url = e.target.value === 'Worldwide' ? "https://disease.sh/v3/covid-19/all" : `https://disease.sh/v3/covid-19/countries/${e.target.value}`
    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry( e.target.value )
      setCountryInfo(data)
      if(e.target.value !=="Worldwide"){
        setMapCenter([data.countryInfo.lat ,data.countryInfo.long])}
      setMapZoom(4)
    })
    if (e.target.value !== "Worldwide"){
      const url = `https://disease.sh/v3/covid-19/historical/${e.target.value}?lastdays=all`
      await fetch(url)
        .then(response => response.json())
        .then(data => {
          setCountryHistoricalData(data.timeline);
          setCountryFullName(data.country);

        const casesData = data.timeline[casesType];
                        
        const chartData = Object.entries(casesData).map(([date, cases]) => ({
          x: new Date(date),
          y: cases,
        }));

        setChartData(chartData);
        
        })
    }
    else {
      const url = 'https://disease.sh/v3/covid-19/historical/all?lastdays=all'
      await fetch(url)
        .then(response => response.json())
        .then(data => {
          setCountryHistoricalData(data);
          setCountryFullName("Worldwide");
        
        const casesData = data[casesType];
                           
        const chartData = Object.entries(casesData).map(([date, cases]) => ({
          x: new Date(date),
          y: cases,
        }));

        setChartData(chartData);
     
        })
      }
    }catch (error) {
      console.error('Error fetching data:', error);
    }

  };

  
  return (
    <div className="app">
      <div className="app_left">
      <div className='app_header'>
     <h1>COVID-19 DASHBOARD</h1>
    </div>
    <Map countries={mapCountries} casesType={casesType} center={mapCenter} zoom={mapZoom} />
    <FormControl fullWidth ClassName='app_dropdown'>
      <Select variant="outlined" value={country} onChange={onCountryChange}>
        <MenuItem value="Worldwide">Worldwide</MenuItem>
        {countries.map(country => <MenuItem value={country.value}>{country.name}
        </MenuItem>)}
      </Select>
     </FormControl>
     <hr style={{ marginBottom: '5px' }} />
    <div className="app_stats">
      <InfoBox onClick={() => setCasesType("cases")} title="CoronaVirus Cases" cases={prettyPrintStat(countryInfo.todayCases)} total={numeral(countryInfo.cases).format("0.0a")} />
      <InfoBox onClick={() => setCasesType("recovered")} title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={numeral(countryInfo.recovered).format("0.0a")} />
      <InfoBox onClick={() => setCasesType("deaths")} title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={numeral(countryInfo.deaths).format("0.0a")} />
      </div> 
     <div className="app_charts">
     <h1>Visualising the data</h1>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={handleStartDateChange}
              format="yyyy-MM-dd"
              disableToolbar
              variant="inline"
              inputVariant="outlined"
            />
          </MuiPickersUtilsProvider>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={handleEndDateChange}
              format="yyyy-MM-dd"
              disableToolbar
              variant="inline"
              inputVariant="outlined"
            />
          </MuiPickersUtilsProvider>
        </FormControl>
      </Grid>
    </Grid> 
    <hr style={{ marginBottom: '20px' }} />
    <h1 style={{fontSize : '25px'}}> Comparing Continents on {casesType}</h1>
      <VictoryLegend
          x={0}
          y={0}
          gutter={80}
          style={{ border: { stroke: 'black' }, labels: { fontSize: 11 } }} 
          data={contData.map((continentData, index) => ({
            name: `${continentData.x} (${continentData.y})`,
            symbol : { fill: colorScale[index] },
          }))}
          />
    <hr style={{ marginBottom: '20px' }} />
    <h1 style={{fontSize : '27px'}}> Displaying Vaccine Distribution  for : {countryFullName}
      </h1>

 </div> 
</div>

    <Card className="app_right">
     <CardContent>
      <h3>Live Total Cases by Country</h3>
      <Table countries={tableData} />
      <h3> {countryFullName} Total {casesType} </h3>
      <VictoryChart
      width={400}
      height={280}
      scale={{ x: 'time' }}
      domainPadding={{ x: 20 }}
    >
      <VictoryAxis
        tickFormat={(x) => formatXValue(x)}
        style={{
          tickLabels: { fontSize: 10 },
        }}
        label ="Year"
      />
      <VictoryAxis
        dependentAxis
        tickFormat={(y) => formatYValue(y)}
        style={{
          tickLabels: { fontSize: 10 },
        }}
      />
      <VictoryLine
        data={data}
        x="x"
        y="y"
        style={{
          data: { stroke: '#CC1034' },
          parent: { border: '1px solid #ccc' }
        }}
        labels={({ datum }) => numeral(datum.y).format('0,0')}
        labelComponent={<VictoryTooltip />}
      />
    </VictoryChart>
    
    <VictoryChart>
        <VictoryAxis
          dependentAxis
          tickFormat={(y) => formatYValue(y)}
        style={{
          tickLabels: { fontSize: 10 },
        }}
        />
        <VictoryAxis
          label=""
          style={{ axisLabel: { padding: 30 }, tickLabels: { angle: 30, textAnchor: 'start' ,fontSize:10 } }}
          tickFormat={formatXAxis}
        />
        <VictoryLine
          data={filteredData}
          x="x"
          y="y"
          style={{ data: { stroke: 'blue' } }}
        />
      </VictoryChart>
     
     
      <VictoryPie
            width={200}
            height={200}
            labelRadius={80}
            data={contData}
            colorScale={colorScale}
            style={{ labels: { fill: 'transparent', fontSize: 5 } }} 
          />
      
<VictoryChart
       width={400}
       height={280}>
        <VictoryAxis
          style={{ axisLabel: { padding: 30 }, tickLabels: { angle: 30, textAnchor: 'start' ,fontSize:10 } }}
          tickFormat={formatXAxis}
        />
        <VictoryAxis dependentAxis
          tickFormat={(y) => formatYValueForVaccines(y)}
          style={{ tickLabels: { fontSize: 10 }}}
             />
        <VictoryLine data={vaccineData} 
          x="x" 
          y="y"  
          style={{ data: { stroke: 'blue' } }}/>
      </VictoryChart>


    </CardContent>
    </Card>
  </div>  
  );
}

export default App;
