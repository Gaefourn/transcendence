import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';

function timeLabelFormat(time : number) {
  if (time === 1)
    return "1 minute";
  if (time < 60)
    return time + " minutes";
  if (time === 60)
    return "1 hour";
  if (time < 84)
    return (time - 59) + " hours";
  if (time === 84)
    return "1 day";
  if (time < 114)
    return (time - 83) + " days";
  if (time === 114)
    return "1 year";
  return (time - 113) + " years";
}

function as_seconds(time: number): number {
  if (time < 60)
    return 60 * time;
  if (time < 84)
    return 60 * 60 * (time - 59);
  if (time < 114)
    return 60 * 60 * 24 * (time - 83);
  return 31536000 * (time - 113);
}

type Props = {
  action: string,
  onChange: (n: number) => void;
}

const Time: React.FC<Props> = ({ onChange, action }) => {
  const [time, setTime] = React.useState(1);

  const handleChange = (e: Event, n: number | number[]) => {
    setTime(n as never as number);
    onChange(as_seconds(n as never as number));
  }

  return (
    <Box sx={{ alignItems: "stretch"}}>
      <Typography gutterBottom>
        {action} for {timeLabelFormat(time)}
      </Typography>
      <Slider
        value={time}
        min={1}
        step={1}
        max={155}
        onChange={handleChange}
        valueLabelDisplay="off"
      />
    </Box>
  );
}

export default Time;
