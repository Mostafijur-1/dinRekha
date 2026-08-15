import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCloseDetailsOnSuccess } from "@/components/use-close-details-on-success";

function ExpandableForm({ state }: { state: { status: string } }) {
  const ref = useCloseDetailsOnSuccess(state);
  return (
    <details open ref={ref}>
      <summary>Edit</summary>
      <form />
    </details>
  );
}

describe("useCloseDetailsOnSuccess", () => {
  it("closes an expanded form after a successful mutation", () => {
    const { container, rerender } = render(
      <ExpandableForm state={{ status: "idle" }} />,
    );
    const details = container.querySelector("details")!;
    expect(details).toHaveAttribute("open");

    rerender(<ExpandableForm state={{ status: "success" }} />);

    expect(details).not.toHaveAttribute("open");
  });
});
