# EventSource + RxJS

Компонент использует RxJS для реактивной обработки потоков приходящего с BE.
Данные с BE не обязательно могут приходить одним запросом, поэтому запрос повторяется 
с параметром с которого начинать считывание сообщений на беке.
