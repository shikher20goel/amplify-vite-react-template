import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  return (
    <main style={{ display: 'flex', justifyContent: 'space-between', padding: '20px' }}>
      {/* Panel 1: Todo List */}
      <div style={{ width: '30%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h1>My todos</h1>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>{todo.content}</li>
          ))}
        </ul>
      </div>

      {/* Panel 2: Create Todo Button */}
      <div style={{ width: '30%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <button onClick={createTodo}>+ new</button>
      </div>

      {/* Panel 3: Additional Info */}
      <div style={{ width: '30%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
    </main>
  );
}

export default App;
