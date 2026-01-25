import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Header from "./Header";
import { UserContext } from "../contexts/UserContext";

describe("Header Component", () => {
  const renderHeader = (userContextValue = {}) => {
    return render(
      <UserContext.Provider value={{
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
        ...userContextValue
      }}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </UserContext.Provider>
    );
  };

  it("renders the title and links to top page", () => {
    renderHeader();
    const titleLink = screen.getByRole("link", { name: /うちストック/i });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink.getAttribute("href")).toBe("/");
  });

  it("displays login button when not logged in", () => {
    renderHeader({ user: null });
    expect(screen.getByText("ログイン")).toBeInTheDocument();
  });

  it("displays user info and logout button when logged in", () => {
    const user = { displayName: "Test User", photoURL: null, uid: "uid123" };
    renderHeader({ user });
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("ログアウト")).toBeInTheDocument();
  });
});
