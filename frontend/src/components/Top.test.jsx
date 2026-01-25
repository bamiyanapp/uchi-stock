import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Top from "./Top";
import { UserContext } from "../contexts/UserContext";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Top Component", () => {
  const renderTop = (userContextValue) => {
    return render(
      <UserContext.Provider value={userContextValue}>
        <BrowserRouter>
          <Top />
        </BrowserRouter>
      </UserContext.Provider>
    );
  };

  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  it("does not redirect when userId is test-user", async () => {
    const contextValue = {
      userId: "test-user",
      login: vi.fn(),
      loading: false,
    };
    renderTop(contextValue);
    
    // リダイレクトされないことを確認
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("利用開始")).toBeInTheDocument();
  });

  it("does not redirect automatically even when userId is a real UID", async () => {
    const contextValue = {
      userId: "real-user-uid-123",
      login: vi.fn(),
      loading: false,
    };
    renderTop(contextValue);
    
    // 自動リダイレクトされないことを確認
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("利用開始")).toBeInTheDocument();
  });

  it("redirects after clicking start button when already logged in", async () => {
    const contextValue = {
      userId: "real-user-uid-123",
      login: vi.fn(),
      loading: false,
    };
    renderTop(contextValue);
    
    const startButton = screen.getByText("利用開始");
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.click(startButton);

    expect(mockNavigate).toHaveBeenCalledWith("/real-user-uid-123");
  });

  it("redirects after successful login when clicking start button", async () => {
    const loginMock = vi.fn().mockResolvedValue({ uid: "new-real-user-uid" });

    renderTop({
      userId: "test-user",
      login: loginMock,
      loading: false,
    });
    
    const startButton = screen.getByText("利用開始");
    const { fireEvent } = await import("@testing-library/react");
    await fireEvent.click(startButton);

    expect(loginMock).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/new-real-user-uid", { replace: true });
    });
  });
});
