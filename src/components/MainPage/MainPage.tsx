import { useEffect, useState } from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import CardComponent from '../CardComponent/CardComponent';
import CardModel from '../../models/card';

function MainPage() {
  const [cardList, setCardsList] = useState<CardModel[]>([]);
  const [searchingCommander, setSearchingCommander] = useState<boolean>(false);
  const [numberOfCards, setNumberOfCards] = useState<number>(1); // Estado para el número de cartas
  const [loading, setLoading] = useState<boolean>(false); // Estado para cargar cartas
  const navigate = useNavigate();

  const getItemFromLocalStorage = (key: string): string | null => {
    return localStorage.getItem(key);
  };

  async function searchRandCards(count: number) {
    let url = "";
    if (config.serverPort !== 0) {
      url = config.srvURL + ":" + config.serverPort;
    } else {
      url = config.srvURL;
    }

    const promises = []; // Para almacenar las promesas de búsqueda
    setLoading(true); // Establece loading en true al iniciar la búsqueda

    for (let i = 0; i < count; i++) {
      promises.push(fetch(url + (searchingCommander ? '/randCommander' : '/randCard'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(response => {
        if (!response.ok) {
          throw new Error('Error en el servidor');
        }
        return response.json();
      }));
    }

    try {
      const results = await Promise.all(promises);
      const newCards: CardModel[] = [];

      results.forEach(respuesta => {
        if (Array.isArray(respuesta)) {
          respuesta.forEach((card: { name: string; image_uris: { normal: string }; scryfall_uri: string }) => {
            let carta: CardModel = {
              name: card.name,
              imgUrl: card.image_uris?.normal || '',
              scryfallUrl: card.scryfall_uri || '',
            };
            newCards.push(carta);
          });
        } else {
          respuesta = respuesta.respuesta;
          let carta: CardModel = {
            name: respuesta.name,
            imgUrl: respuesta.imgUrl || '',
            scryfallUrl: respuesta.scryfallUrl || '',
          };
          newCards.push(carta);
        }
      });

      // Actualizar la lista de cartas agregando las nuevas sin sobrescribir
      setCardsList((prevCards) => [...prevCards, ...newCards]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false); // Establece loading en false después de recibir las cartas
    }
  }

  // Nueva función para eliminar todas las cartas
  const clearCards = () => {
    setCardsList([]); // Vacía la lista de cartas
  };

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
      if (config.serverPort !== 0) {
        url = config.srvURL + ":" + config.serverPort;
      } else {
        url = config.srvURL;
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
    searchRandCards(numberOfCards); // Busca cartas aleatorias según el número seleccionado
  }, []); // El array de dependencias vacío asegura que esto se ejecute solo una vez al montar

  return (
    <div className="main-page">
      {/* Sección de controles */}
      <div className="controls">
        <div>
          <label htmlFor="numberOfCards">Número de cartas:</label>
          <select
            id="numberOfCards"
            value={numberOfCards}
            onChange={(e) => setNumberOfCards(Number(e.target.value))}
          >
            {/* Genera opciones de 1 a 10 */}
            {[...Array(10)].map((_, index) => (
              <option key={index} value={index + 1}>{index + 1}</option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="checkbox"
            checked={searchingCommander}
            onChange={(e) => setSearchingCommander(e.target.checked)}
          />
          <label htmlFor="commander">Commander</label>
        </div>

        <button onClick={() => searchRandCards(numberOfCards)}>Cambiar Carta</button>

        {/* Botón para eliminar todas las cartas, visible solo si hay cartas */}
        {cardList.length > 0 && (
          <button onClick={clearCards}>Eliminar Todas las Cartas</button>
        )}
      </div>

      {/* Indicador de carga (spinner) */}
      {loading && <div className="spinner"></div>}

      {/* Sección scrollable de cartas */}
      <div className="card-grid">
        {cardList.map((card, index) => (
          <CardComponent key={index} card={card} />
        ))}
      </div>
    </div>
  );
}

export default MainPage;
