import React from 'react';
import './App.css';
import Highcharts from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import funds from "../src/funds.json"

class App extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            startTime: null,
            investment: 10000,
            chartOptions: {
                legend: {
                    enabled: true,
                    align: 'right',
                    verticalAlign: 'top',
                    layout: 'vertical',
                    x: 0,
                    y: 100
                },
                rangeSelector: {
                    buttons: [{
                        type: 'ytd',
                        text: 'YTD'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1Y',
                    },{
                        type: 'year',
                        count: 3,
                        text: '3Y'
                    }, {
                        type: 'year',
                        count: 5,
                        text: '5Y'
                    }, {
                        type: 'year',
                        count: 10,
                        text: '10Y'
                    }]
                },
                title: {
                    text: 'Funds Growth Chart'
                },
                series: null,
                navigator: {
                    enabled: false
                },
                scrollbar: {
                    enabled: false
                },
                yAxis: {
                    plotLines: [{
                        value: 0,
                        width: 2,
                        color: 'silver'
                    }]
                },
                xAxis: {
                    floor: null,
                },
                tooltip: {
                    valueDecimals: 2
                },
                chart: {
                    marginRight: 150,
                    events: {
                        redraw: this.onZoom.bind(this)
                    }
                },
            },
        };
    }

    //set states when mounted
    componentDidMount = () => {
        let startTime = this.startTime();

        this.setState((state, props) => ({
            startTime:  startTime,
            chartOptions: {
                series: this.createSeries(startTime),
                xAxis: {
                    floor: startTime,
                }
            }
        }))
    };

    //find the time where all funds exists
    startTime = () =>  {
        let time = 0;
        funds.forEach((fund) => {
            time = ((fund.monthlyReturns[0][0] > time) ? fund.monthlyReturns[0][0] : time)
        });

        return time;
    };

    //creating data for compound growth based on percentage growth
    getDataSet = (returns, time) => {
        let data = [];
        let temp = this.state.investment;

        for(let i = 0 ; i < returns.length; i++){
            //set investment as $10000 based on start time on the x axis (min)
            if(returns[i][0] > time){
                temp = temp * (1 + (returns[i][1]/100));
            }
            data.push([returns[i][0], temp])
        }
        return data;
    };

    //create chart series.
    createSeries = (time) => {
        let data = [];
        funds.forEach((fund) => {
            let series = {
                name: fund.symbols,
                data: this.getDataSet(fund.monthlyReturns, time),
                visible: true,
                showInLegend: true
            };

            data.push(series);
        });
        return data;
    };

    //when changing the zoom or date of the chart. It'll update series so that the first plot is the $10k investment.
    onZoom = (e) => {
        if(this.state.startDate !== e.target.xAxis[0].min){
            this.setState((state, props) => ({
                startDate: e.target.xAxis[0].min,
                chartOptions: {
                    series: this.createSeries(e.target.xAxis[0].min),
                },
            }));
        }
    };

    render(){
        const { chartOptions } = this.state;

        return (
            <div>
                <HighchartsReact
                    highcharts={Highcharts}
                    constructorType={'stockChart'}
                    options={chartOptions}
                />
            </div>
        );
    }
}




export default App;
