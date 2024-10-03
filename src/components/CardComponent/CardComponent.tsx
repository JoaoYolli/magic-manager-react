import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import CardModel from '../../models/card';

export default function CardComponent({card}: {card: CardModel}) {
  return (
    <Card sx={{ 
      maxWidth: 350, 
      maxHeight: 600,  // Limita la altura máxima de la carta
    }}>
      <CardActionArea href={card.scryfallUrl} target='_blank'>
        <CardMedia
          component="img"
          height="500"
          image={card.imgUrl}
          alt="IMG"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {card.name}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
