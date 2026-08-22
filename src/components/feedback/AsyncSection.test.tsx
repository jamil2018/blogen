/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AsyncSection } from "./AsyncSection";

afterEach(() => {
  cleanup();
});

describe("AsyncSection", () => {
  it("shows skeleton when isLoading is true", () => {
    render(
      <AsyncSection
        isLoading
        skeleton={<div data-testid="skeleton">Loading...</div>}
      >
        <div data-testid="content">Loaded</div>
      </AsyncSection>
    );

    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
  });

  it("shows children when isLoading is false", () => {
    render(
      <AsyncSection
        isLoading={false}
        skeleton={<div data-testid="skeleton">Loading...</div>}
      >
        <div data-testid="content">Loaded</div>
      </AsyncSection>
    );

    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
  });

  it("shows custom error fallback when isError is true", () => {
    render(
      <AsyncSection
        isLoading={false}
        isError
        skeleton={<div data-testid="skeleton">Loading...</div>}
        errorFallback={<div data-testid="error">Failed</div>}
      >
        <div data-testid="content">Loaded</div>
      </AsyncSection>
    );

    expect(screen.getByTestId("error")).toBeInTheDocument();
    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
  });

  it("shows default ErrorState when isError and no errorFallback", () => {
    render(
      <AsyncSection
        isLoading={false}
        isError
        skeleton={<div data-testid="skeleton">Loading...</div>}
      >
        <div data-testid="content">Loaded</div>
      </AsyncSection>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
  });
});
