import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavHeader } from "@/components/NavHeader";

// next/link renders a plain anchor in test env; usePathname provides the current path
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// next/link just renders its href as an anchor in jsdom
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [k: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("NavHeader — hamburger button", () => {
  it("renders the hamburger button on mobile", () => {
    render(<NavHeader />);
    expect(screen.getByTestId("mobile-menu-button")).toBeInTheDocument();
  });

  it("hamburger button has aria-label 'Menu'", () => {
    render(<NavHeader />);
    expect(screen.getByTestId("mobile-menu-button")).toHaveAttribute(
      "aria-label",
      "Menu"
    );
  });

  it("hamburger has minimum 44px touch target via min-h class", () => {
    render(<NavHeader />);
    const btn = screen.getByTestId("mobile-menu-button");
    expect(btn.className).toMatch(/min-h-\[44px\]/);
  });

  it("starts with aria-expanded false and menu hidden", () => {
    render(<NavHeader />);
    expect(screen.getByTestId("mobile-menu-button")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.queryByTestId("mobile-nav-menu")).not.toBeInTheDocument();
  });
});

describe("NavHeader — open/close", () => {
  it("opens menu when hamburger is clicked", async () => {
    render(<NavHeader />);
    await userEvent.click(screen.getByTestId("mobile-menu-button"));
    expect(screen.getByTestId("mobile-nav-menu")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-menu-button")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("closes menu on second hamburger click (toggle)", async () => {
    render(<NavHeader />);
    const btn = screen.getByTestId("mobile-menu-button");
    await userEvent.click(btn);
    await userEvent.click(btn);
    expect(screen.queryByTestId("mobile-nav-menu")).not.toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  it("closes menu when Escape is pressed", async () => {
    render(<NavHeader />);
    await userEvent.click(screen.getByTestId("mobile-menu-button"));
    expect(screen.getByTestId("mobile-nav-menu")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByTestId("mobile-nav-menu")).not.toBeInTheDocument();
  });

  it("closes menu when clicking outside", async () => {
    render(
      <div>
        <NavHeader />
        <div data-testid="outside">Outside area</div>
      </div>
    );
    await userEvent.click(screen.getByTestId("mobile-menu-button"));
    expect(screen.getByTestId("mobile-nav-menu")).toBeInTheDocument();

    await userEvent.pointer({
      target: screen.getByTestId("outside"),
      keys: "[MouseLeft]",
    });
    expect(screen.queryByTestId("mobile-nav-menu")).not.toBeInTheDocument();
  });
});

describe("NavHeader — nav links", () => {
  it("renders all four nav links in mobile menu", async () => {
    render(<NavHeader />);
    await userEvent.click(screen.getByTestId("mobile-menu-button"));

    expect(
      screen.getByTestId("mobile-nav-link-dashboard")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("mobile-nav-link-mock-exams")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("mobile-nav-link-vocabulary")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("mobile-nav-link-grammar")
    ).toBeInTheDocument();
  });

  it("Dashboard link points to /", async () => {
    render(<NavHeader />);
    await userEvent.click(screen.getByTestId("mobile-menu-button"));
    expect(screen.getByTestId("mobile-nav-link-dashboard")).toHaveAttribute(
      "href",
      "/"
    );
  });

  it("Mock Exams link points to /exam", async () => {
    render(<NavHeader />);
    await userEvent.click(screen.getByTestId("mobile-menu-button"));
    expect(screen.getByTestId("mobile-nav-link-mock-exams")).toHaveAttribute(
      "href",
      "/exam"
    );
  });

  it("Vocabulary link points to /vocab", async () => {
    render(<NavHeader />);
    await userEvent.click(screen.getByTestId("mobile-menu-button"));
    expect(screen.getByTestId("mobile-nav-link-vocabulary")).toHaveAttribute(
      "href",
      "/vocab"
    );
  });

  it("Grammar link points to /grammar", async () => {
    render(<NavHeader />);
    await userEvent.click(screen.getByTestId("mobile-menu-button"));
    expect(screen.getByTestId("mobile-nav-link-grammar")).toHaveAttribute(
      "href",
      "/grammar"
    );
  });

  it("clicking a link closes the menu", async () => {
    render(<NavHeader />);
    await userEvent.click(screen.getByTestId("mobile-menu-button"));
    await userEvent.click(screen.getByTestId("mobile-nav-link-grammar"));
    expect(screen.queryByTestId("mobile-nav-menu")).not.toBeInTheDocument();
  });
});

describe("NavHeader — accessibility", () => {
  it("menu panel has role=dialog and aria-label", async () => {
    render(<NavHeader />);
    await userEvent.click(screen.getByTestId("mobile-menu-button"));
    const menu = screen.getByTestId("mobile-nav-menu");
    expect(menu).toHaveAttribute("role", "dialog");
    expect(menu).toHaveAttribute("aria-label", "Navigation menu");
  });

  it("hamburger has aria-controls pointing to menu id", async () => {
    render(<NavHeader />);
    expect(screen.getByTestId("mobile-menu-button")).toHaveAttribute(
      "aria-controls",
      "mobile-nav-menu"
    );
  });

  it("all mobile nav links have min 44px touch target via min-h", async () => {
    render(<NavHeader />);
    await userEvent.click(screen.getByTestId("mobile-menu-button"));
    const links = [
      screen.getByTestId("mobile-nav-link-dashboard"),
      screen.getByTestId("mobile-nav-link-mock-exams"),
      screen.getByTestId("mobile-nav-link-vocabulary"),
      screen.getByTestId("mobile-nav-link-grammar"),
    ];
    links.forEach((link) => {
      expect(link.className).toMatch(/min-h-\[44px\]/);
    });
  });
});
