import SockJS from 'sockjs-client'
import { useEffect, useState, useRef } from 'react'
import './App.css'
import {Stomp} from "@stomp/stompjs";

function App() {
    const [logs, setLogs] = useState('');
    const [progress, setProgress] = useState('');
    let stompClient;

    useEffect(() => {
        const client = new SockJS("http://localhost:8080/migration-statistics");
        stompClient = Stomp.over(client);
        stompClient.debug = () => {};
        stompClient.connect({}, frame =>{
            stompClient.subscribe("/topic/logs", message =>{
                setLogs(message.body);
            });

            stompClient.subscribe("/topic/progress", message =>{
                let statistics = JSON.parse(message.body);
                let result = "DONE: "+statistics.done+"; WARNINGS: "+statistics.warnings+"; FAILED: "+statistics.failed+"; INPROCESS: "+statistics.captured+"; NEW: "+statistics.created;
                setProgress(result);
            })
        });
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
