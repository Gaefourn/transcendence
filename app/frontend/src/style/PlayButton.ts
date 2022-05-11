import { CSSProperties } from '@mui/material/styles/createTypography';

const buttonStyle:CSSProperties = {
	fontSize: "18px",
	alignSelf: "center",
	height: "30px",
	width: "150px",
	borderRadius: "12px",
}
const styles:Record<string, CSSProperties> = {
	passive: buttonStyle,
	active:  { ...buttonStyle, backgroundColor: "#c80" },
	danger:  { ...buttonStyle, backgroundColor: "#d21" },
}

export default styles;
