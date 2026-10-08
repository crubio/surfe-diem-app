import { useState, type MouseEvent } from 'react';
import { Box, IconButton, Popover, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { SWELL_POWER_BANDS, getSwellPowerBand, waveEnergyFluxKwPerMeter } from 'utils/swell-power';

interface SwellPowerInfoProps {
  /** Current swell power, to highlight its band in the legend */
  power?: number | null;
  /** Height (m) and period (s) the power came from, for the kW/m grounding line */
  heightM?: number | null;
  periodS?: number | null;
  /** total_power, shown as "≈ N including wind chop and secondary swell" */
  totalPower?: number | null;
}

const formatRange = (min: number, max: number) =>
  max === Infinity ? `${min.toLocaleString('en-US')}+` : `${min.toLocaleString('en-US')}–${max.toLocaleString('en-US')}`;

/**
 * "What's swell power?" explainer: click-to-open (not hover, so it works on
 * phones). Band evidence: surfe-diem-api docs/wave-math.md, "Swell power bands".
 */
export const SwellPowerInfo = ({ power, heightM, periodS, totalPower }: SwellPowerInfoProps) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const currentBand = getSwellPowerBand(power);
  const kw = heightM != null && periodS != null && periodS > 0 ? waveEnergyFluxKwPerMeter(heightM, periodS) : null;

  const open = (event: MouseEvent<HTMLElement>) => {
    // The card around this is clickable (navigates); don't trigger it
    event.stopPropagation();
    setAnchor(event.currentTarget);
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label="What is swell power?"
        onClick={open}
        sx={{ p: 0.25, color: 'text.secondary' }}
      >
        <InfoOutlinedIcon sx={{ fontSize: '1rem' }} />
      </IconButton>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 2, maxWidth: 320 } } }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          Swell power
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.5 }}>
          Height and period combined. Period counts double, favoring groundswell as opposed to wind waves.
        </Typography>

        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', mb: 1.5, '& td': { py: 0.25, fontSize: '0.8125rem' } }}>
          <tbody>
            {SWELL_POWER_BANDS.map((band) => {
              const isCurrent = band === currentBand;
              return (
                <Box
                  component="tr"
                  key={band.label}
                  sx={{ fontWeight: isCurrent ? 700 : 400, color: isCurrent ? 'text.primary' : 'text.secondary' }}
                >
                  <td>{band.label}</td>
                  <td>{formatRange(band.min, band.max)}</td>
                  <td>≈ {band.example}</td>
                </Box>
              );
            })}
          </tbody>
        </Box>

        {kw != null && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            ≈ {kw.toFixed(1)} kW per meter of wave crest by the standard wave power formula.
          </Typography>
        )}
        {totalPower != null && power != null && totalPower > power && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            ≈ {Math.round(totalPower).toLocaleString('en-US')} including wind chop and any secondary swell.
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
          Measures the swell arriving, not how a spot surfs. Exposure, bottom and wind decide that.
        </Typography>
      </Popover>
    </>
  );
};
