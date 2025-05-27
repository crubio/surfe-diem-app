import { Box } from "@mui/material"

type ImageBoxProps = {
    src: string;
    alt: string;
}

const ImageBox = (props: ImageBoxProps) => {
    const {src, alt} = props;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={src} alt={alt} style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
        </Box>
    )
}

export default ImageBox;