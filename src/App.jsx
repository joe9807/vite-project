import { useEffect, useState } from 'react'
import './App.css'
import {Observable} from "rxjs";

function App() {
    const [data, setData] = useState();
    const [result, setResult] = useState();
    const [startId, setStartId] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    let configId = '441c2eaf-b399-4de6-b4aa-93eb83e575b6';
    let eventId = 0;

    function getConfig() {
        fetch(`http://localhost:8080/config?configId=${configId}`)
            .then(response => {
                return response.json();
            })
            .then(config => {
                console.log("Поток ничего не вернул, но миграция "+config+" еще в процессе. Делаем перечитку.")

                setStartId(prevState => prevState - 1);
                setTotalCount(prevState => prevState - 1);
            }).catch(error =>{
                let message = "Миграция с данным id закончилась (или не стартовала)."
                console.log(message);
                setResult(message);
            })
    }

    useEffect(() => {
        let count = 0;

        // Функция, которая подписывается на поток изменений с сервера
        const dataStream = new Observable(observer => {
            const eventSource = new EventSource(`http://localhost:8080/monitor?configId=${configId}&id=${startId}`);

            eventSource.onmessage = event => {
                eventId = event.lastEventId;
                observer.next(event.data); // Отправка данных из сервера в поток
            };
            eventSource.onerror = error => {
                observer.error(error); // Обработка ошибок
            };
            return () => {
                eventSource.close();
            };
        });

        // Подписка на поток данных с сервера
        const subscription = dataStream.subscribe({
            next: newData => {
                setData(newData); // Обновление состояния компонента при получении новых данных
                count++;
                setTotalCount(prevState => prevState+1);
            },
            error: err => {
                if (err.target.readyState === EventSource.CONNECTING && err.message === undefined){
                    console.log(new Date().toLocaleTimeString()+": Поток стартовал с '"+startId+"' eventId; обработано '"+count+"' event(s); завершен на '"+eventId+"' eventId!");

                    if (eventId === 0) {
                        getConfig();
                    } else {
                        setStartId(eventId);
                    }
                } else {
                    console.error(err.message);
                }
            }
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [startId]);

    return (
        <>
            <div>
                <p>{configId}</p>
                <p>данные</p>
                <p>{totalCount.toLocaleString('ru-RU')}</p>
                <p>{data}</p>
                <p>{result}</p>
                <p>-----</p>
            </div>
        </>
    )
}

export default App
