import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ShareButton from "./ShareButton";

describe("ShareButton Component", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  it("does not show the QR code modal until clicked", () => {
    render(<ShareButton getUrl={() => "https://example.com/uchi-stock/"} />);
    expect(screen.queryByText("URLをコピー")).not.toBeInTheDocument();
  });

  it("shows the QR code and URL when the trigger button is clicked", () => {
    render(<ShareButton getUrl={() => "https://example.com/uchi-stock/"} />);
    fireEvent.click(screen.getByText("アプリを共有"));
    expect(screen.getByText("https://example.com/uchi-stock/")).toBeInTheDocument();
    expect(screen.getByText("URLをコピー")).toBeInTheDocument();
  });

  it("copies the URL to the clipboard and shows a confirmation", async () => {
    render(<ShareButton getUrl={() => "https://example.com/uchi-stock/"} />);
    fireEvent.click(screen.getByText("アプリを共有"));
    fireEvent.click(screen.getByText("URLをコピー"));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://example.com/uchi-stock/");
    expect(await screen.findByText("コピーしました")).toBeInTheDocument();
  });

  it("closes the modal when the close button is clicked", () => {
    render(<ShareButton getUrl={() => "https://example.com/uchi-stock/"} />);
    fireEvent.click(screen.getByText("アプリを共有"));
    fireEvent.click(screen.getByText("閉じる"));
    expect(screen.queryByText("URLをコピー")).not.toBeInTheDocument();
  });
});
