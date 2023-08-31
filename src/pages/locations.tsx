import { getLatestObservation, getLocation } from "@features/locations/api/locations"
import { BuoyLocationLatestObservation } from "@features/locations/types"
import { Box, Container, Divider, Paper, Stack, Typography } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { Item } from "components"
import { isEmpty } from "lodash"
import { useParams } from "react-router-dom"
import { formatDate } from "utils/common"

const LocationsPage = () => {
  const params = useParams()
  const { locationId } = params

  const { data: locationData } = useQuery(
    ['location', locationId],
    () => getLocation(locationId)
  )

  const {data: latestObservationData} = useQuery(['latest_observation'], () => getLatestObservation(locationId), {
    enabled: !!locationData?.location_id
  })

  const obsData = latestObservationData || []

  const lastestReported = obsData[0] || {}

  function renderLatestObservation(obsData: BuoyLocationLatestObservation[] | undefined) {
    if (!obsData || obsData.length === 0) return
    return (
      obsData.map((observation) => {
        return (
          <Box key={observation.id}>
            <Item>
              <Typography variant="subtitle2" color={"text.secondary"}>
                {observation.published && formatDate(observation.published)}
              </Typography>
            </Item>
            <Item>
              <Typography variant="h4" sx={{marginBottom: "2px"}}>{observation.significant_wave_height}</Typography>
              <Box>{observation.mean_wave_direction}</Box>
              <Box>{observation.dominant_wave_period}</Box>
              <Box>{observation.water_temp}</Box>
            </Item>
          </Box>
        )
      })
    ) 
  }

  function renderLastReported(row: BuoyLocationLatestObservation) {
    const {published, significant_wave_height, mean_wave_direction, dominant_wave_period, water_temp, wind_speed, wind_direction} = row
    return (
      <>
        <Paper sx={{ p: 2, maxWidth: 400 }}>
          <Typography sx={{marginBottom: 2}} variant="subtitle2" color={"text.secondary"}>{published && formatDate(published)}</Typography>
          <Stack direction="row" spacing={2}>
            <Stack direction="column" spacing={2}>
              <Typography variant="subtitle2" color={"text.secondary"}>wave height</Typography>
              <Typography variant="h3" sx={{marginBottom: "2px"}}>{significant_wave_height}</Typography>
            </Stack>
            <Divider orientation="vertical" flexItem />
            <Stack direction="column" spacing={2}>
              <Box><Typography variant="subtitle2" color={"text.secondary"}>mean direction</Typography>{mean_wave_direction}</Box>
              <Box><Typography variant="subtitle2" color={"text.secondary"}>wave period</Typography>{dominant_wave_period}</Box>
              <Box><Typography variant="subtitle2" color={"text.secondary"}>temperature</Typography>{water_temp}</Box>
            </Stack>
          </Stack>
        </Paper>
        { wind_direction && wind_speed && (
          <Box>
            <p>Wind data</p>
            <Item>
              {wind_speed}
            </Item>
            <Item>
              {wind_direction}
            </Item>
          </Box>
        )}
      </>
    )
  }
  
  return (
    <div>
      <Container>
        <h1>{locationData?.name}</h1>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Item>{locationData?.description}</Item>
          <Item>{locationData?.depth}</Item>
          <Item>{locationData?.location?.split("(")[0]}</Item>
        </Stack>
        <Box>
          <h2>Current conditions</h2>
          {lastestReported  && !isEmpty(lastestReported)? (
            <>
              <Stack spacing={2}>
                {renderLastReported(lastestReported)}
              </Stack>
            </>
          ) : (
            <Item><p>No current data</p></Item>
          )}
          
        </Box>
        <Box>
          <h2>Hourly conditions</h2>
          { obsData && !isEmpty(obsData) ? (
            <Stack direction={{ xs: 'column', sm: 'column', md: 'row' }} spacing={2}>
              {renderLatestObservation(obsData)}
            </Stack>
          ): (
            <Item><p>No current data</p></Item>
          )}
        </Box>
        <Box>
          <h2>Forecast</h2>
          <Item><p>No current data</p></Item>
        </Box>
      </Container>
    </div>
  )
}

export default LocationsPage