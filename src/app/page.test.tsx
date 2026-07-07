import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

const STORAGE_KEY = "todos";

async function addTodo(user: ReturnType<typeof userEvent.setup>, text: string) {
  await user.type(screen.getByPlaceholderText("やることを入力..."), text);
  await user.click(screen.getByRole("button", { name: "追加" }));
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("Home (TODO app)", () => {
  it("shows the empty state and zero remaining count on first load", () => {
    render(<Home />);

    expect(screen.getByText("タスクがありません")).toBeInTheDocument();
    expect(screen.getByText("0 件残り")).toBeInTheDocument();
  });

  it("adds a todo, clears the input, and increments the remaining count", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await addTodo(user, "牛乳を買う");

    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.getByText("1 件残り")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("やることを入力...")).toHaveValue("");
  });

  it("does not add a todo when the input is empty or only whitespace", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: "追加" }));
    await addTodo(user, "   ");

    expect(screen.getByText("タスクがありません")).toBeInTheDocument();
    expect(screen.getByText("0 件残り")).toBeInTheDocument();
  });

  it("toggles a todo to completed, applying strikethrough and decrementing remaining count", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await addTodo(user, "牛乳を買う");

    await user.click(screen.getByRole("checkbox"));

    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByText("牛乳を買う")).toHaveClass("line-through");
    expect(screen.getByText("0 件残り")).toBeInTheDocument();
  });

  it("deletes a todo when the delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await addTodo(user, "牛乳を買う");
    await addTodo(user, "レポートを書く");

    const item = screen.getByText("牛乳を買う").closest("li")!;
    await user.click(within(item).getByRole("button", { name: "削除" }));

    expect(screen.queryByText("牛乳を買う")).not.toBeInTheDocument();
    expect(screen.getByText("レポートを書く")).toBeInTheDocument();
    expect(screen.getByText("1 件残り")).toBeInTheDocument();
  });

  it("filters todos by active and completed status", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await addTodo(user, "牛乳を買う");
    await addTodo(user, "レポートを書く");
    await user.click(
      within(screen.getByText("牛乳を買う").closest("li")!).getByRole(
        "checkbox",
      ),
    );

    await user.click(screen.getByRole("button", { name: "未完了" }));
    expect(screen.queryByText("牛乳を買う")).not.toBeInTheDocument();
    expect(screen.getByText("レポートを書く")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "完了済み" }));
    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.queryByText("レポートを書く")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "すべて" }));
    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.getByText("レポートを書く")).toBeInTheDocument();
  });

  it("removes only completed todos when 'clear completed' is clicked", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await addTodo(user, "牛乳を買う");
    await addTodo(user, "レポートを書く");
    await user.click(
      within(screen.getByText("牛乳を買う").closest("li")!).getByRole(
        "checkbox",
      ),
    );

    await user.click(screen.getByRole("button", { name: "完了済みを削除" }));

    expect(screen.queryByText("牛乳を買う")).not.toBeInTheDocument();
    expect(screen.getByText("レポートを書く")).toBeInTheDocument();
  });

  it("persists todos to localStorage and restores them after remount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Home />);
    await addTodo(user, "牛乳を買う");

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ text: "牛乳を買う", completed: false });

    unmount();
    render(<Home />);

    expect(await screen.findByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.getByText("1 件残り")).toBeInTheDocument();
  });
});
