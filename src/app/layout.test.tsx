import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import RootLayout, { metadata } from "./layout";

// RootLayout renders <html>/<body> as its root elements. Mounting that into
// an already-live jsdom document (as React Testing Library's render() does)
// produces invalid nested <html> tags, so we render to a markup string instead.
vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "font-sans-mock" }),
  Geist_Mono: () => ({ variable: "font-mono-mock" }),
}));

describe("RootLayout", () => {
  it("renders its children inside the body", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div data-testid="child">Content</div>
      </RootLayout>,
    );

    expect(html).toContain('data-testid="child"');
    expect(html).toContain(">Content<");
  });

  it("sets the html lang to Japanese and applies the expected classes", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div>Content</div>
      </RootLayout>,
    );

    expect(html).toContain('lang="ja"');
    expect(html).toContain(
      'class="font-sans-mock font-mono-mock h-full antialiased"',
    );
    expect(html).toContain('<body class="min-h-full flex flex-col">');
  });

  it("exports metadata with the expected title and description", () => {
    expect(metadata.title).toBe("TODOアプリ");
    expect(metadata.description).toBe("Next.jsで作るシンプルなTODOアプリ");
  });
});
