import './LoginForm.css'
import config from '../../config'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginForm() {

  const getItemFromLocalStorage = (key: string): string | null => {
    return localStorage.getItem(key);
  };

  const navigate = useNavigate()

  useEffect(() => {
    // Esta función se ejecutará cuando el componente se monte
    const init = async () => {
      try {
        // Define el tipo de datos que enviarás
        interface PostData {
          token: string;
        }

        const accessToken = getItemFromLocalStorage('accessToken') || '';
        // Datos que deseas enviar en la solicitud POST
        let data: PostData = {
          token: accessToken // Asegúrate de que la variable `mail` esté definida
        };

        // Ejemplo de una solicitud de datos al montar el componente
        fetch(config.srvURL + ":" + config.serverPort + "/verify-token", {
          method: 'POST', // Método HTTP
          headers: {
            'Content-Type': 'application/json' // Indica que el cuerpo de la solicitud es JSON
          },
          body: JSON.stringify(data) // Convierte el objeto JS en un string JSON
        })
          .then(async response => {
            if (response.status == 200) {
              //Usuario loggeado
              const responseData = await response.json();
              sessionStorage.setItem('user', responseData.mail);
              navigate('/main')
            } else {
              localStorage.setItem("accessToken", "")
            }
          })
          .catch(error => {
            console.error('Error:', error); // Manejar errores
          });

      } catch (error) {
        console.error('Error:', error);
      }
    };

    init(); // Llamar a la función de inicialización
  }, []); // El array vacío [] asegura que useEffect se ejecute solo una vez, al montar

  // Estado para almacenar el codigo de verificacion
  const [code, setCode] = useState('');
  // Estado para almacenar el correo electrónico
  const [mail, setMail] = useState('');
  // Estado para saber si el correo fue enviado
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleChangeLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMail(e.target.value);  // Actualizamos el estado con el valor del input
  };

  const handleChangeVerification = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);  // Actualizamos el estado con el valor del input
  };

  function sendLoginForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const url = config.srvURL + ':' + config.serverPort + '/send-mail'; // URL de la API o endpoint
    setMail(mail)
    // Define el tipo de datos que enviarás
    interface PostData {
      mail: string;
    }

    // Datos que deseas enviar en la solicitud POST
    const data: PostData = {
      mail: mail // Asegúrate de que la variable `mail` esté definida
    };

    // Realizar la solicitud POST
    fetch(url, {
      method: 'POST', // Método HTTP
      headers: {
        'Content-Type': 'application/json' // Indica que el cuerpo de la solicitud es JSON
      },
      body: JSON.stringify(data) // Convierte el objeto JS en un string JSON
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error en la solicitud'); // Manejo de errores si la respuesta no es "ok"
        } else {
          setIsEmailSent(true); // Asegúrate de que `setIsEmailSent` esté definido
        }
      })
      .catch(error => {
        console.error('Error:', error); // Manejar errores
      });


  }

  function sendVerificationCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const url = config.srvURL + ':' + config.serverPort + '/verify-code'; // URL de la API o endpoint
    setMail(mail)
    // Define el tipo de datos que enviarás
    interface PostData {
      code: string;
      mail: string;
    }

    // Datos que deseas enviar en la solicitud POST
    const data: PostData = {
      code: code,
      mail: mail
    };

    // Realizar la solicitud POST
    fetch(url, {
      method: 'POST', // Método HTTP
      headers: {
        'Content-Type': 'application/json' // Indica que el cuerpo de la solicitud es JSON
      },
      body: JSON.stringify(data) // Convierte el objeto JS en un string JSON
    })
      .then(async response => {
        if (!response.ok) {
          alert("Incorrect code");
          throw new Error('Error en la solicitud'); // Manejo de errores si la respuesta no es "ok"
        } else {
          // Obtén el JSON de la respuesta
          const responseData = await response.json();
          localStorage.setItem('accessToken', responseData.token);
          navigate('/main')
        }

        setIsEmailSent(false);
      })
      .catch(error => {
        console.error('Error:', error); // Manejar errores
      });


  }

  return (
    <div id='form'>
      {!isEmailSent ? (
        <form onSubmit={sendLoginForm}>
          <h1>Login</h1>
          <input type='email' placeholder='yourmail@yourmail.com' onChange={handleChangeLogin} value={mail}></input>
          <button type='submit'>Receive mail</button>
        </form>
      ) : (
        <form onSubmit={sendVerificationCode}>
          <h1>Verification</h1>
          <input placeholder='XXXXXX' onChange={handleChangeVerification} value={code}></input>
          <button type='submit'>Verify</button>
        </form>
      )}
    </div>
  );
}

export default LoginForm