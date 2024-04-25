import { useEffect, useState } from 'react';
import { Observable } from 'rxjs'; // Библиотека для работы с реактивным программированием

const YourComponent = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Этот код будет выполнен после каждого рендеринга компонента
    document.title = `Вы кликнули ${count} раз`;
  }, [count]); // Зависимость: эффект запускается заново, если изменяется count

  return (
    <div>
      <p>Вы кликнули {count} раз</p>
      <button onClick={() => setCount(count + 1)}>
        Нажми на меня
      </button>
    </div>
  );
};

export default YourComponent;