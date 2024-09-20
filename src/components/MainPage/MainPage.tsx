import { useEffect, useState } from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import CardComponent from '../CardComponent/CardComponent';
import CardModel from '../../models/card';

function MainPage() {
  const [cardList, setCardsList] = useState<CardModel[]>([]); // Initialize as an empty array
  const [searchingCommander, setSearchingCommander] = useState<boolean>(false); // State for Commander checkbox
  const navigate = useNavigate();

  const getItemFromLocalStorage = (key: string): string | null => {
    return localStorage.getItem(key);
  };

  async function searchRandCard() {

    let url = "";
        if(config.serverPort != 0){
          url = config.srvURL + ":" + config.serverPort;
        }else{
          url = config.srvURL
        }

    url += searchingCommander
      ? '/randCommander'
      : '/randCard';

    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          alert('Error en el servidor');
        } else {
          let respuesta = await response.json();
          let cards: CardModel[] = [];

          if (Array.isArray(respuesta)) {
            respuesta.forEach((card: { name: string; image_uris: { normal: string }; scryfall_uri: string }) => {
              let carta: CardModel = {
                name: card.name,
                imgUrl: card.image_uris?.normal || '',
                scryfallUrl: card.scryfall_uri || '',
              };
              cards.push(carta);
            });
          } else {
            respuesta = respuesta.respuesta;
            let carta: CardModel = {
              name: respuesta.name,
              imgUrl: respuesta.imgUrl || '',
              scryfallUrl: respuesta.scryfallUrl || '',
            };
            cards.push(carta);
          }
          setCardsList(cards);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  async function init() {
    try {
      interface PostData {
        token: string;
      }

      const accessToken = getItemFromLocalStorage('accessToken') || '';

      let data: PostData = {
        token: accessToken,
      };

      let url = "";
        if(config.serverPort != 0){
          url = config.srvURL + ":" + config.serverPort;
        }else{
          url = config.srvURL
        }

      const response = await fetch(`${url}/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.status === 200) {
        const responseData = await response.json();
        sessionStorage.setItem('user', responseData.mail);
      } else {
        localStorage.setItem('accessToken', '');
        navigate('/');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  useEffect(() => {
    init();
    searchRandCard(); // Get the first random card when the page loads
  }, [searchingCommander]); // Depend only on searchingCommander

  //Devuelve el html
  return (
    <>
      <div>
        <input
          type="checkbox"
          checked={searchingCommander}
          onChange={(e) => setSearchingCommander(e.target.checked)}
        />
        <label htmlFor="">Commander</label>
      </div>

      <button onClick={searchRandCard}>Cambiar Carta</button>

      {cardList.map((card, index) => (
        <CardComponent key={index} card={card} />
      ))}
    </>
  );
}

export default MainPage;
