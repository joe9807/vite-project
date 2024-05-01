import SockJS from 'sockjs-client'
import { useEffect, useState, useRef } from 'react'
import './App.css'
import {Stomp} from "@stomp/stompjs";

function App() {
    const [logs, setLogs] = useState('');
    const [progress, setProgress] = useState('');

    useEffect(() => {
        let stompClient = Stomp.over(function(){
            return new SockJS("http://localhost:8080/migration-statistics");
        });
        stompClient.debug = () => {};
        stompClient.connect({}, frame =>{
            stompClient.onStompError = (error) => {
                console.log(error);
            };
            stompClient.subscribe("/topic/statistics", message =>{
                let statistics = JSON.parse(message.body);
                let result = "DONE: "+statistics.done+"; WARNINGS: "+statistics.warnings+"; FAILED: "+statistics.failed+"; INPROCESS: "+statistics.captured+"; NEW: "+statistics.created;
                setProgress(result);
                setLogs(statistics.logs);
            }, function(error) {
                // Обработка ошибки
                console.error('Ошибка при получении сообщения:', error);
            });
        });

        stompClient.onWebSocketError = function(event) {
            console.error('Произошла ошибка WebSocket:', event);
        };
    }, []);

    return (
        <>
            <div>
                <h2>Progress</h2>
                {progress}
                <h2>Логи</h2>
                {logs}
            </div>
        </>
    )
}

export default App
