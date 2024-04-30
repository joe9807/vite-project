import { useEffect, useState } from 'react'
import './App.css'
import {Observable} from "rxjs";

function AppOld() {
    const migrationFinished = "Миграция с данным id закончилась (или не стартовала).";

    const [data, setData] = useState();
    const [result, setResult] = useState();
    const [startId, setStartId] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [trigger, setTrigger] = useState(false);

    let configId = new URLSearchParams(window.location.search).get('configId')
    let eventId = 0;

    function checkConfig() {
            fetch(`http://localhost:8080/config?configId=${configId}`).then(response => {
                return response.json();
            }).then(result => {
                setTrigger(prevState => !prevState);
            }).catch(error =>{
                console.log(migrationFinished);
                setResult(migrationFinished);
            })
    }

    useEffect(() => {
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
                setTotalCount(prevState => prevState+1);
            },
            error: err => {
                if (err.target.readyState === EventSource.CONNECTING && err.message === undefined){
                    if (eventId === 0) {
                        checkConfig();
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
    }, [startId, trigger]);

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
