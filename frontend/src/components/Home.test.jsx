import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter, MemoryRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import { UserContext } from "../contexts/UserContext";

// Mock API
const mockItems = [
  {
    itemId: "item-1",
    name: "トイレットペーパー",
    currentStock: 5,
    unit: "ロール",
    updatedAt: new Date().toISOString(),
  },
];

global.fetch = vi.fn();
global.alert = vi.fn();

const mockUserContext = {
  userId: "test-user",
  idToken: "test-token",
  user: { username: "testuser" },
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
};

const renderHome = () => {
  return render(
    <UserContext.Provider value={mockUserContext}>
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    </UserContext.Provider>
  );
};

describe("Home Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockImplementation((url) => {
      if (url.includes("/estimate")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ predictedStock: 5, stockPercentage: 50 }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockItems),
      });
    });
  });

  it("renders item list", async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText("トイレットペーパー")).toBeInTheDocument();
    });
  });

  it("shows add item form when clicking button", async () => {
    renderHome();
    const addButton = screen.getByText("新しい品目を追加");
    fireEvent.click(addButton);

    expect(screen.getByText("新しい品目の登録")).toBeInTheDocument();
    expect(screen.getByLabelText("品目名")).toBeInTheDocument();
    expect(screen.getByLabelText("単位")).toBeInTheDocument();
  });

  it("submits new item", async () => {
    fetch.mockImplementation((url, options) => {
      if (options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ itemId: "new-item", name: "ティッシュ", unit: "箱" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    renderHome();
    fireEvent.click(screen.getByText("新しい品目を追加"));

    fireEvent.change(screen.getByLabelText("品目名"), { target: { value: "ティッシュ" } });
    fireEvent.change(screen.getByLabelText("単位"), { target: { value: "箱" } });

    fireEvent.click(screen.getByText("登録する"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/items"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "ティッシュ", unit: "箱" }),
        })
      );
    });

    // Form should be closed
    expect(screen.queryByText("新しい品目の登録")).not.toBeInTheDocument();
  });

  it("displays predicted stock when available", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes("/estimate")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ predictedStock: 3, stockPercentage: 60 }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockItems),
      });
    });

    renderHome();
    await waitFor(() => {
      // predictedStock の 3 が表示されていることを確認
      expect(screen.getByText("3")).toBeInTheDocument();
      // currentStock の 5 ではないことを確認
      expect(screen.queryByText("5")).not.toBeInTheDocument();
    });
  });

  it("displays past history date when predictedStock equals currentStock and updatedAt is in the past", async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2); // 2日前

    const pastItems = [
      {
        itemId: "item-1",
        name: "トイレットペーパー",
        currentStock: 5,
        unit: "ロール",
        updatedAt: pastDate.toISOString(),
      },
    ];

    fetch.mockImplementation((url) => {
      if (url.includes("/estimate")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ predictedStock: 5, currentStock: 5, stockPercentage: 50 }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(pastItems),
      });
    });

    renderHome();
    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText(`${pastDate.toLocaleDateString()} 時点の情報`)).toBeInTheDocument();
    });
  });

  it("does not display past history date when predictedStock is different from currentStock (prediction mode)", async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);

    const pastItems = [
      {
        itemId: "item-1",
        name: "トイレットペーパー",
        currentStock: 5,
        unit: "ロール",
        updatedAt: pastDate.toISOString(),
      },
    ];

    fetch.mockImplementation((url) => {
      if (url.includes("/estimate")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ predictedStock: 3, currentStock: 5, stockPercentage: 30 }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(pastItems),
      });
    });

    renderHome();
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.queryByText(`${pastDate.toLocaleDateString()} 時点の情報`)).not.toBeInTheDocument();
    });
  });

  it("displays login user name when logged in", async () => {
    const loggedInUserContext = {
      ...mockUserContext,
      user: { displayName: "Logged In User", email: "user@example.com", uid: "uid123" },
      userId: "uid123",
    };

    render(
      <UserContext.Provider value={loggedInUserContext}>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Logged In User")).toBeInTheDocument();
    });
  });

  it("displays user icon when photoURL is available", async () => {
    const userWithPhoto = {
      ...mockUserContext,
      user: {
        displayName: "User With Photo",
        photoURL: "https://example.com/photo.jpg",
        uid: "uid123",
      },
      userId: "uid123",
    };

    render(
      <UserContext.Provider value={userWithPhoto}>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      const img = screen.getByAltText("User With Photo");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
    });
  });

  it("sends no authorization header when viewing demo-user even if logged in", async () => {
    const loggedInUserContext = {
      ...mockUserContext,
      userId: "real-user-uid",
      idToken: "real-user-token",
      user: { uid: "real-user-uid" },
    };

    render(
      <UserContext.Provider value={loggedInUserContext}>
        <MemoryRouter initialEntries={["/test-user"]}>
          <Routes>
            <Route path="/:userId" element={<Home />} />
          </Routes>
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/items"),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });
  });

  it("displays fallback icon when photoURL is not available", async () => {
    const userWithoutPhoto = {
      ...mockUserContext,
      user: {
        displayName: "User Without Photo",
        photoURL: null,
        uid: "uid456",
      },
      userId: "uid456",
    };

    render(
      <UserContext.Provider value={userWithoutPhoto}>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("User Without Photo")).toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
  });
});
