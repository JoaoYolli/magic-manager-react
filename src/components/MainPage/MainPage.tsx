import { useEffect, useState } from 'react';
import './MainPage.css'
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import CardComponent from '../CardComponent/CardComponent';
import CardModel from '../../models/card';

function MainPage() {
  const [cardList, setCardsList] = useState<CardModel[]>([]); // Initialize as an empty array
  const [isHovering, setIsHovering] = useState<boolean>(false); // New state for hover
  const navigate = useNavigate();
  
  const getItemFromLocalStorage = (key: string): string | null => {
    return localStorage.getItem(key);
  };

  async function searchRandCard(){
    fetch('https://api.scryfall.com/cards/random', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(async response => {
      if (!response.ok) {
        alert("Scryfall no funciona, no es mi culpa");
      } else {
        let respuesta = await response.json();
        let cards: CardModel[] = [];

        if (Array.isArray(respuesta)) {
          respuesta.forEach((card: { name: string; image_uris: { normal: string; }; scryfall_uri: string}) => {
            let carta: CardModel = {
              name: card.name,
              imgUrl: card.image_uris?.normal || '',
              scryfallUrl: card.scryfall_uri || ''
            };
            cards.push(carta);
          });
        } else {
          let carta: CardModel = {
            name: respuesta.name,
            imgUrl: respuesta.image_uris?.normal || '',
            scryfallUrl: respuesta.scryfall_uri || ''
          };
          cards.push(carta);
        }

        setCardsList(cards); 
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  async function init(){
    try {
      interface PostData {
        token: string;
      }

      const accessToken = getItemFromLocalStorage('accessToken') || '';

      let data: PostData = {
        token: accessToken
      };

      const response = await fetch(`${config.srvURL}:${config.serverPort}/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.status === 200) {
        const responseData = await response.json();
        sessionStorage.setItem('user', responseData.mail);
      } else {
        localStorage.setItem("accessToken", "");
        navigate('/');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  useEffect(() => {
    init();
    searchRandCard();

    const intervalo = setInterval(() => {
      if (!isHovering) {
        searchRandCard();
      }
    }, 20000); // 20 segundos = 20000 milisegundos

    return () => clearInterval(intervalo);
  }, [isHovering]); // Depend on isHovering

  return (
    <>
      {cardList.map((card, index) => (
        <CardComponent 
          key={index} 
          card={card}
        />
      ))}
    </>
  );
}

export default MainPage;
