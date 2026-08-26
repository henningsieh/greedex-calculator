import type { ProjectSharedTransportEmissionProfile } from "@greendex/config/transport-emission-profiles";
import { NextIntlClientProvider } from "@greendex/i18n/client";
import messages from "@greendex/i18n/locales/en.json";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { TransportEmissionProfileSelect } from "@/features/project-shared-travel-legs/components/transport-emission-profile-select";

let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
});

function ProfileSelectionProbe() {
  const [value, setValue] = useState<ProjectSharedTransportEmissionProfile>();

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <TransportEmissionProfileSelect
        id="transport-emission-profile"
        onValueChange={setValue}
        value={value}
      />
      <output>{value}</output>
    </NextIntlClientProvider>
  );
}

describe("TransportEmissionProfileSelect", () => {
  it("lets an administrator select electric car and does not offer plane", () => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);

    act(() => {
      root?.render(<ProfileSelectionProbe />);
    });

    const trigger = document.querySelector<HTMLElement>('[role="combobox"]');
    expect(trigger).toBeTruthy();

    act(() => {
      trigger?.click();
    });

    const options = Array.from(
      document.querySelectorAll<HTMLElement>('[role="option"]'),
    );
    expect(options.map((option) => option.textContent)).toContain("Electric car");
    expect(options.map((option) => option.textContent)).not.toContain("Plane");

    const electricCar = options.find(
      (option) => option.textContent === "Electric car",
    );
    act(() => {
      electricCar?.click();
    });

    expect(container.querySelector("output")?.textContent).toBe("electricCar");
  });
});
