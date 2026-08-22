/**
 * @vitest-environment jsdom
 */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  cleanup();
});
import {
  KPICardSkeletonRow,
  StudioPageFallback,
  TableSkeleton,
} from "./StudioSkeleton";

describe("StudioSkeleton", () => {
  it("renders KPICardSkeletonRow without crashing", () => {
    const { container } = render(<KPICardSkeletonRow />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders TableSkeleton without crashing", () => {
    const { container } = render(<TableSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders StudioPageFallback without crashing", () => {
    const { container } = render(<StudioPageFallback />);
    expect(container.firstChild).toBeTruthy();
  });
});
