"use client";

import { useEffect, useState } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "todos";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Reading localStorage must happen after mount to avoid a server/client hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setTodos(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, loaded]);

  function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: trimmed, completed: false },
    ]);
    setText("");
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });
  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 px-4 py-10 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-md dark:bg-gray-900">
        <h1 className="mb-5 text-center text-2xl font-bold tracking-wide text-gray-900 dark:text-gray-100">
          TODO
        </h1>

        <form onSubmit={addTodo} className="mb-4 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="やることを入力..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            追加
          </button>
        </form>

        <div className="mb-3 flex gap-2">
          {(
            [
              { key: "all", label: "すべて" },
              { key: "active", label: "未完了" },
              { key: "completed", label: "完了済み" },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-1 rounded-md border px-2 py-1 text-xs font-medium ${
                filter === f.key
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-gray-300 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ul className="max-h-90 min-h-10 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="py-5 text-center text-sm text-gray-400">
              タスクがありません
            </li>
          ) : (
            filtered.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 border-b border-gray-100 py-2 last:border-none dark:border-gray-800"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="h-4 w-4 shrink-0 cursor-pointer"
                />
                <span
                  className={`flex-1 break-words text-sm ${
                    todo.completed
                      ? "text-gray-400 line-through"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="削除"
                  className="shrink-0 px-1 text-lg leading-none text-red-500 hover:text-red-600"
                >
                  ×
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800">
          <span>{remaining} 件残り</span>
          <button
            onClick={clearCompleted}
            className="hover:text-red-500 hover:underline"
          >
            完了済みを削除
          </button>
        </div>
      </div>
    </div>
  );
}
