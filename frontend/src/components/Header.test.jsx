import { render, screen, fireEvent } from "@testing-library/react";
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

  it("hides logout button and share button until the user menu is opened", () => {
    const user = { displayName: "Test User", photoURL: null, uid: "uid123" };
    renderHeader({ user });
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.queryByText("ログアウト")).not.toBeInTheDocument();
    expect(screen.queryByText("アプリを共有")).not.toBeInTheDocument();
  });

  it("displays logout button and share button after opening the user menu", () => {
    const user = { displayName: "Test User", photoURL: null, uid: "uid123" };
    renderHeader({ user });

    fireEvent.click(screen.getByRole("button", { name: "ユーザーメニュー" }));

    expect(screen.getByText("ログアウト")).toBeInTheDocument();
    expect(screen.getByText("アプリを共有")).toBeInTheDocument();
  });

  it("calls logout when the logout button in the menu is clicked", async () => {
    const logout = vi.fn().mockResolvedValue();
    const user = { displayName: "Test User", photoURL: null, uid: "uid123" };
    renderHeader({ user, logout });

    fireEvent.click(screen.getByRole("button", { name: "ユーザーメニュー" }));
    fireEvent.click(screen.getByText("ログアウト"));

    expect(logout).toHaveBeenCalled();
  });
});
