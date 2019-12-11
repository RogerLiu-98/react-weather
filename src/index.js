import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import './index.css';
import {Avatar, Input, List} from "antd";
import axios from "axios";

const {Search} = Input;
const date = new Date();
// Use a dictionary to translate the icon which is in English to Chinese
const weatherDict = {
    "clear-day": "晴天",
    "clear-night": "清夜",
    "cloudy": "多云",
    "fog": "雾",
    "partly-cloudy-day": "局部多云",
    "partly-cloudy-night": "局部多云",
    "wind": "大风",
    "snow": "雪",
    "rain": "雨",
    "sleet": "雨夹雪"
};

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            baseUrl: 'https://api.darksky.net/forecast/fab65de022b3477cc37e14796f99627b/37.8267,-122.4233?lang=zh&units=si',
            timezone: "",
            lat: "",
            lng: "",
            current_data: {},
            today_data: {},
            tomorrow_data: {},
            day_after_tomorrow_data: {},
            loading: true
        };
    }

    componentDidMount() {
        this.getLocation();
    }

    fetchData = (url, callback) => {
        axios.get(url)
            .then(res => {
                callback(res)
            })
            .catch(err => {
                console.log(err)
            })
    };

    windDirection = windBearing => {
        if (windBearing > 0 && windBearing <= 90) {
            return "东北风";
        } else if (windBearing > 90 && windBearing <= 180) {
            return "东南风";
        } else if (windBearing > 180 && windBearing <= 270) {
            return "西南风";
        } else if (windBearing > 270 && windBearing <= 360) {
            return "西北风";
        } else if (windBearing === 0) {
            return "未知";
        }
    };

    getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                this.setState({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    baseUrl: "https://api.darksky.net/forecast/fab65de022b3477cc37e14796f99627b/" + position.coords.latitude + ", " + position.coords.longitude + "?lang=zh&units=si"
                }, callback => {
                    this.fetchData(this.state.baseUrl, res => {
                        this.setState({
                            timezone: res.data.timezone,
                            current_data: res.data.currently,
                            today_data: res.data.daily.data[0],
                            tomorrow_data: res.data.daily.data[1],
                            day_after_tomorrow_data: res.data.daily.data[2],
                            loading: false
                        })
                    })
                })
            })
        } else {
            this.setState({
                lat: -35.17,
                lng: 149.07,
                baseUrl: "https://api.darksky.net/forecast/fab65de022b3477cc37e14796f99627b/-35.17, 149.07?lang=zh&units=si"
            }, callback => {
                this.fetchData(this.state.baseUrl, res => {
                    this.setState({
                        timezone: res.data.timezone,
                        current_data: res.data.currently,
                        today_data: res.data.daily.data[0],
                        tomorrow_data: res.data.daily.data[1],
                        day_after_tomorrow_data: res.data.daily.data[2],
                        loading: false
                    })
                })
            })
            console.log("Geolocation is not supported by this browser")
        }
    }

    render() {
        return (
            <div className='Main' style={{backgroundImage: "url('pic/"+this.state.current_data.icon+"bg.png')" }}>
                <div className='content'>
                    <div className='search'>
                        <Search
                            className='searchBar'
                            placeholder="请输入城市名"
                            enterButton
                            size="large"
                            onSearch={value => {
                                this.fetchData("https://maps.googleapis.com/maps/api/geocode/json?address=" + value + "&key=AIzaSyBO6BM6qEG3f7yNdUyEtZG20H3pdCbnM88",
                                    res => {
                                        this.setState({
                                                baseUrl: 'https://api.darksky.net/forecast/fab65de022b3477cc37e14796f99627b/'
                                                    + res.data.results[0].geometry.location.lat
                                                    + ", "
                                                    + res.data.results[0].geometry.location.lng
                                                    + "?lang=zh&units=si",
                                            },
                                            () => {
                                                this.fetchData(this.state.baseUrl, res => {
                                                    //TODO: Use an iterator to set the data into state
                                                    this.setState({
                                                        timezone: res.data.timezone,
                                                        current_data: res.data.currently,
                                                        today_data: res.data.daily.data[0],
                                                        tomorrow_data: res.data.daily.data[1],
                                                        day_after_tomorrow_data: res.data.daily.data[2],
                                                        loading: false
                                                    })
                                                });
                                            })
                                    });
                            }}
                        >
                        </Search>
                    </div>
                    <div className='weather'>
                        <span className='temperature'>{Math.round(this.state.current_data.temperature) + "°C"}</span>
                        <span className='weatherIconText'>
                            <span className='weather-text'>{weatherDict[this.state.current_data.icon]}</span>
                            <img src={"pic/" + this.state.current_data.icon + ".png"}
                                 className='weather-icon' alt=""
                            />
                            </span>
                        <span className='wind'>{this.windDirection(this.state.current_data.windBearing)}</span>
                        <img className='windDirection-icon' src={"pic/windDirection.png"} alt=""/>
                        <span className='sunriseToSunset'>
                            <img className='sunrise' src='pic/sunrise.png' alt=''/>
                            <span className='line'/>
                            <img className='sunset' src='pic/sunset.png' alt=''/>
                            <span className='time'>
                            <span
                                className='sunriseTime'>{new Date(date.setTime(this.state.today_data.sunriseTime * 1000)).toLocaleTimeString('en-US', {timeZone: this.state.timezone})}</span>
                            <span
                                className='sunsetTime'>{new Date(date.setTime(this.state.today_data.sunsetTime * 1000)).toLocaleTimeString('en-US', {timeZone: this.state.timezone})}</span>
                            </span>
                            </span>
                    </div>
                    <div className='forecast'>
                        <List>
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar src={"pic/" + this.state.today_data.icon + ".png"}/>}
                                    title={new Date(date.setTime(this.state.today_data.time * 1000)).toLocaleDateString('en-US', {timeZone: this.state.timezone})}
                                    description={Math.round(this.state.today_data.temperatureMin) + "°C-" + Math.round(this.state.today_data.temperatureMax) + "°C"}
                                />
                                <span style={{fontWeight: "bold"}}>{weatherDict[this.state.today_data.icon]}</span>
                            </List.Item>
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar
                                        src={"pic/" + this.state.tomorrow_data.icon + ".png"}/>}
                                    title={new Date(date.setTime(this.state.tomorrow_data.time * 1000)).toLocaleDateString('en-US', {timeZone: this.state.timezone})}
                                    description={Math.round(this.state.tomorrow_data.temperatureMin) + "°C-" + Math.round(this.state.tomorrow_data.temperatureMax) + "°C"}
                                />
                                <span style={{fontWeight: "bold"}}>{weatherDict[this.state.tomorrow_data.icon]}</span>
                            </List.Item>
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar
                                        src={"pic/" + this.state.day_after_tomorrow_data.icon + ".png"}/>}
                                    title={new Date(date.setTime(this.state.day_after_tomorrow_data.time * 1000)).toLocaleDateString('en-US', {timeZone: this.state.timezone})}
                                    description={Math.round(this.state.day_after_tomorrow_data.temperatureMin) + "°C-" + Math.round(this.state.day_after_tomorrow_data.temperatureMax) + "°C"}
                                />
                                <span
                                    style={{fontWeight: "bold"}}>{weatherDict[this.state.day_after_tomorrow_data.icon]}</span>
                            </List.Item>
                        </List>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));