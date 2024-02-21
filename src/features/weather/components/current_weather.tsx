
interface CurrentWeatherProps {
  currentWeather: Record<string, unknown>
}

export const CurrentWeather = (props: CurrentWeatherProps) => {
  console.log(props)
  return (
    <>
      {/* <div>Current Weather</div> */}
    </>
  )
}
