import { useEffect, useState } from 'react'
import './App.css'
import {Observable} from "rxjs";

function App() {
    const [data, setData] = useState();
    const [startId, setStartId] = useState(0);
    let configId = '66c3f250-b76b-4cad-be8c-58c7ed91784f'

    useEffect(() => {
        let count = 0;
        let eventId = 0;

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
            },
            error: err => {
                if (err.target.readyState === EventSource.CONNECTING && err.message === undefined){
                    console.log("Поток стартовал с '"+startId+"' eventId; обработано '"+count+"' event(s); завершен на '"+eventId+"' eventId!");
                    setStartId(eventId);
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
                <p>данные</p>
                <p>{data}</p>
                <p>-----</p>
            </div>
        </>
    )
}

export default App
