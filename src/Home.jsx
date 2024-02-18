import axios from "axios";
import { useRef, useState } from "react";

const Home = () => {
  const [forecastData, setForecastData] = useState(null);
  const [cityName, setCityName] = useState("");
  const [information, setInformation] = useState("");
  const [todayWeather, setTodayWeather] = useState(null);
  const [clickItem, setClickItem] = useState(null);

  const heandleinput = (e) => {
    setCityName(e.target.value);
  };

  const heandlesubmit = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=5c5702fdc20cd585f747d0d46c58d301`
      );
      setForecastData(response.data);
      const todayData = response.data.list.filter((item) => {
        const itemTimestamp = new Date(item.dt * 1000); // Convert seconds to milliseconds
        const todayTimestamp = new Date();
        todayTimestamp.setHours(0, 0, 0, 0); // Set time to the beginning of the day

        return itemTimestamp >= todayTimestamp;
      });

      setTodayWeather(todayData[0]); // Take the first item as representative
    } catch (error) {
      console.log(error);
    }
  };
  // fetchData();

  const [photo, setPhoto] = useState(null);
  const videoRef = useRef(null);
  let stream;
  const startCamera = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };
  const stopCamera = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop(true));
    }
  };

  const takePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const photoDataURL = canvas.toDataURL("image/png");
      setPhoto(photoDataURL);

      // Retrieve location information
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            reverseGeocode(latitude, longitude);
            // Use latitude and longitude as needed
          },
          (error) => {
            console.error("Error retrieving location:", error);
          }
        );
      }
    }
    if (startCamera) {
      document.querySelector("video").style.display = "none";
    }
    stopCamera();
  };

  //   Latitude
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=bc2abc7093d245acae0a604852e1ad47`
      );
      const data = await response.json();
      if (data.results.length >= 0) {
        const city = data.results[0].components.city;
        setCityName(city);
        const informations = data.results[0].components;
        setInformation(informations);
      } else {
        console.error("No results found for reverse geocoding.");
      }
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
    }
  };

  const degreesToDirection = (degrees) => {
    const directions = [
      "North",
      "North_East",
      "East",
      "South_East",
      "South",
      "South_West",
      "West",
      "North_West",
    ];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const getDayOfWeek = (dateString) => {
    const options = { weekday: "long" };
    const dayOfWeek = new Date(dateString).toLocaleDateString("en-US", options);
    return dayOfWeek;
  };

  const heandleClick = (index) => {
    if (forecastData && index >= 0 && index < forecastData.list.length) {
      const clickItem = forecastData.list[index];
      setClickItem(clickItem);
    }
  };
  return (
    <>
      <nav>
        <div className="container">
          <div className="d-flex gap-2">
            <div className="col-8">
              <input
                type="search"
                placeholder="search for location"
                className="w-100 py-2 px-4 rounded"
                name="search"
                value={cityName}
                onChange={heandleinput}
              />
            </div>
            <div className="col-4 text-end">
              <button onClick={heandlesubmit} className="w-100">
                click
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* home navbar */}
      <div className="container">
        <div className="d-flex justify-content-between gap-4">
          <button onClick={startCamera} className="w-100">
            Start Camera
          </button>
          <button onClick={stopCamera} className="w-100">
            off Camera
          </button>
          <button onClick={takePhoto} className="w-100">
            Take Photo
          </button>
        </div>
      </div>
      <div className="container">
        <div className="d-flex gap-3">
          <div className="col-4">
          {/* {clickItem && ( */}
            <div className="text-light p-3">
              {information && (
                <h1 className="fs-1 text center">{information.city}</h1>
              )}
              <div className="tables">
                <table>
                  {information && (
                    <>
                      <tbody>
                        <tr>
                          <th>Country:</th>
                          <td className="ps-5 border-bottom border-success w-100">
                            {information.country}
                          </td>
                        </tr>
                        <tr>
                          <th>Pin code:</th>
                          <td className="ps-5 border-bottom border-success w-100">
                            {information.postcode}
                          </td>
                        </tr>
                        <tr>
                          <th>village:</th>
                          <td className="ps-5 border-bottom border-success w-100">
                            {information.residential}
                          </td>
                        </tr>
                        <tr>
                          <th>Rode</th>
                          <td className="ps-5 border-bottom border-success w-100">
                            {information.road}
                          </td>
                        </tr>
                        <tr>
                          <th>Country:</th>
                          <td className="ps-5 border-bottom border-success w-100">
                            {information.country}
                          </td>
                        </tr>
                        <tr>
                          <th>State:</th>
                          <td className="ps-5 border-bottom border-success w-100">
                            {information.state} ({information.state_code})
                          </td>
                        </tr>
                      </tbody>
                    </>
                  )}
                </table>
              </div>
              {cityName && <p>City Name: {cityName}</p>}

              {photo && (
                <div>
                  <img src={photo} alt="Captured" className="w-50" />
                </div>
              )}

              <video ref={videoRef} autoPlay className="w-100" />
            </div>
            {/* )} */}
            {clickItem && (
              <div className="bg-light p-3 today_weather">
                {forecastData && (
                  <h1 className="fs-1 text-center py-3">
                    {forecastData.city.name}
                  </h1>
                )}

                <div className="d-flex gap-3">
                  <div className="col-6 justify-content-center d-flex">
                    <img
                      src={`https://openweathermap.org/img/w/${clickItem.weather[0].icon}.png`}
                      alt="Weather Icon"
                      className="clickItem_icon"
                    />
                  </div>
                  <div className="col-6">
                    <h1 className="fs-1">{clickItem.main.temp}°C</h1>
                  </div>
                </div>
                <div className="tables">
                  <table className="table today_weather">
                    <thead>
                      <tr>
                        <th>s.no.</th>
                        <th>information</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>Wind speed: </td>
                        <td>{clickItem.wind.speed} &nbsp; (m/s)</td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>Wind direction:</td>
                        <td>{degreesToDirection(clickItem.wind.deg)}</td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td>Weather:</td>
                        <td> {clickItem.weather[0].description}</td>
                      </tr>
                      <tr>
                        <td>4</td>
                        <td>Date</td>
                        <td>{clickItem.dt_txt}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <div className="col-8">
            <div>
              {todayWeather && (
                <div className="bg-light p-3 today_weather">
                  {forecastData && (
                    <h1 className="fs-1 text-center py-3">
                      {forecastData.city.name}
                    </h1>
                  )}

                  <div className="d-flex gap-1">
                    <div className="col-6 justify-content-center d-flex">
                      <img
                        src={`https://openweathermap.org/img/w/${todayWeather.weather[0].icon}.png`}
                        alt="Weather Icon"
                        className="todayweather_icon"
                      />
                    </div>
                    <div className="col-6">
                      <span className="fs-1 fw-bold h1">
                        {todayWeather.main.temp}°C
                      </span>
                      <div className="tables">
                        <table className="table today_weather">
                          <thead>
                            <tr>
                              <th>s.no.</th>
                              <th>information</th>
                              <th>Result</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>1</td>
                              <td>Wind speed: </td>
                              <td>{todayWeather.wind.speed} &nbsp; (m/s)</td>
                            </tr>
                            <tr>
                              <td>2</td>
                              <td>Wind direction:</td>
                              <td>
                                {degreesToDirection(todayWeather.wind.deg)}
                              </td>
                            </tr>
                            <tr>
                              <td>3</td>
                              <td>Weather:</td>
                              <td> {todayWeather.weather[0].description}</td>
                            </tr>
                            <tr>
                              <td>4</td>
                              <td>Date</td>
                              <td>{todayWeather.dt_txt}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {forecastData &&
              forecastData.list &&
              forecastData.list.length > 0 && (
                <div className="bg_infos p-3">
                  <h2 className="text-center py-2">Week Weather</h2>
                  <div className="row row-cols-1 row-cols-md-6 g-4  ">
                    {forecastData.list.map((forecast, index) => (
                      <div
                        key={index}
                        className="col"
                        onClick={() => heandleClick(index)}
                      >
                        <div className="bg_today p-3">
                          <p> {getDayOfWeek(forecast.dt_txt)}</p>
                          <p>{forecast.dt_txt}</p>
                          <img
                            src={`http://openweathermap.org/img/w/${forecast.weather[0].icon}.png`}
                            alt="Weather Icon"
                            className="forecast_width"
                          />
                          <p>{forecast.main.temp}°C</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
};
export default Home;
